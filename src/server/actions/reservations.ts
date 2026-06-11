"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isStaff } from "@/lib/messaging";
import {
  computeResidencePrice, computePackPrice, computeDeposit,
  estimateResidenceRefund, estimatePackRefund,
} from "@/lib/pricing";
import { generateReference, nightsBetween, formatPrice } from "@/lib/utils";
import { getPaymentProvider } from "@/lib/payments";
import { sendEmail, emailLayout } from "@/lib/email";
import { RESIDENCE_VALIDATION_HOURS, PACK_VALIDATION_DAYS } from "@/lib/constants";
import { getServiceFeeRate } from "@/lib/settings";

export type ReservationResult = {
  ok: boolean;
  error?: string;
  reservationId?: string;
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

async function notifyAdmins(title: string, body: string, url: string) {
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN", "SUPPORT"] } },
    select: { id: true },
  });
  if (admins.length === 0) return;
  await prisma.notification.createMany({
    data: admins.map((a) => ({ userId: a.id, title, body, type: "RESERVATION_REQUEST", url })),
  });
}

// ============================================================
// 1. Demande de reservation RESIDENCE (en attente de validation)
// ============================================================
const residenceSchema = z.object({
  residenceId: z.string().min(1),
  checkin: z.string().min(8),
  checkout: z.string().min(8),
  adults: z.coerce.number().int().min(1),
  children: z.coerce.number().int().min(0),
  guestName: z.string().min(2, "Nom requis"),
  guestEmail: z.string().email("Email invalide"),
  guestPhone: z.string().optional(),
  method: z.string().optional(),
  acceptTerms: z.string().optional(),
});

