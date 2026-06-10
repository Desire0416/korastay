"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { computeResidencePrice, computePackPrice, estimateResidenceRefund, estimatePackRefund } from "@/lib/pricing";
import { generateReference, nightsBetween } from "@/lib/utils";
import { getPaymentProvider } from "@/lib/payments";
import { sendEmail, emailLayout } from "@/lib/email";
import { PAYMENT_HOLD_MINUTES } from "@/lib/constants";
import { getServiceFeeRate } from "@/lib/settings";

export type ReservationResult = {
  ok: boolean;
  error?: string;
  reservationId?: string;
};

const residenceSchema = z.object({
  residenceId: z.string().min(1),
  checkin: z.string().min(8),
  checkout: z.string().min(8),
  adults: z.coerce.number().int().min(1),
  children: z.coerce.number().int().min(0),
  guestName: z.string().min(2, "Nom requis"),
  guestEmail: z.string().email("Email invalide"),
  guestPhone: z.string().optional(),
  method: z.string().min(1),
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

  const residence = await prisma.residence.findUnique({
    where: { id: data.residenceId },
  });
  if (!residence || residence.status !== "PUBLISHED") {
    return { ok: false, error: "Residence indisponible." };
  }

  const serviceFeeRate = await getServiceFeeRate();
  const price = computeResidencePrice({
    pricePerNight: residence.pricePerNight,
    cleaningFee: residence.cleaningFee,
    startDate,
    endDate,
    serviceFeeRate,
  });

  let reservationId: string;
  try {
    reservationId = await prisma.$transaction(async (tx) => {
      // Anti-double reservation : verifie les chevauchements
      const overlap = await tx.reservation.findFirst({
        where: {
          residenceId: residence.id,
          status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING_PAYMENT"] },
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
      });
      if (overlap) throw new Error("Ces dates viennent d'etre reservees. Choisissez d'autres dates.");

      const block = await tx.residenceAvailabilityBlock.findFirst({
        where: {
          residenceId: residence.id,
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
      });
      if (block) throw new Error("Ces dates sont bloquees par le proprietaire.");

      const reservation = await tx.reservation.create({
        data: {
          reference: generateReference("KS"),
          type: "RESIDENCE",
          status: "PENDING_PAYMENT",
          travelerId: user.id,
          residenceId: residence.id,
          startDate,
          endDate,
          nights,
          adults: data.adults,
          children: data.children,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone || null,
          subtotalAmount: price.subtotal,
          serviceFeeAmount: price.serviceFee,
          cleaningFeeAmount: price.cleaningFee,
          totalAmount: price.total,
          expiresAt: new Date(Date.now() + PAYMENT_HOLD_MINUTES * 60 * 1000),
        },
      });

      await tx.payment.create({
        data: {
          reservationId: reservation.id,
          method: data.method,
          status: "PENDING",
          amount: price.total,
          provider: getPaymentProvider().name,
        },
      });

      return reservation.id;
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur lors de la reservation." };
  }

  // Traitement du paiement (provider mock = confirme immediatement)
  await processPayment(reservationId);

  redirect(`/account/bookings/${reservationId}?confirmed=1`);
}

// ------------------------------------------------------------
// Pack
// ------------------------------------------------------------
const packSchema = z.object({
  packId: z.string().min(1),
  startDate: z.string().min(8),
  persons: z.coerce.number().int().min(1),
  guestName: z.string().min(2, "Nom requis"),
  guestEmail: z.string().email("Email invalide"),
  guestPhone: z.string().optional(),
  method: z.string().min(1),
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
  if (!pack || pack.status !== "PUBLISHED") {
    return { ok: false, error: "Pack indisponible." };
  }
  if (data.persons > pack.maxPersons) {
    return { ok: false, error: `Ce pack accueille au maximum ${pack.maxPersons} personnes.` };
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(startDate.getTime() + pack.durationNights * 24 * 60 * 60 * 1000);
  const price = computePackPrice({
    basePrice: pack.price,
    basePersons: pack.basePersons,
    extraPersonPrice: pack.extraPersonPrice,
    persons: data.persons,
    serviceFeeRate: await getServiceFeeRate(),
  });

  const reservation = await prisma.reservation.create({
    data: {
      reference: generateReference("KP"),
      type: "PACK",
      status: "PENDING_PAYMENT",
      travelerId: user.id,
      packId: pack.id,
      startDate,
      endDate,
      nights: pack.durationNights,
      adults: data.persons,
      children: 0,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone || null,
      subtotalAmount: price.subtotal + price.extras,
      serviceFeeAmount: price.serviceFee,
      totalAmount: price.total,
      expiresAt: new Date(Date.now() + PAYMENT_HOLD_MINUTES * 60 * 1000),
      payments: {
        create: { method: data.method, status: "PENDING", amount: price.total, provider: getPaymentProvider().name },
      },
    },
  });

  await processPayment(reservation.id);
  redirect(`/account/bookings/${reservation.id}?confirmed=1`);
}

// ------------------------------------------------------------
// Traitement paiement (mock / provider)
// ------------------------------------------------------------
async function processPayment(reservationId: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 }, residence: true, pack: true },
  });
  if (!reservation) return;
  const payment = reservation.payments[0];
  if (!payment) return;

  const provider = getPaymentProvider();
  const intent = await provider.createIntent({
    reservationId,
    reference: reservation.reference,
    amount: payment.amount,
    currency: payment.currency,
    method: payment.method,
    customerEmail: reservation.guestEmail,
    customerName: reservation.guestName,
    returnUrl: `${process.env.APP_URL}/account/bookings/${reservationId}`,
  });
  const confirmation = await provider.confirm(intent.providerReference);

  if (confirmation.status === "PAID") {
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

    // Notifications
    const label = reservation.residence?.name ?? reservation.pack?.name ?? "votre sejour";
    await prisma.notification.create({
      data: {
        userId: reservation.travelerId,
        title: "Reservation confirmee",
        body: `Votre reservation ${reservation.reference} pour ${label} est confirmee.`,
        type: "RESERVATION_CONFIRMED",
        url: `/account/bookings/${reservationId}`,
      },
    });
    if (reservation.residence) {
      const owner = await prisma.residence.findUnique({
        where: { id: reservation.residence.id },
        select: { ownerId: true },
      });
      if (owner) {
        await prisma.notification.create({
          data: {
            userId: owner.ownerId,
            title: "Nouvelle reservation",
            body: `Nouvelle reservation confirmee a ${reservation.residence.name} (${reservation.reference}).`,
            type: "OWNER_BOOKING",
            url: `/owner/bookings`,
          },
        });
      }
    }
    await sendEmail({
      to: reservation.guestEmail,
      subject: `Reservation confirmee - ${reservation.reference}`,
      html: emailLayout(
        "Votre reservation est confirmee",
        `<p>Bonjour ${reservation.guestName},</p><p>Votre reservation <strong>${reservation.reference}</strong> pour ${label} est confirmee.</p>`
      ),
      text: `Reservation ${reservation.reference} confirmee.`,
    });

    // Mise en relation automatique des partenaires pour les packs
    if (reservation.packId) {
      await autoProposePartnersForPack(reservation.packId, reservationId, reservation.startDate);
    }
  }
  revalidatePath("/account/bookings");
}

/**
 * Propose automatiquement les guides et transporteurs verifies de la ville
 * du pack en creant des missions a l'etat PROPOSED.
 */
async function autoProposePartnersForPack(packId: string, reservationId: string, scheduledAt: Date) {
  const pack = await prisma.pack.findUnique({
    where: { id: packId },
    include: { destination: { select: { name: true } } },
  });
  const city = pack?.destination?.name;
  if (!pack || !city) return;

  const partners = await prisma.partnerProfile.findMany({
    where: { verificationStatus: "VERIFIED", type: { in: ["GUIDE", "TRANSPORT"] }, city: { equals: city } },
    select: { id: true, type: true, businessName: true, userId: true },
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
  if (!["CONFIRMED", "PENDING_PAYMENT"].includes(reservation.status)) {
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
          amount: estimate.refundableAmount,
          reason: "Annulation voyageur",
          status: "PENDING",
        },
      });
    }
    await tx.notification.create({
      data: {
        userId: user.id,
        title: "Reservation annulee",
        body: `Votre reservation ${reservation.reference} a ete annulee. ${estimate.label}.`,
        type: "RESERVATION_CANCELLED",
        url: `/account/bookings/${reservationId}`,
      },
    });
  });

  revalidatePath(`/account/bookings/${reservationId}`);
  revalidatePath("/account/bookings");
  return { ok: true, reservationId };
}
