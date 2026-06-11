"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isStaff } from "@/lib/messaging";
import {
  computeResidencePrice, computePackPrice,
  estimateResidenceRefund, estimatePackRefund,
} from "@/lib/pricing";
import {
  getPaymentSettings, computeServiceFee, resolveResidencePolicy, buildFinance,
} from "@/lib/payment-rules";
import { finalizeReservationPayment } from "@/lib/reservation-finalize";
import { generateReference, nightsBetween, formatPrice } from "@/lib/utils";
import { getPaymentProviderForMethod } from "@/lib/payments";
import { sendEmail, emailLayout } from "@/lib/email";
import { RESIDENCE_VALIDATION_HOURS, PACK_VALIDATION_DAYS } from "@/lib/constants";

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

  const settings = await getPaymentSettings();
  const price = computeResidencePrice({
    pricePerNight: residence.pricePerNight,
    cleaningFee: residence.cleaningFee,
    startDate, endDate,
    serviceFeeRate: settings.serviceFeePercent / 100,
    serviceFeeMin: settings.serviceFeeMin,
    serviceFeeMax: settings.serviceFeeMax,
  });
  const policy = resolveResidencePolicy(residence, nights, settings);
  const finance = buildFinance({
    subtotal: price.subtotal,
    cleaningFee: price.cleaningFee,
    serviceFee: price.serviceFee,
    policy,
    cautionEnabled: residence.cautionEnabled,
    cautionAmount: residence.depositAmount,
  });

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
          totalAmount: finance.total,
          depositAmount: finance.depositDue,
          balanceDueAmount: finance.balanceDue,
          paymentPolicy: finance.policy,
          cautionAmount: finance.cautionAmount,
          cautionStatus: finance.cautionAmount > 0 ? "REQUIRED" : "NONE",
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
  const settings = await getPaymentSettings();
  const price = computePackPrice({
    basePrice: pack.price,
    basePersons: pack.basePersons,
    extraPersonPrice: pack.extraPersonPrice,
    persons: data.persons,
    serviceFeeRate: settings.serviceFeePercent / 100,
    serviceFeeMin: settings.serviceFeeMin,
    serviceFeeMax: settings.serviceFeeMax,
  });
  // Packs : toujours 100% a la reservation.
  const finance = buildFinance({
    subtotal: price.subtotal + price.extras,
    serviceFee: price.serviceFee,
    policy: settings.packPolicy,
  });

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
      totalAmount: finance.total,
      depositAmount: finance.depositDue,
      balanceDueAmount: finance.balanceDue,
      paymentPolicy: finance.policy,
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
// 2bis. Demande de reservation ACTIVITE (guide obligatoire)
// ============================================================
const activitySchema = z.object({
  activityId: z.string().min(1),
  guideProfileId: z.string().min(1, "Veuillez choisir un guide."),
  date: z.string().min(8),
  persons: z.coerce.number().int().min(1),
  guestName: z.string().min(2, "Nom requis"),
  guestEmail: z.string().email("Email invalide"),
  guestPhone: z.string().optional(),
  method: z.string().optional(),
  acceptTerms: z.string().optional(),
});