export async function createResidenceReservation(
  _prev: ReservationResult,
  formData: FormData
): Promise<ReservationResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Veuillez vous connecter pour reserver." };

  const parsed = residenceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const data = parsed.data;
  if (!data.acceptTerms) {
    return { ok: false, error: "Vous devez accepter les conditions de reservation." };
  }

  const startDate = new Date(data.checkin);
  const endDate = new Date(data.checkout);
  const nights = nightsBetween(startDate, endDate);
  if (nights < 1) return { ok: false, error: "Selectionnez au moins une nuit." };
  if (startDate < new Date(new Date().toDateString())) {
    return { ok: false, error: "Les dates passees ne sont pas reservables." };
  }

  const residence = await prisma.residence.findUnique({ where: { id: data.residenceId } });
  if (!residence || residence.status !== "PUBLISHED") {
    return { ok: false, error: "Residence indisponible." };
  }

  const serviceFeeRate = await getServiceFeeRate();
  const price = computeResidencePrice({
    pricePerNight: residence.pricePerNight,
    cleaningFee: residence.cleaningFee,
    startDate, endDate, serviceFeeRate,
  });
  const deposit = computeDeposit({ type: "RESIDENCE", nights, total: price.total, pricePerNight: residence.pricePerNight });

  let reservationId: string;
  try {
    reservationId = await prisma.$transaction(async (tx) => {
      const overlap = await tx.reservation.findFirst({
        where: {
          residenceId: residence.id,
          status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING_PAYMENT", "PENDING_APPROVAL"] },
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
      });
      if (overlap) throw new Error("Ces dates viennent d'etre demandees. Choisissez d'autres dates.");

      const block = await tx.residenceAvailabilityBlock.findFirst({
        where: { residenceId: residence.id, startDate: { lt: endDate }, endDate: { gt: startDate } },
      });
      if (block) throw new Error("Ces dates sont bloquees par le proprietaire.");

      const reservation = await tx.reservation.create({
        data: {
          reference: generateReference("KS"),
          type: "RESIDENCE",
          status: "PENDING_APPROVAL",
          travelerId: user.id,
          residenceId: residence.id,
          startDate, endDate, nights,
          adults: data.adults, children: data.children,
          guestName: data.guestName, guestEmail: data.guestEmail, guestPhone: data.guestPhone || null,
          subtotalAmount: price.subtotal,
          serviceFeeAmount: price.serviceFee,
          cleaningFeeAmount: price.cleaningFee,
          totalAmount: price.total,
          depositAmount: deposit,
          expiresAt: new Date(Date.now() + RESIDENCE_VALIDATION_HOURS * HOUR),
        },
      });
      return reservation.id;
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur lors de la demande." };
  }

  // Notifications : proprietaire + admins
  await prisma.notification.create({
    data: {
      userId: residence.ownerId,
      title: "Nouvelle demande de reservation",
      body: `${data.guestName} souhaite reserver ${residence.name}. A valider sous ${RESIDENCE_VALIDATION_HOURS}h.`,
      type: "RESERVATION_REQUEST",
      url: "/owner/bookings",
    },
  });
  await notifyAdmins(
    "Demande de reservation residence",
    `${residence.name} - ${data.guestName}. Validation sous ${RESIDENCE_VALIDATION_HOURS}h.`,
    "/admin/reservations"
  );
  await sendEmail({
    to: data.guestEmail,
    subject: "Demande de reservation recue - KoraStay",
    html: emailLayout(
      "Votre demande a bien ete recue",
      `<p>Bonjour ${data.guestName},</p><p>Votre demande pour <strong>${residence.name}</strong> est en attente de validation par l'hote. Vous serez notifie sous ${RESIDENCE_VALIDATION_HOURS}h pour proceder au paiement de l'acompte.</p>`
    ),
    text: `Demande de reservation recue pour ${residence.name}.`,
  });

  redirect(`/account/bookings/${reservationId}?requested=1`);
}

// ============================================================
// 2. Demande de reservation PACK (en attente de validation)
// ============================================================
const packSchema = z.object({
  packId: z.string().min(1),
  startDate: z.string().min(8),
  persons: z.coerce.number().int().min(1),
  guestName: z.string().min(2, "Nom requis"),
  guestEmail: z.string().email("Email invalide"),
  guestPhone: z.string().optional(),
  method: z.string().optional(),
  acceptTerms: z.string().optional(),
});

export async function createPackReservation(
  _prev: ReservationResult,
  formData: FormData
): Promise<ReservationResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Veuillez vous connecter pour reserver." };

  const parsed = packSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const data = parsed.data;
  if (!data.acceptTerms) {
    return { ok: false, error: "Vous devez accepter les conditions." };
  }

  const pack = await prisma.pack.findUnique({ where: { id: data.packId } });
  if (!pack || pack.status !== "PUBLISHED") return { ok: false, error: "Pack indisponible." };
  if (data.persons > pack.maxPersons) {
    return { ok: false, error: `Ce pack accueille au maximum ${pack.maxPersons} personnes.` };
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(startDate.getTime() + pack.durationNights * DAY);
  const price = computePackPrice({
    basePrice: pack.price,
    basePersons: pack.basePersons,
    extraPersonPrice: pack.extraPersonPrice,
    persons: data.persons,
    serviceFeeRate: await getServiceFeeRate(),
  });
  const deposit = computeDeposit({ type: "PACK", nights: pack.durationNights, total: price.total });

  const reservation = await prisma.reservation.create({
    data: {
      reference: generateReference("KP"),
      type: "PACK",
      status: "PENDING_APPROVAL",
      travelerId: user.id,
      packId: pack.id,
      startDate, endDate, nights: pack.durationNights,
      adults: data.persons, children: 0,
      guestName: data.guestName, guestEmail: data.guestEmail, guestPhone: data.guestPhone || null,
      subtotalAmount: price.subtotal + price.extras,
      serviceFeeAmount: price.serviceFee,
      totalAmount: price.total,
      depositAmount: deposit,
      expiresAt: new Date(Date.now() + PACK_VALIDATION_DAYS * DAY),
    },
  });

  await notifyAdmins(
    "Demande de reservation pack",
    `${pack.name} - ${data.guestName}. Validation sous ${PACK_VALIDATION_DAYS} jours.`,
    "/admin/reservations"
  );
  await sendEmail({
    to: data.guestEmail,
    subject: "Demande de pack recue - KoraStay",
    html: emailLayout(
      "Votre demande de pack a bien ete recue",
      `<p>Bonjour ${data.guestName},</p><p>Votre demande pour le pack <strong>${pack.name}</strong> est en cours de validation par notre equipe. Vous serez notifie sous ${PACK_VALIDATION_DAYS} jours pour le paiement de l'acompte.</p>`
    ),
    text: `Demande de pack recue pour ${pack.name}.`,
  });

  redirect(`/account/bookings/${reservation.id}?requested=1`);
}

// ============================================================
// 3. Validation (hote / admin)
// ============================================================
export async function approveReservation(reservationId: string): Promise<ReservationResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non autorise." };

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { residence: { select: { ownerId: true, name: true } }, pack: { select: { name: true } } },
  });
  if (!reservation) return { ok: false, error: "Reservation introuvable." };

  const isOwner = reservation.residence?.ownerId === user.id;
  if (!isOwner && !isStaff(user.role)) return { ok: false, error: "Acces refuse." };
  if (reservation.status !== "PENDING_APPROVAL") {
    return { ok: false, error: "Cette demande n'est plus en attente de validation." };
  }

  await prisma.$transaction([
    prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "PENDING_PAYMENT", approvedAt: new Date(), approvedById: user.id, expiresAt: null },
    }),
    prisma.notification.create({
      data: {
        userId: reservation.travelerId,
        title: "Reservation validee",
        body: `Votre demande ${reservation.reference} est validee. Payez l'acompte de ${formatPrice(reservation.depositAmount)} pour confirmer.`,
        type: "RESERVATION_APPROVED",
        url: `/account/bookings/${reservationId}`,
      },
    }),
  ]);

  await sendEmail({
    to: reservation.guestEmail,
    subject: `Demande validee - ${reservation.reference}`,
    html: emailLayout(
      "Votre demande est validee",
      `<p>Bonjour ${reservation.guestName},</p><p>Bonne nouvelle ! Votre demande <strong>${reservation.reference}</strong> est validee. Reglez l'acompte de <strong>${formatPrice(reservation.depositAmount)}</strong> pour confirmer votre reservation.</p>`
    ),
    text: `Demande ${reservation.reference} validee. Acompte : ${formatPrice(reservation.depositAmount)}.`,
  });

  ["/owner/bookings", "/admin/reservations"].forEach((p) => revalidatePath(p));
  revalidatePath(`/account/bookings/${reservationId}`);
  return { ok: true, reservationId };
}

