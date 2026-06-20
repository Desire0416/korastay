"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateReference } from "@/lib/utils";
import { sendEmail, emailLayout } from "@/lib/email";
import {
  ReservationStatus, NegotiationStatus, OfferParty, OfferStatus,
} from "@/lib/enums";
import { computeNegotiatedPrice } from "@/lib/pricing";
import { getPaymentSettings } from "@/lib/payment-rules";

export type NegotiationResult = {
  ok: boolean;
  error?: string;
  reservationId?: string;
  offerId?: string;
};

const OFFER_TTL = 24 * 60 * 60 * 1000; // 24h

// ------------------------------------------------------------------
// 1. Voyageur : soumettre une offre de prix (2+ nuits, prix libre)
// ------------------------------------------------------------------
export async function submitPriceOffer(input: {
  residenceId: string;
  startDate: string;
  endDate: string;
  nights: number;
  adults: number;
  children: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  proposedAmount: number;
  message?: string;
  cleaningFeeAmount?: number;
}): Promise<NegotiationResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Connectez-vous pour faire une offre." };

  if (input.nights < 2) {
    return { ok: false, error: "La négociation est disponible pour 2 nuits ou plus." };
  }
  if (input.proposedAmount < 1) {
    return { ok: false, error: "Le montant proposé est invalide." };
  }

  const [residence, settings] = await Promise.all([
    prisma.residence.findUnique({
      where: { id: input.residenceId, status: "PUBLISHED" },
      select: { id: true, name: true, ownerId: true, slug: true, cleaningFee: true },
    }),
    getPaymentSettings(),
  ]);
  if (!residence) return { ok: false, error: "Résidence introuvable." };

  const cleaningFee = input.cleaningFeeAmount ?? residence.cleaningFee ?? 0;
  const price = computeNegotiatedPrice({
    negotiatedSubtotal: input.proposedAmount,
    cleaningFee,
    serviceFeeRate: settings.serviceFeePercent / 100,
    serviceFeeMin: settings.serviceFeeMin,
    serviceFeeMax: settings.serviceFeeMax,
  });

  const expiresAt = new Date(Date.now() + OFFER_TTL);

  let reservationId: string;
  let offerId: string;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Vérifier disponibilité (dans la transaction pour éviter les races)
      const block = await tx.residenceAvailabilityBlock.findFirst({
        where: {
          residenceId: residence.id,
          startDate: { lt: new Date(input.endDate) },
          endDate: { gt: new Date(input.startDate) },
        },
      });
      if (block) throw new Error("Ces dates sont bloquées par le propriétaire.");

      const reservation = await tx.reservation.create({
        data: {
          reference: generateReference("KN"),
          type: "RESIDENCE",
          status: ReservationStatus.NEGOTIATING,
          negotiationStatus: NegotiationStatus.OPEN,
          travelerId: user.id,
          residenceId: residence.id,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          nights: input.nights,
          adults: input.adults,
          children: input.children,
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone ?? null,
          subtotalAmount: input.proposedAmount,
          serviceFeeAmount: price.serviceFee,
          cleaningFeeAmount: price.cleaningFee,
          totalAmount: price.total,
          expiresAt,
        },
      });

      const offer = await tx.priceOffer.create({
        data: {
          reservationId: reservation.id,
          amount: input.proposedAmount,
          proposedBy: OfferParty.TRAVELER,
          message: input.message ?? null,
          status: OfferStatus.PENDING,
          expiresAt,
        },
      });

      await tx.notification.create({
        data: {
          userId: residence.ownerId,
          title: "Nouvelle offre de prix",
          body: `${input.guestName} propose une offre pour ${residence.name}. Répondez sous 24h.`,
          type: "PRICE_OFFER",
          url: "/owner/offers",
        },
      });

      return { reservationId: reservation.id, offerId: offer.id };
    });

    reservationId = result.reservationId;
    offerId = result.offerId;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur lors de l'envoi de l'offre." };
  }

  // Emails hors transaction
  const owner = await prisma.user.findUnique({
    where: { id: residence.ownerId },
    select: { email: true, firstName: true },
  });

  if (owner) {
    await sendEmail({
      to: owner.email,
      subject: `Offre de prix reçue - ${residence.name}`,
      html: emailLayout(
        "Vous avez reçu une offre de prix",
        `<p>Bonjour ${owner.firstName},</p>
         <p><strong>${input.guestName}</strong> propose <strong>${input.proposedAmount.toLocaleString("fr-FR")} FCFA</strong> pour ${input.nights} nuit(s) dans <strong>${residence.name}</strong>.</p>
         ${input.message ? `<p>Message : ${input.message}</p>` : ""}
         <p>Vous avez <strong>24 heures</strong> pour accepter, refuser ou faire une contre-offre.</p>
         <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/owner/offers">Voir l'offre &rarr;</a></p>`
      ),
      text: `${input.guestName} propose ${input.proposedAmount} FCFA pour ${residence.name}.`,
    });
  }

  await sendEmail({
    to: input.guestEmail,
    subject: "Votre offre a été envoyée - KoraStay",
    html: emailLayout(
      "Offre envoyée avec succès",
      `<p>Bonjour ${input.guestName},</p>
       <p>Votre offre de <strong>${input.proposedAmount.toLocaleString("fr-FR")} FCFA</strong> pour <strong>${residence.name}</strong> a bien été transmise au propriétaire.</p>
       <p>Il dispose de <strong>24 heures</strong> pour vous répondre.</p>`
    ),
    text: `Votre offre pour ${residence.name} a été envoyée. Réponse sous 24h.`,
  });

  return { ok: true, reservationId, offerId };
}