export async function createActivityReservation(
  _prev: ReservationResult,
  formData: FormData
): Promise<ReservationResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Veuillez vous connecter pour reserver." };

  const parsed = activitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const data = parsed.data;
  if (!data.acceptTerms) return { ok: false, error: "Vous devez accepter les conditions." };

  const activity = await prisma.activity.findUnique({ where: { id: data.activityId } });
  if (!activity || activity.status !== "PUBLISHED") return { ok: false, error: "Activite indisponible." };
  if (data.persons > activity.maxPersons) {
    return { ok: false, error: `Cette activite accueille au maximum ${activity.maxPersons} personnes.` };
  }

  const guide = await prisma.partnerProfile.findFirst({
    where: { id: data.guideProfileId, type: "GUIDE", verificationStatus: "VERIFIED" },
    select: { id: true, userId: true, businessName: true },
  });
  if (!guide) return { ok: false, error: "Guide invalide. Veuillez en choisir un autre." };

  const settings = await getPaymentSettings();
  const subtotal = activity.pricePerPerson * data.persons;
  const serviceFee = computeServiceFee(subtotal, settings);
  const finance = buildFinance({ subtotal, serviceFee, policy: settings.activityPolicy });

  const startDate = new Date(data.date);
  const endDate = new Date(startDate.getTime() + activity.durationHours * HOUR);

  const reservation = await prisma.reservation.create({
    data: {
      reference: generateReference("KA"),
      type: "ACTIVITY",
      status: "PENDING_APPROVAL",
      travelerId: user.id,
      activityId: activity.id,
      guideProfileId: guide.id,
      startDate, endDate, nights: 0,
      adults: data.persons, children: 0,
      guestName: data.guestName, guestEmail: data.guestEmail, guestPhone: data.guestPhone || null,
      subtotalAmount: subtotal,
      serviceFeeAmount: serviceFee,
      totalAmount: finance.total,
      depositAmount: finance.depositDue,
      balanceDueAmount: finance.balanceDue,
      paymentPolicy: finance.policy,
      expiresAt: new Date(Date.now() + RESIDENCE_VALIDATION_HOURS * HOUR),
    },
  });

  await prisma.notification.create({
    data: {
      userId: guide.userId,
      title: "Demande d'accompagnement",
      body: `${data.guestName} souhaite reserver l'activite "${activity.name}" avec vous.`,
      type: "PARTNER_MISSION",
      url: "/partner/missions",
    },
  });
  await notifyAdmins(
    "Demande de reservation activite",
    `${activity.name} - ${data.guestName} (guide: ${guide.businessName}). Validation sous ${RESIDENCE_VALIDATION_HOURS}h.`,
    "/admin/reservations"
  );
  await sendEmail({
    to: data.guestEmail,
    subject: "Demande d'activite recue - KoraStay",
    html: emailLayout(
      "Votre demande d'activite a bien ete recue",
      `<p>Bonjour ${data.guestName},</p><p>Votre demande pour <strong>${activity.name}</strong> avec un guide est en attente de validation. Vous serez notifie pour le paiement de l'acompte.</p>`
    ),
    text: `Demande d'activite recue pour ${activity.name}.`,
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
// 4. Paiement de l'acompte par le voyageur
//    - Mobile money / carte / demo : confirme immediatement -> CONFIRMEE
//    - Virement / validation manuelle : reste en attente d'un admin
// ============================================================
export async function payReservationDeposit(
  reservationId: string,
  method: string
): Promise<ReservationResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non autorise." };

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      id: true, travelerId: true, status: true, reference: true,
      depositAmount: true, totalAmount: true, currency: true,
      guestEmail: true, guestName: true,
    },
  });
  if (!reservation || reservation.travelerId !== user.id) {
    return { ok: false, error: "Reservation introuvable." };
  }
  if (reservation.status !== "PENDING_PAYMENT") {
    return { ok: false, error: "Cette reservation n'est pas en attente de paiement." };
  }

  const amount = reservation.depositAmount > 0 ? reservation.depositAmount : reservation.totalAmount;
  const provider = getPaymentProviderForMethod(method);

  const payment = await prisma.payment.create({
    data: { reservationId, method: method || "MOCK", status: "PENDING", amount, provider: provider.name },
  });

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

  await prisma.payment.update({
    where: { id: payment.id },
    data: { providerReference: intent.providerReference, checkoutUrl: intent.checkoutUrl },
  });

  // Paiement differe (virement / validation manuelle) : on attend l'admin.
  if (confirmation.status !== "PAID") {
    await notifyAdmins(
      "Paiement a valider",
      `${reservation.guestName} a declare un paiement (${method}) de ${formatPrice(amount)} pour ${reservation.reference}. A valider.`,
      `/admin/reservations/${reservationId}`
    );
    await prisma.notification.create({
      data: {
        userId: reservation.travelerId,
        title: "Paiement en cours de verification",
        body: `Votre paiement pour ${reservation.reference} sera confirme des sa validation par KoraStay.`,
        type: "PAYMENT_PENDING",
        url: `/account/bookings/${reservationId}`,
      },
    });
    revalidatePath(`/account/bookings/${reservationId}`);
    redirect(`/account/bookings/${reservationId}?pending_validation=1`);
  }

  // Paiement immediat confirme.
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "PAID", paidAt: new Date() },
  });
  await finalizeReservationPayment(reservationId, amount);

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
