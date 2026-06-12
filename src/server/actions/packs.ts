"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export type PackItemInput = { label: string; details?: string; included: boolean };
export type PackActivityInput = { timeLabel?: string; title: string; description?: string };
export type PackDayInput = { title: string; description?: string; activities: PackActivityInput[] };

export type PackInput = {
  id?: string;
  name: string;
  destinationId: string | null;
  subtitle?: string;
  description: string;
  durationDays: number;
  durationNights: number;
  basePersons: number;
  maxPersons: number;
  price: number;
  extraPersonPrice: number;
  status: string;
  meetingPoint?: string;
  startTime?: string;
  physicalLevel?: string;
  clothingRecommendations?: string;
  documentsToBring?: string;
  cancellationPolicy?: string;
  includedItems: PackItemInput[];
  programDays: PackDayInput[];
};

export type PackResult = { ok: boolean; error?: string; message?: string; id?: string };

async function uniquePackSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base);
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.pack.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) break;
    slug = `${slugify(base)}-${i++}`;
  }
  return slug;
}

export async function savePack(input: PackInput): Promise<PackResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);

  if (!input.name || input.name.trim().length < 3) return { ok: false, error: "Le nom du pack est requis (3 caractères min)." };
  if (!input.description || input.description.trim().length < 20) return { ok: false, error: "La description doit faire au moins 20 caractères." };
  if (!input.price || input.price < 1000) return { ok: false, error: "Le prix doit être d'au moins 1000 F CFA." };
  if (input.maxPersons < input.basePersons) return { ok: false, error: "Le nombre max de personnes doit être >= au nombre de base." };

  const includedItems = (input.includedItems ?? []).filter((i) => i.label?.trim());
  const programDays = (input.programDays ?? []).filter((d) => d.title?.trim());

  const data = {
    name: input.name.trim(),
    subtitle: input.subtitle?.trim() || null,
    description: input.description.trim(),
    destinationId: input.destinationId || null,
    durationDays: input.durationDays,
    durationNights: input.durationNights,
    basePersons: input.basePersons,
    maxPersons: input.maxPersons,
    price: input.price,
    extraPersonPrice: input.extraPersonPrice ?? 0,
    status: input.status,
    meetingPoint: input.meetingPoint?.trim() || null,
    startTime: input.startTime?.trim() || null,
    physicalLevel: input.physicalLevel?.trim() || null,
    clothingRecommendations: input.clothingRecommendations?.trim() || null,
    documentsToBring: input.documentsToBring?.trim() || null,
    cancellationPolicy: input.cancellationPolicy?.trim() || null,
    includedText: includedItems.filter((i) => i.included).map((i) => i.label).join(", "),
    notIncludedText: includedItems.filter((i) => !i.included).map((i) => i.label).join(", "),
  };

  // ---- Edition ----
  if (input.id) {
    const existing = await prisma.pack.findUnique({ where: { id: input.id }, select: { id: true } });
    if (!existing) return { ok: false, error: "Pack introuvable." };

    await prisma.$transaction(async (tx) => {
      await tx.pack.update({ where: { id: input.id! }, data });
      await tx.packIncludedItem.deleteMany({ where: { packId: input.id! } });
      await tx.packProgramDay.deleteMany({ where: { packId: input.id! } }); // cascade activites
      for (const [idx, item] of includedItems.entries()) {
        await tx.packIncludedItem.create({
          data: { packId: input.id!, label: item.label.trim(), details: item.details?.trim() || null, included: item.included, sortOrder: idx },
        });
      }
      for (const [di, day] of programDays.entries()) {
        await tx.packProgramDay.create({
          data: {
            packId: input.id!, dayNumber: di + 1, title: day.title.trim(), description: day.description?.trim() || null, sortOrder: di,
            activities: { create: (day.activities ?? []).filter((a) => a.title?.trim()).map((a, ai) => ({ timeLabel: a.timeLabel?.trim() || null, title: a.title.trim(), description: a.description?.trim() || null, sortOrder: ai })) },
          },
        });
      }
    });

    revalidatePath("/admin/packs");
    revalidatePath(`/admin/packs/${input.id}/edit`);
    revalidatePath("/packs");
    return { ok: true, id: input.id, message: "Pack mis a jour avec succès." };
  }

  // ---- Creation ----
  const slug = await uniquePackSlug(input.name);
  const pack = await prisma.pack.create({
    data: {
      ...data,
      slug,
      heroImageUrl: `https://picsum.photos/seed/pack-${slug}/1200/900`,
      images: {
        create: [1, 2, 3, 4].map((n) => ({ url: `https://picsum.photos/seed/pack-${slug}-${n}/1200/900`, altText: `${data.name} ${n}`, sortOrder: n - 1, isCover: n === 1 })),
      },
      includedItems: {
        create: includedItems.map((item, idx) => ({ label: item.label.trim(), details: item.details?.trim() || null, included: item.included, sortOrder: idx })),
      },
      programDays: {
        create: programDays.map((day, di) => ({
          dayNumber: di + 1, title: day.title.trim(), description: day.description?.trim() || null, sortOrder: di,
          activities: { create: (day.activities ?? []).filter((a) => a.title?.trim()).map((a, ai) => ({ timeLabel: a.timeLabel?.trim() || null, title: a.title.trim(), description: a.description?.trim() || null, sortOrder: ai })) },
        })),
      },
    },
  });

  await prisma.auditLog.create({ data: { actorId: admin.id, action: "PACK_CREATED", entityType: "Pack", entityId: pack.id } });
  revalidatePath("/admin/packs");
  revalidatePath("/packs");
  redirect("/admin/packs?created=1");
}

export async function deletePack(id: string): Promise<PackResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const reservations = await prisma.reservation.count({ where: { packId: id } });
  if (reservations > 0) {
    return { ok: false, error: "Impossible de supprimer : des réservations existent pour ce pack. Depubliez-le plutôt." };
  }
  try {
    await prisma.pack.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Suppression impossible (le pack est référence ailleurs). Depubliez-le plutôt." };
  }
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "PACK_DELETED", entityType: "Pack", entityId: id } });
  revalidatePath("/admin/packs");
  return { ok: true, message: "Pack supprimé." };
}
