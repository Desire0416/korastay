// ============================================================
// KoraStay - Finalisation d'un paiement valide
// ------------------------------------------------------------
// Module serveur (PAS un fichier "use server") : ces fonctions
// ne doivent jamais etre exposees comme actions appelables par
// le client. Elles sont invoquees apres validation d'un paiement
// (paiement immediat ou validation manuelle par un admin).
// ============================================================

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { sendEmail, emailLayout } from "./email";
import { formatPrice } from "./utils";
import { getPaymentSettings, buildPayoutPlan } from "./payment-rules";

// Confirme la reservation, notifie, planifie les reversements hote et
// les missions partenaires. Idempotente : ne refait rien si deja confirmee.
export async function finalizeReservationPayment(reservationId: string, paidAmount: number) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { residence: true, pack: true, activity: true },
  });
  if (!reservation || reservation.status === "CONFIRMED") return;

  const amountPaid = reservation.amountPaid + paidAmount;
  const balanceDue = Math.max(0, reservation.totalAmount - amountPaid);

  await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: "CONFIRMED",
      confirmedAt: new Date(),
      expiresAt: null,
      amountPaid,
      balanceDueAmount: balanceDue,
      cautionStatus: reservation.cautionAmount > 0 ? "HELD" : reservation.cautionStatus,
    },
  });

  // Reversements hote (residences uniquement) : echelonnes selon la fiabilite.
  if (reservation.residence) {
    await createOwnerPayouts(
      reservationId,
      reservation.residence.ownerId,
      reservation.subtotalAmount + reservation.cleaningFeeAmount
    );
  }

  const label =
    reservation.residence?.name ?? reservation.pack?.name ?? reservation.activity?.name ?? "votre sejour";
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
      `<p>Bonjour ${reservation.guestName},</p><p>Votre reservation <strong>${reservation.reference}</strong> pour ${label} est confirmee. Montant regle : ${formatPrice(paidAmount)}.${balanceDue > 0 ? ` Solde restant : ${formatPrice(balanceDue)}.` : ""}</p>`
    ),
    text: `Reservation ${reservation.reference} confirmee.`,
  });

  if (reservation.packId) {
    await autoProposePartnersForPack(reservation.packId, reservationId, reservation.startDate);
  }

  // Activite : creer la mission pour le guide choisi.
  if (reservation.activityId && reservation.guideProfileId && reservation.activity) {
    const guide = await prisma.partnerProfile.findUnique({
      where: { id: reservation.guideProfileId },
      select: { id: true, userId: true, city: true },
    });
    if (guide) {
      const exists = await prisma.partnerMission.findFirst({
        where: { partnerProfileId: guide.id, reservationId },
        select: { id: true },
      });
      if (!exists) {
        await prisma.partnerMission.create({
          data: {
            partnerProfileId: guide.id,
            reservationId,
            title: `Guide - ${reservation.activity.name}`,
            description: `Accompagnement de l'activite "${reservation.activity.name}" pour ${reservation.guestName}.`,
            city: guide.city,
            scheduledAt: reservation.startDate,
            status: "PROPOSED",
            amount: 0,
          },
        });
        await prisma.notification.create({
          data: {
            userId: guide.userId,
            title: "Mission confirmee",
            body: `La reservation de l'activite "${reservation.activity.name}" est confirmee.`,
            type: "PARTNER_MISSION",
            url: "/partner/missions",
          },
        });
      }
    }
  }

  revalidatePath(`/account/bookings/${reservationId}`);
}

// Planifie les reversements a l'hote selon sa fiabilite (70/30 ou 100%).
async function createOwnerPayouts(reservationId: string, ownerId: string, ownerRevenue: number) {
  if (ownerRevenue <= 0) return;
  const existing = await prisma.payout.findFirst({ where: { reservationId }, select: { id: true } });
  if (existing) return;

  const [owner, settings] = await Promise.all([
    prisma.user.findUnique({ where: { id: ownerId }, select: { payoutTier: true } }),
    getPaymentSettings(),
  ]);
  const plan = buildPayoutPlan(ownerRevenue, owner?.payoutTier ?? "NEW", settings);

  await prisma.payout.createMany({
    data: plan.map((p) => ({
      reservationId,
      ownerId,
      amount: p.amount,
      percentage: p.percentage,
      trigger: p.trigger,
      status: "SCHEDULED",
      note:
        p.trigger === "CHECK_IN"
          ? "A liberer apres l'arrivee du voyageur"
          : "A liberer apres le depart du voyageur",
    })),
  });
}

// Proposition automatique des partenaires (guides/transport) pour un pack confirme.
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