export async function rejectReservation(reservationId: string): Promise<ReservationResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non autorise." };

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { residence: { select: { ownerId: true } } },
  });
  if (!reservation) return { ok: false, error: "Reservation introuvable." };

  const isOwner = reservation.residence?.ownerId === user.id;
  if (!isOwner && !isStaff(user.role)) return { ok: false, error: "Acces refuse." };
  if (reservation.status !== "PENDING_APPROVAL") {
    return { ok: false, error: "Cette demande n'est plus en attente." };
  }

  await prisma.$transaction([
    prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    }),
    prisma.notification.create({
      data: {
        userId: reservation.travelerId,
        title: "Demande declinee",
        body: `Votre demande ${reservation.reference} n'a pas pu etre validee. Aucun montant ne vous a ete debite.`,
        type: "RESERVATION_CANCELLED",
        url: `/account/bookings/${reservationId}`,
      },
    }),
  ]);

  ["/owner/bookings", "/admin/reservations"].forEach((p) => revalidatePath(p));
  revalidatePath(`/account/bookings/${reservationId}`);
  return { ok: true, reservationId };
}

// ============================================================
// 4. Paiement de l'acompte par le voyageur -> CONFIRMEE
// ============================================================
export async function payReservationDeposit(
  reservationId: string,
  method: string
): Promise<ReservationResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non autorise." };

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { residence: true, pack: true },
  });
  if (!reservation || reservation.travelerId !== user.id) {
    return { ok: false, error: "Reservation introuvable." };
  }
  if (reservation.status !== "PENDING_PAYMENT") {
    return { ok: false, error: "Cette reservation n'est pas en attente de paiement." };
  }

  const amount = reservation.depositAmount > 0 ? reservation.depositAmount : reservation.totalAmount;

  const payment = await prisma.payment.create({
    data: {
      reservationId,
      method: method || "MOCK",
      status: "PENDING",
      amount,
      provider: getPaymentProvider().name,
    },
  });

  const provider = getPaymentProvider();
  const intent = await provider.createIntent({
    reservationId,
    reference: reservation.reference,
    amount,
    currency: reservation.currency,
    method: payment.method,
    customerEmail: reservation.guestEmail,
    customerName: reservation.guestName,
    returnUrl: `${process.env.APP_URL}/account/bookings/${reservationId}`,
  });
  const confirmation = await provider.confirm(intent.providerReference);

  if (confirmation.status !== "PAID") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return { ok: false, error: "Le paiement de l'acompte a echoue. Reessayez." };
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", paidAt: new Date(), providerReference: intent.providerReference },
    }),
    prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CONFIRMED", confirmedAt: new Date(), expiresAt: null },
    }),
  ]);

  // Notifications de confirmation
  const label = reservation.residence?.name ?? reservation.pack?.name ?? "votre sejour";
  await prisma.notification.create({
    data: {
      userId: reservation.travelerId,
      title: "Reservation confirmee",
      body: `Votre reservation ${reservation.reference} pour ${label} est confirmee. Recu disponible.`,
      type: "RESERVATION_CONFIRMED",
      url: `/account/bookings/${reservationId}`,
    },
  });
  if (reservation.residence) {
    await prisma.notification.create({
      data: {
        userId: reservation.residence.ownerId,
        title: "Reservation confirmee",
        body: `${reservation.guestName} a confirme sa reservation a ${reservation.residence.name} (${reservation.reference}).`,
        type: "OWNER_BOOKING",
        url: "/owner/bookings",
      },
    });
  }
  await sendEmail({
    to: reservation.guestEmail,
    subject: `Reservation confirmee - ${reservation.reference}`,
    html: emailLayout(
      "Votre reservation est confirmee",
      `<p>Bonjour ${reservation.guestName},</p><p>Votre reservation <strong>${reservation.reference}</strong> pour ${label} est confirmee. Acompte regle : ${formatPrice(amount)}. Le solde sera regle sur place.</p>`
    ),
    text: `Reservation ${reservation.reference} confirmee.`,
  });

  if (reservation.packId) {
    await autoProposePartnersForPack(reservation.packId, reservationId, reservation.startDate);
  }

  revalidatePath("/account/bookings");
  redirect(`/account/bookings/${reservationId}?confirmed=1`);
}

