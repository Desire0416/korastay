"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export type PartnerResult = { ok: boolean; error?: string; message?: string };

async function getProfile(userId: string) {
  return prisma.partnerProfile.findUnique({ where: { userId } });
}

export async function createPartnerService(_prev: PartnerResult, formData: FormData): Promise<PartnerResult> {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const profile = await getProfile(user.id);
  if (!profile) return { ok: false, error: "Completez d'abord votre profil partenaire." };

  const schema = z.object({
    title: z.string().min(2, "Titre requis"),
    description: z.string().optional(),
    city: z.string().optional(),
    priceFrom: z.coerce.number().int().min(0).optional(),
    duration: z.string().optional(),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  await prisma.partnerService.create({
    data: {
      partnerProfileId: profile.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      city: parsed.data.city || profile.city,
      priceFrom: parsed.data.priceFrom ?? null,
      duration: parsed.data.duration || null,
    },
  });
  redirect("/partner/services");
}

export async function toggleService(serviceId: string): Promise<PartnerResult> {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const service = await prisma.partnerService.findUnique({
    where: { id: serviceId },
    include: { partnerProfile: { select: { userId: true } } },
  });
  if (!service || service.partnerProfile.userId !== user.id) return { ok: false, error: "Introuvable." };
  await prisma.partnerService.update({ where: { id: serviceId }, data: { isActive: !service.isActive } });
  revalidatePath("/partner/services");
  return { ok: true };
}

export async function respondToMission(missionId: string, accept: boolean): Promise<PartnerResult> {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const mission = await prisma.partnerMission.findUnique({
    where: { id: missionId },
    include: { partnerProfile: { select: { userId: true } } },
  });
  if (!mission || mission.partnerProfile.userId !== user.id) return { ok: false, error: "Introuvable." };
  await prisma.partnerMission.update({
    where: { id: missionId },
    data: { status: accept ? "ACCEPTED" : "REFUSED" },
  });
  revalidatePath("/partner/missions");
  revalidatePath(`/partner/missions/${missionId}`);
  return { ok: true, message: accept ? "Mission acceptee." : "Mission refusee." };
}
