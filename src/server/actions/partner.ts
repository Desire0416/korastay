"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export type PartnerResult = { ok: boolean; error?: string; message?: string; values?: Record<string, string> };

async function getProfile(userId: string) {
  return prisma.partnerProfile.findUnique({ where: { userId } });
}

const toJsonList = (raw: FormDataEntryValue | null) => {
  const items = String(raw ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return items.length ? JSON.stringify(items) : null;
};

// ============================================================
// Onboarding obligatoire (apres verification, avant le dashboard)
// ============================================================
export async function completePartnerOnboarding(_prev: PartnerResult, formData: FormData): Promise<PartnerResult> {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const profile = await getProfile(user.id);
  if (!profile) return { ok: false, error: "Profil partenaire introuvable." };

  const values = Object.fromEntries(formData) as Record<string, string>;
  const idDocumentUrl = String(formData.get("idDocumentUrl") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();

  if (!idDocumentUrl) return { ok: false, error: "La pièce d'identité est obligatoire.", values };
  if (description.length < 20) return { ok: false, error: "Decrivez votre activité (20 caractères minimum).", values };
  if (!phone) return { ok: false, error: "Un numéro de téléphone est requis.", values };
  if (!city) return { ok: false, error: "Indiquez votre ville.", values };

  const data: Record<string, unknown> = {
    idDocumentUrl,
    description,
    phone,
    city,
    whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
    zonesCovered: toJsonList(formData.get("zonesCovered")),
    languages: toJsonList(formData.get("languages")),
    coverImageUrl: String(formData.get("coverImageUrl") ?? "").trim() || null,
    onboardingCompletedAt: new Date(),
  };

  // Chauffeur : permis + vehicule obligatoires.
  if (profile.type === "TRANSPORT") {
    const drivingLicenseUrl = String(formData.get("drivingLicenseUrl") ?? "").trim();
    const vehicleType = String(formData.get("vehicleType") ?? "").trim();
    if (!drivingLicenseUrl) return { ok: false, error: "Le permis de conduire est obligatoire pour un chauffeur.", values };
    if (!vehicleType) return { ok: false, error: "Indiquez le type de véhicule.", values };
    data.drivingLicenseUrl = drivingLicenseUrl;
    data.vehicleType = vehicleType;
    data.vehicleBrand = String(formData.get("vehicleBrand") ?? "").trim() || null;
    data.vehiclePlate = String(formData.get("vehiclePlate") ?? "").trim() || null;
    const seats = Number(formData.get("vehicleSeats"));
    data.vehicleSeats = Number.isFinite(seats) && seats > 0 ? Math.round(seats) : null;
  }

  if (profile.type === "RESTAURANT") {
    data.cuisineType = String(formData.get("cuisineType") ?? "").trim() || null;
  }

  await prisma.partnerProfile.update({ where: { id: profile.id }, data });
  await prisma.notification.createMany({
    data: (await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } }, select: { id: true } })).map((a) => ({
      userId: a.id,
      title: "Configuration partenaire terminée",
      body: `${profile.businessName} a complète sa configuration.`,
      type: "PARTNER",
      url: "/admin/partners",
    })),
  });
  redirect("/partner?onboarded=1");
}

// Mise a jour du vehicule (chauffeur).
export async function savePartnerVehicle(_prev: PartnerResult, formData: FormData): Promise<PartnerResult> {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const profile = await getProfile(user.id);
  if (!profile) return { ok: false, error: "Profil introuvable." };
  if (profile.type !== "TRANSPORT") return { ok: false, error: "Reserve aux chauffeurs." };

  const vehicleType = String(formData.get("vehicleType") ?? "").trim();
  if (!vehicleType) return { ok: false, error: "Le type de véhicule est requis." };
  const seats = Number(formData.get("vehicleSeats"));

  await prisma.partnerProfile.update({
    where: { id: profile.id },
    data: {
      vehicleType,
      vehicleBrand: String(formData.get("vehicleBrand") ?? "").trim() || null,
      vehiclePlate: String(formData.get("vehiclePlate") ?? "").trim() || null,
      vehicleSeats: Number.isFinite(seats) && seats > 0 ? Math.round(seats) : null,
      drivingLicenseUrl: String(formData.get("drivingLicenseUrl") ?? "").trim() || profile.drivingLicenseUrl,
    },
  });
  revalidatePath("/partner/vehicle");
  revalidatePath("/partner");
  return { ok: true, message: "Véhicule mis a jour." };
}

// ============================================================
// Menu restaurant (plats avec image + prix)
// ============================================================
export async function saveMenuItem(_prev: PartnerResult, formData: FormData): Promise<PartnerResult> {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const profile = await getProfile(user.id);
  if (!profile) return { ok: false, error: "Profil introuvable." };
  if (profile.type !== "RESTAURANT") return { ok: false, error: "Reserve aux restaurants." };

  const schema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Nom du plat requis"),
    description: z.string().optional(),
    price: z.coerce.number().int().min(0),
    category: z.string().optional(),
    imageUrl: z.string().optional(),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  if (d.id) {
    const existing = await prisma.partnerMenuItem.findFirst({ where: { id: d.id, partnerProfileId: profile.id }, select: { id: true } });
    if (!existing) return { ok: false, error: "Plat introuvable." };
    await prisma.partnerMenuItem.update({
      where: { id: d.id },
      data: { name: d.name, description: d.description || null, price: d.price, category: d.category || null, imageUrl: d.imageUrl || null },
    });
  } else {
    const count = await prisma.partnerMenuItem.count({ where: { partnerProfileId: profile.id } });
    await prisma.partnerMenuItem.create({
      data: { partnerProfileId: profile.id, name: d.name, description: d.description || null, price: d.price, category: d.category || null, imageUrl: d.imageUrl || null, sortOrder: count },
    });
  }
  revalidatePath("/partner/menu");
  return { ok: true, message: "Menu enregistré." };
}

export async function deleteMenuItem(itemId: string): Promise<PartnerResult> {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const profile = await getProfile(user.id);
  if (!profile) return { ok: false, error: "Profil introuvable." };
  const item = await prisma.partnerMenuItem.findFirst({ where: { id: itemId, partnerProfileId: profile.id }, select: { id: true } });
  if (!item) return { ok: false, error: "Plat introuvable." };
  await prisma.partnerMenuItem.delete({ where: { id: itemId } });
  revalidatePath("/partner/menu");
  return { ok: true, message: "Plat supprimé." };
}

export async function toggleMenuItem(itemId: string): Promise<PartnerResult> {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const profile = await getProfile(user.id);
  if (!profile) return { ok: false, error: "Profil introuvable." };
  const item = await prisma.partnerMenuItem.findFirst({ where: { id: itemId, partnerProfileId: profile.id }, select: { id: true, isAvailable: true } });
  if (!item) return { ok: false, error: "Plat introuvable." };
  await prisma.partnerMenuItem.update({ where: { id: itemId }, data: { isAvailable: !item.isAvailable } });
  revalidatePath("/partner/menu");
  return { ok: true };
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
  return { ok: true, message: accept ? "Mission acceptée." : "Mission refusée." };
}
