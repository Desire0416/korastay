"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getServiceFeeRate } from "@/lib/settings";
import { generateReference } from "@/lib/utils";

export type CustomPackResult = { ok: boolean; error?: string; message?: string; id?: string; reference?: string };

export interface CustomPackInput {
  cityName: string;
  destinationId?: string | null;
  serviceIds: string[];
  persons: number;
  startDate?: string;
  notes?: string;
  contactName: string;
  email: string;
  phone?: string;
}

export async function submitCustomPack(input: CustomPackInput): Promise<CustomPackResult> {
  const user = await getCurrentUser();

  if (!input.cityName) return { ok: false, error: "Choisissez une ville." };
  if (!input.serviceIds || input.serviceIds.length === 0) return { ok: false, error: "Sélectionnez au moins une activité ou un service." };
  if (!input.contactName?.trim() || !input.email?.includes("@")) return { ok: false, error: "Nom et email valides requis." };

  // Re-charge les services (prix faisant foi cote serveur)
  const services = await prisma.partnerService.findMany({
    where: { id: { in: input.serviceIds }, isActive: true, partnerProfile: { verificationStatus: "VERIFIED" } },
    include: { partnerProfile: { select: { id: true, type: true, businessName: true, userId: true } } },
  });
  if (services.length === 0) return { ok: false, error: "Services indisponibles." };

  const subtotal = services.reduce((sum, s) => sum + (s.priceFrom ?? 0), 0);
  const rate = await getServiceFeeRate();
  const serviceFee = Math.round(subtotal * rate);
  const estimatedTotal = subtotal + serviceFee;

  const reference = generateReference("KC");
  const request = await prisma.customPackRequest.create({
    data: {
      reference,
      userId: user?.id ?? null,
      destinationId: input.destinationId ?? null,
      cityName: input.cityName,
      contactName: input.contactName.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      persons: input.persons > 0 ? input.persons : 2,
      notes: input.notes?.trim() || null,
      estimatedTotal,
      status: "NEW",
      items: {
        create: services.map((s) => ({
          partnerServiceId: s.id,
          partnerProfileId: s.partnerProfile.id,
          partnerType: s.partnerProfile.type,
          partnerName: s.partnerProfile.businessName,
          label: s.title,
          priceFrom: s.priceFrom ?? 0,
        })),
      },
    },
  });

  // Notifie les admins
  const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN", "SUPPORT"] } }, select: { id: true } });
  if (admins.length) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id, title: "Nouveau pack personnalisé",
        body: `${input.contactName} a compose un pack a ${input.cityName} (${services.length} prestation(s)).`,
        type: "CUSTOM_PACK", url: `/admin/custom-packs/${request.id}`,
      })),
    });
  }

  // Notifie chaque partenaire sollicite (utilisateurs distincts)
  const partnerUserIds = [...new Set(services.map((s) => s.partnerProfile.userId))];
  await prisma.notification.createMany({
    data: partnerUserIds.map((uid) => ({
      userId: uid, title: "Vous etes sollicite pour un pack",
      body: `Un voyageur vous a inclus dans un pack personnalisé a ${input.cityName}.`,
      type: "CUSTOM_PACK", url: "/partner/missions",
    })),
  });

  revalidatePath("/admin/custom-packs");
  if (user) revalidatePath("/account/custom-packs");
  return { ok: true, id: request.id, reference };
}

// ---- Devis (admin) ----
export async function sendCustomPackQuote(id: string, _prev: CustomPackResult, formData: FormData): Promise<CustomPackResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const amount = Number(formData.get("quoteAmount"));
  const message = String(formData.get("quoteMessage") ?? "");
  if (!amount || amount < 1000) return { ok: false, error: "Montant du devis invalide (min 1000 F CFA)." };
  const req = await prisma.customPackRequest.findUnique({ where: { id } });
  if (!req) return { ok: false, error: "Introuvable." };

  await prisma.customPackRequest.update({ where: { id }, data: { quoteAmount: amount, quoteMessage: message || null, status: "QUOTED" } });
  if (req.userId) {
    await prisma.notification.create({ data: { userId: req.userId, title: "Devis pour votre pack personnalisé", body: `Votre pack ${req.reference} : devis de ${amount} F CFA disponible.`, type: "CUSTOM_PACK", url: "/account/custom-packs" } });
  }
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "CUSTOM_PACK_QUOTE", entityType: "CustomPackRequest", entityId: id, metadata: JSON.stringify({ amount }) } });
  revalidatePath("/admin/custom-packs");
  revalidatePath(`/admin/custom-packs/${id}`);
  revalidatePath("/account/custom-packs");
  return { ok: true, message: "Devis envoyé au client." };
}

