"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, type SessionUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export type OwnerResult = { ok: boolean; error?: string; message?: string; id?: string; values?: Record<string, string> };

const residenceSchema = z.object({
  name: z.string().min(3, "Nom requis"),
  type: z.enum(["STUDIO", "T2", "T3", "VILLA"]),
  city: z.string().min(2, "Ville requise"),
  district: z.string().optional(),
  address: z.string().optional(),
  description: z.string().min(20, "Description trop courte (20 caracteres min)"),
  shortDescription: z.string().optional(),
  capacity: z.coerce.number().int().min(1),
  bedrooms: z.coerce.number().int().min(0),
  beds: z.coerce.number().int().min(1),
  bathrooms: z.coerce.number().int().min(1),
  pricePerNight: z.coerce.number().int().min(1000, "Prix minimum 1000 F CFA"),
  cleaningFee: z.coerce.number().int().min(0).default(0),
  depositAmount: z.coerce.number().int().min(0).default(0),
  cautionEnabled: z.coerce.boolean().optional().default(false),
  cautionJustification: z.string().optional(),
  isHighDemand: z.coerce.boolean().optional().default(false),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  houseRules: z.string().optional(),
});

function isAdminUser(user: SessionUser) {
  return user.role === "ADMIN" || user.role === "SUPER_ADMIN";
}

/** Where-clause autorisant l'admin sur toute residence, l'owner sur les siennes. */
function residenceScope(user: SessionUser, id: string) {
  return isAdminUser(user) ? { id } : { id, ownerId: user.id };
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let i = 1;
  while (await prisma.residence.findUnique({ where: { slug } })) {
    slug = `${slugify(base)}-${i++}`;
  }
  return slug;
}

export async function createResidence(_prev: OwnerResult, formData: FormData): Promise<OwnerResult> {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const admin = isAdminUser(user);

  const parsed = residenceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide.", values: Object.fromEntries(formData) as Record<string, string> };
  }
  const d = parsed.data;
  const amenityIds = formData.getAll("amenities").map(String);
  const scope = String(formData.get("scope") ?? "owner");

  // L'admin peut attribuer la residence a un proprietaire ; sinon = utilisateur courant.
  const requestedOwnerId = String(formData.get("ownerId") ?? "");
  let effectiveOwnerId = user.id;
  if (admin && requestedOwnerId) {
    const targetOwner = await prisma.user.findUnique({ where: { id: requestedOwnerId }, select: { id: true } });
    if (!targetOwner) return { ok: false, error: "Proprietaire selectionne introuvable." };
    effectiveOwnerId = targetOwner.id;
  }

  // L'admin peut publier directement ; un owner soumet a validation.
  const requestedStatus = String(formData.get("status") ?? "");
  const publishNow = admin && requestedStatus === "PUBLISHED";

  const destination = await prisma.destination.findFirst({ where: { name: { equals: d.city } } });
  const slug = await uniqueSlug(d.name);

  const residence = await prisma.residence.create({
    data: {
      ownerId: effectiveOwnerId,
      cityId: destination?.id ?? null,
      slug,
      name: d.name,
      type: d.type,
      city: d.city,
      district: d.district || null,
      address: d.address || null,
      description: d.description,
      shortDescription: d.shortDescription || d.description.slice(0, 120),
      capacity: d.capacity,
      bedrooms: d.bedrooms,
      beds: d.beds,
      bathrooms: d.bathrooms,
      pricePerNight: d.pricePerNight,
      cleaningFee: d.cleaningFee,
      depositAmount: d.depositAmount,
      cautionEnabled: d.cautionEnabled,
      cautionJustification: d.cautionJustification || null,
      isHighDemand: d.isHighDemand,
      checkInTime: d.checkInTime || "14:00",
      checkOutTime: d.checkOutTime || "11:00",
      houseRules: d.houseRules || null,
      status: publishNow ? "PUBLISHED" : "PENDING_VALIDATION",
      verificationStatus: publishNow ? "VERIFIED" : "PENDING_REVIEW",
      isVerified: publishNow,
      badgeLabel: publishNow ? "Residence verifiee KoraStay" : null,
      publishedAt: publishNow ? new Date() : null,
      images: {
        create: [1, 2, 3, 4].map((n) => ({
          url: `https://picsum.photos/seed/${slug}-${n}/1200/900`,
          altText: `${d.name} - photo ${n}`,
          sortOrder: n - 1,
          isCover: n === 1,
        })),
      },
      amenities: amenityIds.length
        ? { create: amenityIds.map((amenityId) => ({ amenityId })) }
        : undefined,
    },
  });

  if (admin) {
    await prisma.auditLog.create({
      data: { actorId: user.id, action: "RESIDENCE_CREATED_ADMIN", entityType: "Residence", entityId: residence.id },
    });
  } else {
    const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } }, select: { id: true } });
    if (admins.length) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id, title: "Residence a valider",
          body: `${d.name} (${d.city}) attend une validation.`,
          type: "ADMIN_VALIDATION", url: `/admin/residences/${residence.id}`,
        })),
      });
    }
  }

  revalidatePath("/admin/residences");
  revalidatePath("/residences");
  redirect(scope === "admin" ? `/admin/residences/${residence.id}?created=1` : `/owner/residences/${residence.id}?created=1`);
}