// ------------------------------------------------------------------
// 2. Propriétaire : répondre à une offre
// ------------------------------------------------------------------
export async function ownerRespondToOffer(input: {
  offerId: string;
  action: "ACCEPT" | "REJECT" | "COUNTER";
  counterAmount?: number;
  message?: string;
}): Promise<NegotiationResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non autorisé." };

  const offer = await prisma.priceOffer.findUnique({
    where: { id: input.offerId },
    include: {
      reservation: {
        include: {
          residence: { select: { ownerId: true, name: true } },
          traveler: { select: { id: true, email: true, firstName: true } },
        },
      },
    },
  });

  if (!offer) return { ok: false, error: "Offre introuvable." };
  if (offer.reservation.residence?.ownerId !== user.id) return { ok: false, error: "Non autorisé." };
  if (offer.status !== OfferStatus.PENDING) return { ok: false, error: "Cette offre n'est plus en attente." };
  if (new Date() > offer.expiresAt) return { ok: false, error: "Cette offre a expiré." };

  const now = new Date();
  const traveler = offer.reservation.traveler;
  const residenceName = offer.reservation.residence?.name ?? "";
  const reservationId = offer.reservationId;

  if (input.action === "ACCEPT") {
    await prisma.$transaction(async (tx) => {
      await tx.priceOffer.update({
        where: { id: offer.id },
        data: { status: OfferStatus.ACCEPTED, respondedAt: now },
      });
      await tx.reservation.update({
        where: { id: reservationId },
        data: {
          negotiationStatus: NegotiationStatus.AGREED,
          negotiatedPrice: offer.amount,
          subtotalAmount: offer.amount,
          status: ReservationStatus.PENDING_APPROVAL,
        },
      });
      await tx.notification.create({
        data: {
          userId: offer.reservation.travelerId,
          title: "Votre offre a été acceptée !",
          body: `Le propriétaire de ${residenceName} a accepté votre offre de ${offer.amount.toLocaleString("fr-FR")} FCFA.`,
          type: "OFFER_ACCEPTED",
          url: `/account/bookings/${reservationId}`,
        },
      });
    });

    if (traveler) {
      await sendEmail({
        to: traveler.email,
        subject: `Offre acceptée - ${residenceName}`,
        html: emailLayout(
          "Votre offre a été acceptée !",
          `<p>Bonjour ${traveler.firstName},</p>
           <p>Le propriétaire a accepté votre offre de <strong>${offer.amount.toLocaleString("fr-FR")} FCFA</strong> pour <strong>${residenceName}</strong>.</p>
           <p>Votre réservation est maintenant en attente de confirmation. Vous serez notifié pour le paiement.</p>
           <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/account/bookings/${reservationId}">Voir ma réservation &rarr;</a></p>`
        ),
        text: `Votre offre de ${offer.amount} FCFA pour ${residenceName} a été acceptée.`,
      });
    }

    revalidatePath("/owner/offers");
    revalidatePath("/owner/bookings");
    return { ok: true, reservationId };
  }

  if (input.action === "REJECT") {
    await prisma.$transaction(async (tx) => {
      await tx.priceOffer.update({
        where: { id: offer.id },
        data: { status: OfferStatus.REJECTED, respondedAt: now },
      });
      await tx.reservation.update({
        where: { id: reservationId },
        data: {
          negotiationStatus: NegotiationStatus.REJECTED,
          status: ReservationStatus.CANCELLED,
          cancelledAt: now,
        },
      });
      await tx.notification.create({
        data: {
          userId: offer.reservation.travelerId,
          title: "Offre refusée",
          body: `Le propriétaire de ${residenceName} a refusé votre offre.`,
          type: "OFFER_REJECTED",
          url: `/account/bookings/${reservationId}`,
        },
      });
    });

    if (traveler) {
      await sendEmail({
        to: traveler.email,
        subject: `Offre refusée - ${residenceName}`,
        html: emailLayout(
          "Votre offre n'a pas été retenue",
          `<p>Bonjour ${traveler.firstName},</p>
           <p>Le propriétaire a refusé votre offre pour <strong>${residenceName}</strong>.</p>
           ${input.message ? `<p>Motif : ${input.message}</p>` : ""}
           <p>Vous pouvez proposer un autre montant ou choisir une autre résidence.</p>`
        ),
        text: `Votre offre pour ${residenceName} a été refusée.`,
      });
    }

    revalidatePath("/owner/offers");
    return { ok: true, reservationId };
  }

  if (input.action === "COUNTER") {
    if (!input.counterAmount || input.counterAmount < 1) {
      return { ok: false, error: "Indiquez un montant pour la contre-offre." };
    }

    const expiresAt = new Date(Date.now() + OFFER_TTL);
    let newOfferId: string;

    await prisma.$transaction(async (tx) => {
      await tx.priceOffer.update({
        where: { id: offer.id },
        data: { status: OfferStatus.COUNTERED, respondedAt: now },
      });
      const newOffer = await tx.priceOffer.create({
        data: {
          reservationId,
          amount: input.counterAmount!,
          proposedBy: OfferParty.OWNER,
          message: input.message ?? null,
          status: OfferStatus.PENDING,
          expiresAt,
        },
      });
      await tx.reservation.update({
        where: { id: reservationId },
        data: { expiresAt },
      });
      await tx.notification.create({
        data: {
          userId: offer.reservation.travelerId,
          title: "Contre-offre reçue",
          body: `Le propriétaire de ${residenceName} propose ${input.counterAmount!.toLocaleString("fr-FR")} FCFA.`,
          type: "COUNTER_OFFER",
          url: `/account/bookings/${reservationId}`,
        },
      });
      newOfferId = newOffer.id;
    });

    if (traveler) {
      await sendEmail({
        to: traveler.email,
        subject: `Contre-offre reçue - ${residenceName}`,
        html: emailLayout(
          "Le propriétaire vous propose un autre tarif",
          `<p>Bonjour ${traveler.firstName},</p>
           <p>Le propriétaire de <strong>${residenceName}</strong> vous propose <strong>${input.counterAmount!.toLocaleString("fr-FR")} FCFA</strong> en réponse à votre offre de ${offer.amount.toLocaleString("fr-FR")} FCFA.</p>
           ${input.message ? `<p>Message : ${input.message}</p>` : ""}
           <p>Vous avez <strong>24 heures</strong> pour accepter, refuser ou contre-proposer.</p>
           <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/account/bookings/${reservationId}">Répondre &rarr;</a></p>`
        ),
        text: `Contre-offre de ${input.counterAmount} FCFA pour ${residenceName}.`,
      });
    }

    revalidatePath("/owner/offers");
    return { ok: true, reservationId, offerId: newOfferId! };
  }

  return { ok: false, error: "Action inconnue." };
}

