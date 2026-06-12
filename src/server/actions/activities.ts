"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export type ActivityResult = { ok: boolean; error?: string; message?: string };

const schema = z.object({
  name: z.string().min(3, "Nom requis"),
  category: z.string().min(1),
  city: z.string().min(2, "Ville requise"),
  description: z.string().min(20, "Description trop courte (20 caractères min)"),
  shortDescription: z.string().optional(),
  durationHours: z.coerce.number().int().min(1).max(72),
  pricePerPerson: z.coerce.number().int().min(0),
  minPersons: z.coerce.number().int().min(1),
  maxPersons: z.coerce.number().int().min(1),
  difficulty: z.string().optional(),
  included: z.string().optional(),
  meetingPoint: z.string().optional(),
  isPublished: z.string().optional(),
});

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base);
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.activity.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) break;
    slug = `${slugify(base)}-${i++}`;
  }
  return slug;
}

export async function saveActivity(id: string | null, _prev: ActivityResult, formData: FormData): Promise<ActivityResult> {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const d = parsed.data;
  const status = d.isPublished === "on" || d.isPublished === "true" ? "PUBLISHED" : "DRAFT";
  const destination = await prisma.destination.findFirst({ where: { name: { equals: d.city } }, select: { id: true } });

  const data = {
    name: d.name,
    category: d.category,
    city: d.city,
    destinationId: destination?.id ?? null,
    description: d.description,
    shortDescription: d.shortDescription?.trim() || d.description.slice(0, 120),
    durationHours: d.durationHours,
    pricePerPerson: d.pricePerPerson,
    minPersons: d.minPersons,
    maxPersons: Math.max(d.maxPersons, d.minPersons),
    difficulty: d.difficulty?.trim() || null,
    included: d.included?.trim() || null,
    meetingPoint: d.meetingPoint?.trim() || null,
    status,
  };

  if (id) {
    await prisma.activity.update({ where: { id }, data });
    revalidatePath("/admin/activities");
    revalidatePath("/activites");
    return { ok: true, message: "Activité mise a jour." };
  }

  const slug = await uniqueSlug(d.name);
  const created = await prisma.activity.create({
    data: {
      ...data,
      slug,
      images: {
        create: [1, 2, 3].map((n) => ({
          url: `https://picsum.photos/seed/act-${slug}-${n}/1200/900`,
          altText: `${d.name} - ${n}`,
          sortOrder: n - 1,
          isCover: n === 1,
        })),
      },
    },
  });
  revalidatePath("/admin/activities");
  revalidatePath("/activites");
  redirect(`/admin/activities/${created.id}/edit?created=1`);
}

export async function toggleActivityPublish(id: string): Promise<ActivityResult> {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const a = await prisma.activity.findUnique({ where: { id }, select: { status: true } });
  if (!a) return { ok: false, error: "Introuvable." };
  const next = a.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  await prisma.activity.update({ where: { id }, data: { status: next } });
  revalidatePath("/admin/activities");
  revalidatePath("/activites");
  return { ok: true, message: next === "PUBLISHED" ? "Activité publiée." : "Activité dépubliée." };
}

export async function deleteActivity(id: string): Promise<ActivityResult> {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  await prisma.activity.delete({ where: { id } });
  revalidatePath("/admin/activities");
  revalidatePath("/activites");
  return { ok: true, message: "Activité supprimée." };
}

// --- Images (reutilise PhotosManager) ---
export async function addActivityImage(activityId: string, url: string): Promise<ActivityResult> {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const count = await prisma.activityImage.count({ where: { activityId } });
  await prisma.activityImage.create({ data: { activityId, url, sortOrder: count, isCover: count === 0 } });
  revalidatePath(`/admin/activities/${activityId}/edit`);
  return { ok: true };
}

export async function deleteActivityImage(imageId: string): Promise<ActivityResult> {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const img = await prisma.activityImage.findUnique({ where: { id: imageId } });
  if (!img) return { ok: false, error: "Introuvable." };
  await prisma.activityImage.delete({ where: { id: imageId } });
  if (img.isCover) {
    const next = await prisma.activityImage.findFirst({ where: { activityId: img.activityId }, orderBy: { sortOrder: "asc" } });
    if (next) await prisma.activityImage.update({ where: { id: next.id }, data: { isCover: true } });
  }
  revalidatePath(`/admin/activities/${img.activityId}/edit`);
  return { ok: true };
}

export async function setActivityCoverImage(imageId: string): Promise<ActivityResult> {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const img = await prisma.activityImage.findUnique({ where: { id: imageId } });
  if (!img) return { ok: false, error: "Introuvable." };
  await prisma.$transaction([
    prisma.activityImage.updateMany({ where: { activityId: img.activityId }, data: { isCover: false } }),
    prisma.activityImage.update({ where: { id: imageId }, data: { isCover: true } }),
  ]);
  revalidatePath(`/admin/activities/${img.activityId}/edit`);
  return { ok: true };
}