export async function updateResidence(id: string, _prev: OwnerResult, formData: FormData): Promise<OwnerResult> {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const existing = await prisma.residence.findFirst({ where: residenceScope(user, id) });
  if (!existing) return { ok: false, error: "Residence introuvable." };

  const parsed = residenceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const d = parsed.data;
  const amenityIds = formData.getAll("amenities").map(String);

  // L'admin peut aussi changer le statut de publication via le formulaire.
  const requestedStatus = String(formData.get("status") ?? "");
  const statusPatch: {
    status?: string; isVerified?: boolean; verificationStatus?: string;
    publishedAt?: Date; badgeLabel?: string;
  } = {};
  if (isAdminUser(user) && ["PUBLISHED", "PENDING_VALIDATION", "UNPUBLISHED"].includes(requestedStatus)) {
    statusPatch.status = requestedStatus;
    if (requestedStatus === "PUBLISHED") {
      statusPatch.isVerified = true;
      statusPatch.verificationStatus = "VERIFIED";
      statusPatch.publishedAt = existing.publishedAt ?? new Date();
      statusPatch.badgeLabel = existing.badgeLabel ?? "Residence verifiee KoraStay";
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.residence.update({
      where: { id },
      data: {
        name: d.name, type: d.type, city: d.city, district: d.district || null,
        address: d.address || null, description: d.description,
        shortDescription: d.shortDescription || d.description.slice(0, 120),
        capacity: d.capacity, bedrooms: d.bedrooms, beds: d.beds, bathrooms: d.bathrooms,
        pricePerNight: d.pricePerNight, cleaningFee: d.cleaningFee, depositAmount: d.depositAmount,
        cautionEnabled: d.cautionEnabled, cautionJustification: d.cautionJustification || null, isHighDemand: d.isHighDemand,
        checkInTime: d.checkInTime || "14:00", checkOutTime: d.checkOutTime || "11:00",
        houseRules: d.houseRules || null,
        ...statusPatch,
      },
    });
    await tx.residenceAmenity.deleteMany({ where: { residenceId: id } });
    if (amenityIds.length) {
      await tx.residenceAmenity.createMany({
        data: amenityIds.map((amenityId) => ({ residenceId: id, amenityId })),
      });
    }
  });

  if (isAdminUser(user)) {
    await prisma.auditLog.create({ data: { actorId: user.id, action: "RESIDENCE_UPDATED_ADMIN", entityType: "Residence", entityId: id } });
  }
  revalidatePath(`/owner/residences/${id}`);
  revalidatePath(`/admin/residences/${id}`);
  revalidatePath("/residences");
  return { ok: true, message: "Residence mise a jour." };
}

export async function toggleResidencePublish(id: string): Promise<OwnerResult> {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const residence = await prisma.residence.findFirst({ where: residenceScope(user, id) });
  if (!residence) return { ok: false, error: "Introuvable." };
  if (!["PUBLISHED", "UNPUBLISHED"].includes(residence.status)) {
    return { ok: false, error: "La residence doit etre validee avant publication." };
  }
  const next = residence.status === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
  await prisma.residence.update({ where: { id }, data: { status: next, publishedAt: next === "PUBLISHED" ? new Date() : residence.publishedAt } });
  revalidatePath("/owner/residences");
  revalidatePath(`/owner/residences/${id}`);
  revalidatePath(`/admin/residences/${id}`);
  return { ok: true, message: next === "PUBLISHED" ? "Residence publiee." : "Residence depubliee." };
}

