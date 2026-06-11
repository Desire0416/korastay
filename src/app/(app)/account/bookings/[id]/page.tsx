import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, CalendarDays, Users, MapPin, ChevronLeft, Receipt,
  ShieldCheck, Phone, Star, Package, Ticket, Clock, Send,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getReservationDetail } from "@/lib/account-queries";
import { estimateResidenceRefund, estimatePackRefund } from "@/lib/pricing";
import { CancelReservationButton } from "@/components/dashboard/cancel-reservation-button";
import { ValidationCountdown } from "@/components/dashboard/validation-countdown";
import { PayDepositButton } from "@/components/dashboard/pay-deposit-button";
import { ContactButton } from "@/components/messaging/contact-button";
import { SmartImage } from "@/components/ui/smart-image";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { reservationStatusMeta, paymentStatusMeta } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";

type SP = Record<string, string | string[] | undefined>;

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SP>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const reservation = await getReservationDetail(user.id, id);
  if (!reservation) notFound();

  const justConfirmed = sp.confirmed === "1";
  const justRequested = sp.requested === "1";
  const isPack = reservation.type === "PACK";
  const title = reservation.residence?.name ?? reservation.pack?.name ?? "Reservation";
  const image = reservation.residence?.images[0]?.url ?? reservation.pack?.images[0]?.url;
  const seed = reservation.residence?.slug ?? reservation.pack?.slug ?? reservation.id;
  const payment = reservation.payments[0];

  const refund = isPack
    ? estimatePackRefund(reservation.totalAmount, reservation.serviceFeeAmount, reservation.startDate)
    : estimateResidenceRefund(reservation.totalAmount, reservation.serviceFeeAmount, reservation.startDate);

  const canCancel = ["CONFIRMED", "PENDING_PAYMENT", "PENDING_APPROVAL"].includes(reservation.status);
  const canReview = reservation.status === "COMPLETED" && !reservation.review;
  const hasReceipt = ["CONFIRMED", "CHECKED_IN", "COMPLETED"].includes(reservation.status);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/account/bookings" className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Mes reservations
      </Link>

      {justConfirmed && reservation.status === "CONFIRMED" && (
        <div className="mb-6 flex items-start gap-3 rounded-3xl border border-success/30 bg-emerald-50 p-5">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success" />
          <div>
            <p className="font-bold text-success">Reservation confirmee !</p>
            <p className="text-sm text-emerald-700/80">
              Un email de confirmation vous a ete envoye. Votre recu KoraStay est disponible ci-dessous.
            </p>
          </div>
        </div>
      )}

      {justRequested && reservation.status === "PENDING_APPROVAL" && (
        <div className="mb-6 flex items-start gap-3 rounded-3xl border border-gold-200 bg-gold-50 p-5">
          <Send className="mt-0.5 h-6 w-6 shrink-0 text-gold-600" />
          <div>
            <p className="font-bold text-gold-800">Demande envoyee !</p>
            <p className="text-sm text-gold-700/80">
              Votre demande est en attente de validation. Vous serez notifie des qu'elle sera acceptee pour regler l'acompte.
            </p>
          </div>
        </div>
      )}

      {/* Entete */}
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
        <div className="relative h-44 sm:h-52">
          <SmartImage src={image} alt={title} seed={`${seed}-0`} priority />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-5 text-white">
            <div>
              <p className="flex items-center gap-1.5 text-sm text-white/80">
                {isPack ? <Package className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                {reservation.residence?.city ?? reservation.pack?.destination?.name}
              </p>
              <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
            </div>
            <StatusBadge status={reservation.status} map={reservationStatusMeta} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-3">
          <Info icon={Ticket} label="Reference" value={reservation.reference} />
          <Info icon={CalendarDays} label="Dates" value={`${formatDate(reservation.startDate)} - ${formatDate(reservation.endDate)}`} />
          <Info icon={Users} label="Voyageurs" value={`${reservation.adults + reservation.children} personne${reservation.adults + reservation.children > 1 ? "s" : ""}`} />
        </div>
      </div>

      {/* En attente de validation : compte a rebours */}
      {reservation.status === "PENDING_APPROVAL" && reservation.expiresAt && (
        <div className="mt-6 rounded-3xl border border-gold-200 bg-gold-50/50 p-5 shadow-soft">
          <p className="mb-1.5 flex items-center gap-2 font-bold text-gold-800">
            <Clock className="h-5 w-5" /> En attente de validation
          </p>
          <p className="mb-4 text-sm text-gold-800/80">
            Votre demande a ete transmise {isPack ? "a l'equipe KoraStay" : "a l'hote et a KoraStay"}.
            Une fois validee, vous reglerez un acompte de <strong>{formatPrice(reservation.depositAmount)}</strong> pour confirmer.
          </p>
          <ValidationCountdown
            deadline={reservation.expiresAt.toISOString()}
            startedAt={reservation.createdAt.toISOString()}
          />
        </div>
      )}

      {/* Validee : paiement de l'acompte */}
      {reservation.status === "PENDING_PAYMENT" && (
        <div className="mt-6 rounded-3xl border border-brand-200 bg-brand-50/50 p-5 shadow-soft">
          <p className="mb-1 flex items-center gap-2 font-bold text-brand-800">
            <CheckCircle2 className="h-5 w-5" /> Demande validee !
          </p>
          <p className="mb-4 text-sm text-brand-800/80">
            Reglez l'acompte de <strong>{formatPrice(reservation.depositAmount)}</strong> pour confirmer votre reservation.
            Le solde ({formatPrice(reservation.totalAmount - reservation.depositAmount)}) sera regle sur place.
          </p>
          <PayDepositButton reservationId={reservation.id} amountLabel={formatPrice(reservation.depositAmount)} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Detail paiement */}
        <div className="space-y-6">
          <section className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-foreground">
              <Receipt className="h-5 w-5 text-brand-600" /> Detail du paiement
            </h2>
            <div className="space-y-2.5 text-sm">
              <Row label="Sous-total" value={formatPrice(reservation.subtotalAmount)} />
              {reservation.cleaningFeeAmount > 0 && <Row label="Frais de menage" value={formatPrice(reservation.cleaningFeeAmount)} />}
              <Row label="Frais de service" value={formatPrice(reservation.serviceFeeAmount)} />
              <div className="flex justify-between border-t border-border pt-3 text-base font-extrabold text-foreground">
                <span>Total</span><span>{formatPrice(reservation.totalAmount)}</span>
              </div>
              {reservation.depositAmount > 0 && reservation.status !== "PENDING_APPROVAL" && (
                <div className="mt-1 space-y-1 rounded-2xl bg-brand-50/60 px-3 py-2.5">
                  <div className="flex justify-between text-brand-800">
                    <span className="font-semibold">Acompte {hasReceipt ? "regle" : "a regler"}</span>
                    <span className="font-bold">{formatPrice(reservation.depositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Solde a regler sur place</span>
                    <span>{formatPrice(reservation.totalAmount - reservation.depositAmount)}</span>
                  </div>
                </div>
              )}
            </div>
            {payment && (
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-surface-soft px-4 py-3">
                <span className="text-sm font-medium text-foreground">Statut du paiement</span>
                <StatusBadge status={payment.status} map={paymentStatusMeta} size="sm" />
              </div>
            )}
            {reservation.refunds.length > 0 && (
              <div className="mt-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-info">
                Remboursement de {formatPrice(reservation.refunds[0].amount)} en cours de traitement.
              </div>
            )}
          </section>

          {/* Programme pack */}
          {isPack && reservation.pack?.programDays && reservation.pack.programDays.length > 0 && (
            <section className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
              <h2 className="mb-4 font-bold text-foreground">Programme du sejour</h2>
              <div className="space-y-5">
                {reservation.pack.programDays.map((day) => (
                  <div key={day.id}>
                    <p className="text-sm font-bold text-brand-600">Jour {day.dayNumber} - {day.title}</p>
                    <ul className="mt-2 space-y-1.5 border-l-2 border-border pl-4">
                      {day.activities.map((a) => (
                        <li key={a.id} className="text-sm text-foreground/90">
                          {a.timeLabel && <span className="font-semibold">{a.timeLabel} : </span>}{a.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Actions */}
        <aside className="space-y-4">
          {reservation.residence && (
            <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
              <p className="text-sm font-bold text-foreground">Votre hote</p>
              <p className="mt-1 text-sm text-muted">{reservation.residence.owner.firstName}</p>
              <div className="mt-3 space-y-2">
                <ContactButton
                  otherUserId={reservation.residence.owner.id}
                  reservationId={reservation.id}
                  subject={`Reservation ${reservation.reference}`}
                  basePath="/account/messages"
                  label="Contacter l'hote"
                  variant="primary"
                  className="w-full"
                />
                {reservation.residence.owner.phone && (
                  <a href={`tel:${reservation.residence.owner.phone}`} className="flex items-center justify-center gap-2 text-sm font-semibold text-muted hover:text-foreground">
                    <Phone className="h-4 w-4" /> {reservation.residence.owner.phone}
                  </a>
                )}
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/residences/${reservation.residence.slug}`}>Voir la residence</Link>
                </Button>
              </div>
            </div>
          )}

          {hasReceipt && (
            <Button asChild variant="outline" className="w-full">
              <Link href={`/account/bookings/${reservation.id}/recu`} target="_blank">
                <Receipt className="h-4 w-4" /> Recu KoraStay
              </Link>
            </Button>
          )}

          {canReview && (
            <Button asChild className="w-full">
              <Link href="/account/reviews"><Star className="h-4 w-4" /> Laisser un avis</Link>
            </Button>
          )}

          {canCancel && (
            <CancelReservationButton
              reservationId={reservation.id}
              refundLabel={refund.label}
              refundAmount={refund.refundableAmount}
            />
          )}

          <div className="flex items-center gap-2 rounded-2xl bg-surface-soft px-4 py-3 text-xs text-muted">
            <ShieldCheck className="h-4 w-4 text-brand-500" />
            Reservation protegee par KoraStay Assistance.
          </div>
        </aside>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Ticket; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 text-muted" />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted">
      <span>{label}</span><span className="text-foreground">{value}</span>
    </div>
  );
}