// ------------------------------------------------------------------
// 3. Voyageur : répondre à une contre-offre du propriétaire
// ------------------------------------------------------------------
export async function travelerRespondToOffer(input: {
  offerId: string;
  action: "ACCEPT" | "REJECT" | "COUNTER";
  counterAmount?: number;
  message?: string;
}): Promise<NegotiationResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non autorisé." };

  const offer = await prisma.priceOffer.findUnique({
    where: { id: input.offerId },
    include: {
      reservation: {
        include: {
          residence: { select: { ownerId: true, name: true } },
          traveler: { select: { id: true, email: true, firstName: true } },
        },
      },
    },
  });

  if (!offer) return { ok: false, error: "Offre introuvable." };
  if (offer.reservation.travelerId !== user.id) return { ok: false, error: "Non autorisé." };
  if (offer.status !== OfferStatus.PENDING) return { ok: false, error: "Cette offre n'est plus en attente." };
  if (offer.proposedBy !== OfferParty.OWNER) {
    return { ok: false, error: "Cette offre attend une réponse du propriétaire." };
  }
  if (new Date() > offer.expiresAt) return { ok: false, error: "Cette offre a expiré." };

  const now = new Date();
  const ownerId = offer.reservation.residence?.ownerId;
  const residenceName = offer.reservation.residence?.name ?? "";
  const reservationId = offer.reservationId;

  if (input.action === "ACCEPT") {
    await prisma.$transaction(async (tx) => {
      await tx.priceOffer.update({
        where: { id: offer.id },
        data: { status: OfferStatus.ACCEPTED, respondedAt: now },
      });
      await tx.reservation.update({
        where: { id: reservationId },
        data: {
          negotiationStatus: NegotiationStatus.AGREED,
          negotiatedPrice: offer.amount,
          subtotalAmount: offer.amount,
          status: ReservationStatus.PENDING_APPROVAL,
        },
      });
      if (ownerId) {
        await tx.notification.create({
          data: {
            userId: ownerId,
            title: "Contre-offre acceptée !",
            body: `${user.firstName} a accepté votre offre de ${offer.amount.toLocaleString("fr-FR")} FCFA pour ${residenceName}.`,
            type: "OFFER_ACCEPTED",
            url: "/owner/offers",
          },
        });
      }
    });

    revalidatePath("/account/bookings");
    revalidatePath("/owner/offers");
    return { ok: true, reservationId };
  }

  if (input.action === "REJECT") {
    await prisma.$transaction(async (tx) => {
      await tx.priceOffer.update({
        where: { id: offer.id },
        data: { status: OfferStatus.REJECTED, respondedAt: now },
      });
      await tx.reservation.update({
        where: { id: reservationId },
        data: {
          negotiationStatus: NegotiationStatus.REJECTED,
          status: ReservationStatus.CANCELLED,
          cancelledAt: now,
        },
      });
      if (ownerId) {
        await tx.notification.create({
          data: {
            userId: ownerId,
            title: "Contre-offre refusée",
            body: `${user.firstName} a refusé votre contre-offre pour ${residenceName}.`,
            type: "OFFER_REJECTED",
            url: "/owner/offers",
          },
        });
      }
    });

    revalidatePath("/account/bookings");
    return { ok: true, reservationId };
  }

  if (input.action === "COUNTER") {
    if (!input.counterAmount || input.counterAmount < 1) {
      return { ok: false, error: "Indiquez un montant pour la contre-offre." };
    }

    const expiresAt = new Date(Date.now() + OFFER_TTL);
    let newOfferId: string;

    await prisma.$transaction(async (tx) => {
      await tx.priceOffer.update({
        where: { id: offer.id },
        data: { status: OfferStatus.COUNTERED, respondedAt: now },
      });
      const newOffer = await tx.priceOffer.create({
        data: {
          reservationId,
          amount: input.counterAmount!,
          proposedBy: OfferParty.TRAVELER,
          message: input.message ?? null,
          status: OfferStatus.PENDING,
          expiresAt,
        },
      });
      await tx.reservation.update({
        where: { id: reservationId },
        data: { expiresAt },
      });
      if (ownerId) {
        await tx.notification.create({
          data: {
            userId: ownerId,
            title: "Nouvelle contre-offre",
            body: `${user.firstName} propose ${input.counterAmount!.toLocaleString("fr-FR")} FCFA pour ${residenceName}.`,
            type: "COUNTER_OFFER",
            url: "/owner/offers",
          },
        });
      }
      newOfferId = newOffer.id;
    });

    revalidatePath("/account/bookings");
    return { ok: true, reservationId, offerId: newOfferId! };
  }

  return { ok: false, error: "Action inconnue." };
}