// ============================================================
// 5. Expiration automatique des demandes non validees
// ============================================================
export async function expireStaleReservations(): Promise<number> {
  const stale = await prisma.reservation.findMany({
    where: { status: "PENDING_APPROVAL", expiresAt: { lt: new Date() } },
    select: { id: true, travelerId: true, reference: true },
  });
  if (stale.length === 0) return 0;

  await prisma.$transaction([
    prisma.reservation.updateMany({
      where: { id: { in: stale.map((r) => r.id) } },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    }),
    prisma.notification.createMany({
      data: stale.map((r) => ({
        userId: r.travelerId,
        title: "Demande expiree",
        body: `Votre demande ${r.reference} a expire sans validation et a ete annulee automatiquement.`,
        type: "RESERVATION_CANCELLED",
        url: "/account/bookings",
      })),
    }),
  ]);
  return stale.length;
}

// ------------------------------------------------------------
// Proposition automatique des partenaires (packs confirmes)
// ------------------------------------------------------------
async function autoProposePartnersForPack(packId: string, reservationId: string, scheduledAt: Date) {
  const pack = await prisma.pack.findUnique({
    where: { id: packId },
    include: { destination: { select: { name: true } } },
  });
  const city = pack?.destination?.name;
  if (!pack || !city) return;

  const partners = await prisma.partnerProfile.findMany({
    where: { verificationStatus: "VERIFIED", type: { in: ["GUIDE", "TRANSPORT"] }, city: { equals: city } },
    select: { id: true, type: true, userId: true },
  });

  for (const partner of partners) {
    const existing = await prisma.partnerMission.findFirst({
      where: { partnerProfileId: partner.id, reservationId },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.partnerMission.create({
      data: {
        partnerProfileId: partner.id,
        reservationId,
        packId,
        title: partner.type === "GUIDE" ? `Guide - ${pack.name}` : `Transport - ${pack.name}`,
        description: `Mission proposee automatiquement pour le pack ${pack.name} a ${city}.`,
        city,
        scheduledAt,
        status: "PROPOSED",
        amount: 0,
      },
    });
    await prisma.notification.create({
      data: {
        userId: partner.userId,
        title: "Nouvelle mission proposee",
        body: `Une mission "${pack.name}" a ${city} vous est proposee.`,
        type: "PARTNER_MISSION",
        url: "/partner/missions",
      },
    });
  }
}

// ------------------------------------------------------------
// Annulation voyageur
// ------------------------------------------------------------
export async function cancelReservation(reservationId: string): Promise<ReservationResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non autorise." };

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { payments: { where: { status: "PAID" }, take: 1 } },
  });
  if (!reservation || reservation.travelerId !== user.id) {
    return { ok: false, error: "Reservation introuvable." };
  }
  if (!["CONFIRMED", "PENDING_PAYMENT", "PENDING_APPROVAL"].includes(reservation.status)) {
    return { ok: false, error: "Cette reservation ne peut pas etre annulee." };
  }

  const estimate =
    reservation.type === "PACK"
      ? estimatePackRefund(reservation.totalAmount, reservation.serviceFeeAmount, reservation.startDate)
      : estimateResidenceRefund(reservation.totalAmount, reservation.serviceFeeAmount, reservation.startDate);

  const hasPaid = reservation.payments.length > 0;

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
    if (hasPaid && estimate.refundableAmount > 0) {
      await tx.refund.create({
        data: {
          paymentId: reservation.payments[0].id,
          reservationId,
          amount: Math.min(estimate.refundableAmount, reservation.payments[0].amount),
          reason: "Annulation voyageur",
          status: "PENDING",
        },
      });
    }
    await tx.notification.create({
      data: {
        userId: user.id,
        title: "Reservation annulee",
        body: `Votre reservation ${reservation.reference} a ete annulee.${hasPaid ? " " + estimate.label + "." : ""}`,
        type: "RESERVATION_CANCELLED",
        url: `/account/bookings/${reservationId}`,
      },
    });
  });

  revalidatePath(`/account/bookings/${reservationId}`);
  revalidatePath("/account/bookings");
  return { ok: true, reservationId };
}
