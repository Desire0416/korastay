import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { expireStaleOffers } from "@/server/actions/negotiation";

/**
 * Taches planifiees KoraStay. A appeler periodiquement (ex: toutes les 15 min)
 * via un planificateur (Vercel Cron, GitHub Actions, cron-job.org...).
 *   GET /api/cron?secret=XXX   (XXX = process.env.CRON_SECRET si defini)
 *
 * Idempotent : peut etre appele plusieurs fois sans effets indesirables.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.nextUrl.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const now = new Date();
  const result = { approvalExpired: 0, expiredReleased: 0, autoCompleted: 0, checkinReminders: 0, reviewInvites: 0, offersExpired: 0 };

  // 0) Annuler les demandes non validees dans le delai (24h residence / 7j pack)
  const staleApproval = await prisma.reservation.findMany({
    where: { status: "PENDING_APPROVAL", expiresAt: { lt: now } },
    select: { id: true, travelerId: true, reference: true },
  });
  for (const r of staleApproval) {
    await prisma.$transaction([
      prisma.reservation.update({ where: { id: r.id }, data: { status: "CANCELLED", cancelledAt: now } }),
      prisma.notification.create({
        data: { userId: r.travelerId, title: "Demande expirée", body: `Votre demande ${r.reference} a expire sans validation et a ete annulée.`, type: "RESERVATION_CANCELLED", url: "/account/bookings" },
      }),
    ]);
    result.approvalExpired++;
  }

  // 1) Annuler les reservations dont le delai de paiement est expire SANS
  //    paiement declare. Declarer un paiement met expiresAt a null (l'admin
  //    valide), donc ces reservations ne sont jamais concernees ici.
  const expired = await prisma.reservation.findMany({
    where: {
      status: "PENDING_PAYMENT",
      expiresAt: { lt: now },
      payments: { none: { status: { in: ["PENDING", "PAID"] } } },
    },
    select: { id: true, travelerId: true, reference: true },
  });
  for (const r of expired) {
    await prisma.$transaction([
      prisma.reservation.update({ where: { id: r.id }, data: { status: "CANCELLED", cancelledAt: now } }),
      prisma.payment.updateMany({ where: { reservationId: r.id, status: { in: ["PENDING", "PROCESSING"] } }, data: { status: "EXPIRED" } }),
      prisma.notification.create({
        data: {
          userId: r.travelerId,
          title: "Réservation annulée",
          body: `Faute de paiement dans les délais, votre réservation ${r.reference} a ete annulée. Les dates sont a nouveau disponibles.`,
          type: "RESERVATION_CANCELLED",
          url: "/account/bookings",
        },
      }),
    ]);
    result.expiredReleased++;
  }

  // 2) Marquer terminees les reservations dont le sejour est passe
  const toComplete = await prisma.reservation.findMany({
    where: { status: { in: ["CONFIRMED", "CHECKED_IN"] }, endDate: { lt: now } },
    select: { id: true },
  });
  for (const r of toComplete) {
    await prisma.reservation.update({ where: { id: r.id }, data: { status: "COMPLETED" } });
    result.autoCompleted++;
  }

  // 3) Rappels de check-in (sejour qui commence dans les 36h)
  const soon = new Date(now.getTime() + 36 * 60 * 60 * 1000);
  const upcoming = await prisma.reservation.findMany({
    where: { status: "CONFIRMED", startDate: { gte: now, lte: soon } },
    select: { id: true, travelerId: true, reference: true },
  });
  for (const r of upcoming) {
    const already = await prisma.notification.count({ where: { userId: r.travelerId, type: "CHECKIN_REMINDER", url: `/account/bookings/${r.id}` } });
    if (already === 0) {
      await prisma.notification.create({
        data: { userId: r.travelerId, title: "Votre séjour approche", body: `Rappel : votre séjour ${r.reference} commence bientôt.`, type: "CHECKIN_REMINDER", url: `/account/bookings/${r.id}` },
      });
      result.checkinReminders++;
    }
  }

  // 4) Invitations a laisser un avis (sejours termines sans avis)
  const completed = await prisma.reservation.findMany({
    where: { status: "COMPLETED", review: null },
    select: { id: true, travelerId: true },
    take: 200,
  });
  for (const r of completed) {
    const already = await prisma.notification.count({ where: { userId: r.travelerId, type: "REVIEW_INVITE", url: `/account/bookings/${r.id}` } });
    if (already === 0) {
      await prisma.notification.create({
        data: { userId: r.travelerId, title: "Laissez un avis", body: "Comment s'est passe votre séjour ? Partagez votre avis.", type: "REVIEW_INVITE", url: `/account/bookings/${r.id}` },
      });
      result.reviewInvites++;
    }
  }

  // 5) Expirer les offres de prix sans réponse
  const { expired: offersExpired } = await expireStaleOffers();
  result.offersExpired = offersExpired;

  return NextResponse.json({ ok: true, ranAt: now.toISOString(), ...result });
}