// ------------------------------------------------------------------
// 4. Cron : expirer les offres sans réponse après 24h
// ------------------------------------------------------------------
export async function expireStaleOffers(): Promise<{ expired: number }> {
  const now = new Date();

  const staleOffers = await prisma.priceOffer.findMany({
    where: { status: OfferStatus.PENDING, expiresAt: { lt: now } },
    include: {
      reservation: {
        select: {
          travelerId: true,
          residence: { select: { ownerId: true, name: true } },
        },
      },
    },
  });

  if (staleOffers.length === 0) return { expired: 0 };

  await prisma.$transaction(async (tx) => {
    await tx.priceOffer.updateMany({
      where: { id: { in: staleOffers.map((o) => o.id) } },
      data: { status: OfferStatus.EXPIRED },
    });
    await tx.reservation.updateMany({
      where: {
        id: { in: staleOffers.map((o) => o.reservationId) },
        negotiationStatus: NegotiationStatus.OPEN,
      },
      data: {
        negotiationStatus: NegotiationStatus.EXPIRED,
        status: ReservationStatus.CANCELLED,
        cancelledAt: now,
      },
    });
    await tx.notification.createMany({
      data: staleOffers.flatMap((o) => {
        const items = [];
        items.push({
          userId: o.reservation.travelerId,
          title: "Offre expirée",
          body: `Votre offre pour ${o.reservation.residence?.name ?? "la résidence"} a expiré sans réponse du propriétaire.`,
          type: "OFFER_EXPIRED",
          url: `/account/bookings/${o.reservationId}`,
        });
        if (o.reservation.residence?.ownerId) {
          items.push({
            userId: o.reservation.residence.ownerId,
            title: "Offre expirée",
            body: `Une offre pour ${o.reservation.residence.name} a expiré sans réponse de votre part.`,
            type: "OFFER_EXPIRED",
            url: "/owner/offers",
          });
        }
        return items;
      }),
    });
  });

  return { expired: staleOffers.length };
}
