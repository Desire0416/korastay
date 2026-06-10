"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export type DestResult = { ok: boolean; error?: string; message?: string };

const schema = z.object({
  name: z.string().min(2, "Nom requis"),
  region: z.string().optional(),
  country: z.string().optional(),
  description: z.string().optional(),
  heroImageUrl: z.string().optional(),
  priority: z.coerce.number().int().min(0).default(5),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  isActive: z.string().optional(),
});

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base);
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.destination.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) break;
    slug = `${slugify(base)}-${i++}`;
  }
  return slug;
}

export async function saveDestination(id: string | null, _prev: DestResult, formData: FormData): Promise<DestResult> {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  const data = {
    name: d.name,
    region: d.region || null,
    country: d.country || "Cote d'Ivoire",
    description: d.description || null,
    heroImageUrl: d.heroImageUrl || null,
    priority: d.priority,
    latitude: d.latitude ?? null,
    longitude: d.longitude ?? null,
    isActive: d.isActive === "on" || d.isActive === "true" || d.isActive === "1",
  };

  if (id) {
    await prisma.destination.update({ where: { id }, data });
    revalidatePath("/admin/destinations");
    revalidatePath("/destinations");
    return { ok: true, message: "Destination mise a jour." };
  }

  const slug = await uniqueSlug(d.name);
  await prisma.destination.create({ data: { ...data, slug } });
  revalidatePath("/admin/destinations");
  revalidatePath("/destinations");
  redirect("/admin/destinations?created=1");
}

export async function toggleDestinationActive(id: string): Promise<DestResult> {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const dest = await prisma.destination.findUnique({ where: { id }, select: { isActive: true } });
  if (!dest) return { ok: false, error: "Introuvable." };
  await prisma.destination.update({ where: { id }, data: { isActive: !dest.isActive } });
  revalidatePath("/admin/destinations");
  revalidatePath("/destinations");
  return { ok: true, message: dest.isActive ? "Destination desactivee." : "Destination activee." };
}

export async function deleteDestination(id: string): Promise<DestResult> {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const counts = await prisma.destination.findUnique({
    where: { id },
    select: { _count: { select: { residences: true, packs: true } } },
  });
  if (!counts) return { ok: false, error: "Introuvable." };
  if (counts._count.residences > 0 || counts._count.packs > 0) {
    return { ok: false, error: "Impossible : des residences ou packs sont lies. Desactivez-la plutot." };
  }
  await prisma.destination.delete({ where: { id } });
  revalidatePath("/admin/destinations");
  return { ok: true, message: "Destination supprimee." };
}