// ---- Acceptation du devis (voyageur) ----
export async function acceptCustomPackQuote(id: string): Promise<CustomPackResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non autorise." };
  const req = await prisma.customPackRequest.findUnique({ where: { id } });
  if (!req) return { ok: false, error: "Introuvable." };
  const staff = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (req.userId !== user.id && !staff) return { ok: false, error: "Accès refuse." };
  if (req.status !== "QUOTED") return { ok: false, error: "Aucun devis a accepter." };

  await prisma.customPackRequest.update({ where: { id }, data: { status: "CONFIRMED" } });
  const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } }, select: { id: true } });
  if (admins.length) {
    await prisma.notification.createMany({ data: admins.map((a) => ({ userId: a.id, title: "Devis pack perso accepte", body: `${req.contactName} a accepte le devis (${req.reference}).`, type: "CUSTOM_PACK", url: `/admin/custom-packs/${id}` })) });
  }
  revalidatePath("/account/custom-packs");
  revalidatePath(`/admin/custom-packs/${id}`);
  return { ok: true, message: "Devis accepte ! Notre équipe finalisé votre pack." };
}

// ---- Conversion en reservation + missions partenaires (admin) ----
export async function convertCustomPackToReservation(id: string): Promise<CustomPackResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const req = await prisma.customPackRequest.findUnique({ where: { id }, include: { items: true } });
  if (!req) return { ok: false, error: "Introuvable." };
  if (req.reservationId) return { ok: false, error: "Ce pack est déjà converti en réservation." };
  if (!req.userId) return { ok: false, error: "Le voyageur doit avoir un compte KoraStay pour générer une réservation." };
  const traveler = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!traveler) return { ok: false, error: "Voyageur introuvable." };

  const start = req.startDate ?? new Date();
  const end = new Date(new Date(start).getTime() + 24 * 60 * 60 * 1000);
  const subtotal = req.items.reduce((s, i) => s + i.priceFrom, 0);
  const total = req.quoteAmount ?? req.estimatedTotal;
  const serviceFee = Math.max(0, total - subtotal);

  const reservation = await prisma.reservation.create({
    data: {
      reference: generateReference("KX"),
      type: "CUSTOM_PACK", status: "CONFIRMED", travelerId: traveler.id,
      startDate: start, endDate: end, nights: 1, adults: req.persons, children: 0,
      guestName: req.contactName, guestEmail: req.email, guestPhone: req.phone,
      subtotalAmount: subtotal, serviceFeeAmount: serviceFee, totalAmount: total,
      notes: `Pack personnalisé ${req.reference} a ${req.cityName}`,
      confirmedAt: new Date(),
      payments: { create: { method: "MANUAL", status: "PAID", amount: total, provider: "manual", paidAt: new Date() } },
    },
  });

  // Une mission confirmee par partenaire du panier
  for (const item of req.items) {
    if (!item.partnerProfileId) continue;
    await prisma.partnerMission.create({
      data: {
        partnerProfileId: item.partnerProfileId, reservationId: reservation.id,
        title: item.label, description: `Mission issue du pack personnalisé ${req.reference}.`,
        city: req.cityName, scheduledAt: start, status: "PROPOSED", amount: item.priceFrom,
      },
    });
    const partner = await prisma.partnerProfile.findUnique({ where: { id: item.partnerProfileId }, select: { userId: true } });
    if (partner) {
      await prisma.notification.create({ data: { userId: partner.userId, title: "Nouvelle mission confirmée", body: `Mission "${item.label}" a ${req.cityName} (pack ${req.reference}).`, type: "PARTNER_MISSION", url: "/partner/missions" } });
    }
  }

  await prisma.customPackRequest.update({ where: { id }, data: { status: "CONFIRMED", reservationId: reservation.id } });
  await prisma.notification.create({ data: { userId: traveler.id, title: "Votre pack personnalisé est confirmé", body: `Votre pack ${req.reference} est confirmé. Référence réservation : ${reservation.reference}.`, type: "RESERVATION_CONFIRMED", url: `/account/bookings/${reservation.id}` } });
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "CUSTOM_PACK_CONVERTED", entityType: "CustomPackRequest", entityId: id, metadata: JSON.stringify({ reservationId: reservation.id }) } });

  revalidatePath("/admin/custom-packs");
  revalidatePath(`/admin/custom-packs/${id}`);
  return { ok: true, id: reservation.id, message: "Pack converti en réservation et missions partenaires créées." };
}

// ---- Actions admin ----
export async function setCustomPackStatus(id: string, status: string): Promise<CustomPackResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const req = await prisma.customPackRequest.findUnique({ where: { id } });
  if (!req) return { ok: false, error: "Introuvable." };
  await prisma.customPackRequest.update({ where: { id }, data: { status } });
  if (req.userId) {
    await prisma.notification.create({
      data: { userId: req.userId, title: "Mise a jour de votre pack personnalisé", body: `Votre pack ${req.reference} : ${status}.`, type: "CUSTOM_PACK", url: "/account/custom-packs" },
    });
  }
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "CUSTOM_PACK_STATUS", entityType: "CustomPackRequest", entityId: id, metadata: JSON.stringify({ status }) } });
  revalidatePath("/admin/custom-packs");
  revalidatePath(`/admin/custom-packs/${id}`);
  return { ok: true };
}