export async function addAvailabilityBlock(formData: FormData): Promise<OwnerResult> {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const residenceId = String(formData.get("residenceId"));
  const start = new Date(String(formData.get("startDate")));
  const end = new Date(String(formData.get("endDate")));
  const reason = String(formData.get("reason") ?? "Indisponible");

  const residence = await prisma.residence.findFirst({ where: residenceScope(user, residenceId) });
  if (!residence) return { ok: false, error: "Introuvable." };
  if (end <= start) return { ok: false, error: "La date de fin doit etre apres le debut." };

  await prisma.residenceAvailabilityBlock.create({
    data: { residenceId, startDate: start, endDate: end, reason, createdById: user.id },
  });
  revalidatePath("/owner/calendar");
  return { ok: true, message: "Periode bloquee." };
}

export async function removeAvailabilityBlock(blockId: string): Promise<OwnerResult> {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const block = await prisma.residenceAvailabilityBlock.findUnique({
    where: { id: blockId }, include: { residence: { select: { ownerId: true } } },
  });
  if (!block || (!isAdminUser(user) && block.residence.ownerId !== user.id)) {
    return { ok: false, error: "Introuvable." };
  }
  await prisma.residenceAvailabilityBlock.delete({ where: { id: blockId } });
  revalidatePath("/owner/calendar");
  return { ok: true };
}

// ---- Gestion photos ----
export async function addResidenceImage(residenceId: string, url: string): Promise<OwnerResult> {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const residence = await prisma.residence.findFirst({ where: residenceScope(user, residenceId), include: { images: true } });
  if (!residence) return { ok: false, error: "Introuvable." };
  await prisma.residenceImage.create({
    data: { residenceId, url, sortOrder: residence.images.length, isCover: residence.images.length === 0 },
  });
  revalidatePath(`/owner/residences/${residenceId}/photos`);
  revalidatePath(`/admin/residences/${residenceId}/photos`);
  return { ok: true };
}

export async function deleteResidenceImage(imageId: string): Promise<OwnerResult> {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const image = await prisma.residenceImage.findUnique({ where: { id: imageId }, include: { residence: { select: { ownerId: true, id: true } } } });
  if (!image || (!isAdminUser(user) && image.residence.ownerId !== user.id)) return { ok: false, error: "Introuvable." };
  await prisma.residenceImage.delete({ where: { id: imageId } });
  revalidatePath(`/owner/residences/${image.residence.id}/photos`);
  revalidatePath(`/admin/residences/${image.residence.id}/photos`);
  return { ok: true };
}

// ---- Reponse de l'hote a un avis ----
export async function replyToReview(reviewId: string, reply: string): Promise<OwnerResult> {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const text = reply.trim();
  if (!text) return { ok: false, error: "Reponse vide." };

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { residence: { select: { ownerId: true } }, author: { select: { id: true } } },
  });
  if (!review) return { ok: false, error: "Avis introuvable." };
  if (!isAdminUser(user) && review.residence?.ownerId !== user.id) {
    return { ok: false, error: "Cet avis ne concerne pas vos residences." };
  }

  await prisma.review.update({ where: { id: reviewId }, data: { ownerReply: text } });

  // Notifie l'auteur de l'avis
  if (review.author?.id) {
    await prisma.notification.create({
      data: {
        userId: review.author.id,
        title: "Reponse a votre avis",
        body: "L'hote a repondu a votre avis.",
        type: "REVIEW_REPLY",
        url: "/account/reviews",
      },
    });
  }

  revalidatePath("/owner/reviews");
  revalidatePath("/admin/reviews");
  return { ok: true, message: "Reponse publiee." };
}

export async function setCoverImage(imageId: string): Promise<OwnerResult> {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const image = await prisma.residenceImage.findUnique({ where: { id: imageId }, include: { residence: { select: { ownerId: true, id: true } } } });
  if (!image || (!isAdminUser(user) && image.residence.ownerId !== user.id)) return { ok: false, error: "Introuvable." };
  await prisma.$transaction([
    prisma.residenceImage.updateMany({ where: { residenceId: image.residence.id }, data: { isCover: false } }),
    prisma.residenceImage.update({ where: { id: imageId }, data: { isCover: true, sortOrder: -1 } }),
  ]);
  revalidatePath(`/owner/residences/${image.residence.id}/photos`);
  revalidatePath(`/admin/residences/${image.residence.id}/photos`);
  return { ok: true };
}
