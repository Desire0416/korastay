import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, CalendarDays, Users, MapPin, ChevronLeft, Receipt,
  ShieldCheck, Phone, Star, Package, Ticket, Clock, Send, Handshake, XCircle, AlertCircle,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getReservationDetail } from "@/lib/account-queries";
import { estimateResidenceRefund, estimatePackRefund, stayDiscountRate } from "@/lib/pricing";
import { getPaymentSettings, enabledPaymentMethods } from "@/lib/payment-rules";
import { CancelReservationButton } from "@/components/dashboard/cancel-reservation-button";
import { ValidationCountdown } from "@/components/dashboard/validation-countdown";
import { ManualPaymentPanel } from "@/components/dashboard/manual-payment-panel";
import { TravelerOfferPanel } from "@/components/dashboard/traveler-offer-panel";
import { ContactButton } from "@/components/messaging/contact-button";
import { SmartImage } from "@/components/ui/smart-image";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { reservationStatusMeta, paymentStatusMeta, cautionStatusMeta, paymentMethodMeta, offerStatusMeta } from "@/lib/enums";
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
  const justOffered = sp.offered === "1";
  const pendingValidation = sp.pending_validation === "1";
  const paySettings = await getPaymentSettings();
  const recvNumbers = paySettings.receivingNumbers ?? {};
  const manualOptions = enabledPaymentMethods(paySettings)
    .filter((v) => v !== "CARD") // la carte exige un agregateur en ligne
    .map((v) => ({ value: v, label: paymentMethodMeta[v]?.label ?? v, number: recvNumbers[v] ?? "" }));
  const hasPendingPayment = reservation.payments.some((p) => p.status === "PENDING");
  const isPack = reservation.type === "PACK";
  const isActivity = reservation.type === "ACTIVITY";
  const title = reservation.residence?.name ?? reservation.pack?.name ?? reservation.activity?.name ?? "Reservation";
  const image = reservation.residence?.images[0]?.url ?? reservation.pack?.images[0]?.url ?? reservation.activity?.images[0]?.url;
  const seed = reservation.residence?.slug ?? reservation.pack?.slug ?? reservation.activity?.slug ?? reservation.id;
  const placeLabel = reservation.residence?.city ?? reservation.pack?.destination?.name ?? reservation.activity?.city;
  const payment = reservation.payments[0];
  // Remises : la remise parrainage est stockee ; la remise sejour est le reste
  // (sous-total + menage + frais - total - parrainage).
  const referralDiscount = reservation.referralDiscountAmount;
  const stayDiscount = Math.max(
    0,
    reservation.subtotalAmount + reservation.cleaningFeeAmount + reservation.serviceFeeAmount - reservation.totalAmount - referralDiscount,
  );
  const stayDiscountPct = Math.round(stayDiscountRate(reservation.nights) * 100);

  const refund = isPack
    ? estimatePackRefund(reservation.totalAmount, reservation.serviceFeeAmount, reservation.startDate)
    : estimateResidenceRefund(reservation.totalAmount, reservation.serviceFeeAmount, reservation.startDate);

  const canCancel = ["CONFIRMED", "PENDING_PAYMENT", "PENDING_APPROVAL"].includes(reservation.status);
  const canReview = reservation.status === "COMPLETED" && !reservation.review;
  const hasReceipt = ["CONFIRMED", "CHECKED_IN", "COMPLETED"].includes(reservation.status);

  // Négociation
  const negotiationStatus = reservation.negotiationStatus ?? "NONE";
  const isNegotiating = negotiationStatus !== "NONE";
  const offerHistory = reservation.priceOffers ?? [];
  const pendingOfferFromOwner = offerHistory.find(
    (o) => o.status === "PENDING" && o.proposedBy === "OWNER",
  );
  const waitingForOwner =
    negotiationStatus === "OPEN" &&
    offerHistory.some((o) => o.status === "PENDING" && o.proposedBy === "TRAVELER");

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/account/bookings" className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Mes réservations
      </Link>

      {/* Offre envoyée */}
      {justOffered && reservation.status === "NEGOTIATING" && (
        <div className="mb-6 flex items-start gap-3 rounded-3xl border border-brand-200 bg-brand-50 p-5">
          <Handshake className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" />
          <div>
            <p className="font-bold text-brand-800">Offre envoyée !</p>
            <p className="text-sm text-brand-700/80">
              Votre offre a été transmise au propriétaire. Il dispose de <strong>24 heures</strong> pour vous répondre.
            </p>
          </div>
        </div>
      )}

      {justConfirmed && reservation.status === "CONFIRMED" && (
        <div className="mb-6 flex items-start gap-3 rounded-3xl border border-success/30 bg-emerald-50 p-5">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success" />
          <div>
            <p className="font-bold text-success">Réservation confirmée !</p>
            <p className="text-sm text-emerald-700/80">
              Un email de confirmation vous a ete envoyé. Votre reçu KoraStay est disponible ci-dessous.
            </p>
          </div>
        </div>
      )}

      {justRequested && reservation.status === "PENDING_APPROVAL" && (
        <div className="mb-6 flex items-start gap-3 rounded-3xl border border-gold-200 bg-gold-50 p-5">
          <Send className="mt-0.5 h-6 w-6 shrink-0 text-gold-600" />
          <div>
            <p className="font-bold text-gold-800">Demande envoyée !</p>
            <p className="text-sm text-gold-700/80">
              Votre demande est en attente de validation. Vous serez notifié des qu'elle sera acceptée pour regler l'acompte.
            </p>
          </div>
        </div>
      )}

      {(pendingValidation || (hasPendingPayment && reservation.status === "PENDING_PAYMENT")) && (
        <div className="mb-6 flex items-start gap-3 rounded-3xl border border-sky-200 bg-sky-50 p-5">
          <Clock className="mt-0.5 h-6 w-6 shrink-0 text-info" />
          <div>
            <p className="font-bold text-info">Paiement en cours de vérification</p>
            <p className="text-sm text-sky-700/80">
              Votre règlement nous a ete signale. Il sera confirmé des sa validation par l'équipe KoraStay - vous recevrez une notification.
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
                {isPack || isActivity ? <Package className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                {placeLabel}
                {isActivity && reservation.guideProfile ? ` · Guide : ${reservation.guideProfile.businessName}` : ""}
              </p>
              <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
            </div>
            <StatusBadge status={reservation.status} map={reservationStatusMeta} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-3">
          <Info icon={Ticket} label="Référence" value={reservation.reference} />
          <Info icon={CalendarDays} label="Dates" value={`${formatDate(reservation.startDate)} - ${formatDate(reservation.endDate)}`} />
          <Info icon={Users} label="Voyageurs" value={`${reservation.adults + reservation.children} personne${reservation.adults + reservation.children > 1 ? "s" : ""}`} />
        </div>
      </div>

      {/* ── Section négociation ── */}
      {isNegotiating && (
        <div className="mt-6 rounded-3xl border border-border bg-surface p-5 shadow-soft">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-foreground">
            <Handshake className="h-5 w-5 text-brand-600" /> Négociation de prix
          </h2>

          {/* Historique des offres */}
          {offerHistory.length > 0 && (
            <div className="mb-4 space-y-2">
              {offerHistory.map((offer) => (
                <div key={offer.id} className="flex items-center justify-between rounded-xl bg-surface-soft px-3 py-2.5 text-sm">
                  <span className="text-muted">
                    {offer.proposedBy === "TRAVELER" ? "Votre offre" : "Contre-offre du propriétaire"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{formatPrice(offer.amount)}</span>
                    <StatusBadge status={offer.status} map={offerStatusMeta} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* États de la négociation */}
          {negotiationStatus === "OPEN" && waitingForOwner && (
            <div className="flex items-start gap-3 rounded-2xl bg-brand-50/60 px-4 py-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-brand-800">En attente du propriétaire</p>
                <p className="text-xs text-brand-700/80">Le propriétaire a 24h pour accepter, refuser ou faire une contre-offre.</p>
              </div>
            </div>
          )}

          {negotiationStatus === "OPEN" && pendingOfferFromOwner && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-warning-200 bg-warning-50/60 px-4 py-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning-600" />
                <div>
                  <p className="text-sm font-semibold text-warning-800">Contre-offre reçue !</p>
                  <p className="text-xs text-warning-700/80">
                    Le propriétaire propose {formatPrice(pendingOfferFromOwner.amount)}.
                    {pendingOfferFromOwner.message && ` Message : "${pendingOfferFromOwner.message}"`}
                  </p>
                </div>
              </div>
              <TravelerOfferPanel
                offerId={pendingOfferFromOwner.id}
                counterAmount={pendingOfferFromOwner.amount}
              />
            </div>
          )}

          {negotiationStatus === "AGREED" && (
            <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div>
                <p className="text-sm font-semibold text-success">Accord trouvé !</p>
                <p className="text-xs text-emerald-700/80">
                  Prix négocié : <strong>{formatPrice(reservation.negotiatedPrice ?? reservation.subtotalAmount)}</strong>.
                  La réservation est en cours de traitement.
                </p>
              </div>
            </div>
          )}

          {negotiationStatus === "REJECTED" && (
            <div className="flex items-start gap-3 rounded-2xl bg-danger-50/60 px-4 py-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger-600" />
              <div>
                <p className="text-sm font-semibold text-danger-700">Négociation refusée</p>
                <p className="text-xs text-danger-600/80">La négociation n&apos;a pas abouti. Vous pouvez proposer une nouvelle offre.</p>
              </div>
            </div>
          )}

          {negotiationStatus === "EXPIRED" && (
            <div className="flex items-start gap-3 rounded-2xl bg-surface-soft px-4 py-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
              <div>
                <p className="text-sm font-semibold text-foreground">Offre expirée</p>
                <p className="text-xs text-muted">Le délai de 24h est dépassé sans réponse du propriétaire.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* En attente de validation : compte a rebours */}
      {reservation.status === "PENDING_APPROVAL" && reservation.expiresAt && (
        <div className="mt-6 rounded-3xl border border-gold-200 bg-gold-50/50 p-5 shadow-soft">
          <p className="mb-1.5 flex items-center gap-2 font-bold text-gold-800">
            <Clock className="h-5 w-5" /> En attente de validation
          </p>
          <p className="mb-4 text-sm text-gold-800/80">
            Votre demande a ete transmise {isPack ? "a l'équipe KoraStay" : "a l'hôte et a KoraStay"}.
            Une fois validée, vous reglerez un acompte de <strong>{formatPrice(reservation.depositAmount)}</strong> pour confirmer.
          </p>
          <ValidationCountdown
            deadline={reservation.expiresAt.toISOString()}
            startedAt={reservation.createdAt.toISOString()}
          />
        </div>
      )}

      {/* Validee : paiement de l'acompte */}
      {reservation.status === "PENDING_PAYMENT" && !hasPendingPayment && (
        <div className="mt-6 rounded-3xl border border-brand-200 bg-brand-50/50 p-5 shadow-soft">
          <p className="mb-1 flex items-center gap-2 font-bold text-brand-800">
            <CheckCircle2 className="h-5 w-5" /> Demande validée !
          </p>
          <p className="mb-4 text-sm text-brand-800/80">
            Reglez <strong>{formatPrice(reservation.depositAmount)}</strong> ({reservation.paymentPolicy === "FULL" ? "100% du séjour" : "acompte"}) pour confirmer votre réservation.
            {reservation.balanceDueAmount > 0 && ` Le solde (${formatPrice(reservation.balanceDueAmount)}) sera regle avant ou au check-in.`}
          </p>
          {reservation.expiresAt && (
            <p className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-gold-700">
              <Clock className="h-4 w-4 shrink-0" /> À régler avant le {formatDate(reservation.expiresAt)} — au-delà, la réservation est annulée et les dates libérées.
            </p>
          )}
          <ManualPaymentPanel
            reservationId={reservation.id}
            amountLabel={formatPrice(reservation.depositAmount)}
            reference={reservation.reference}
            options={manualOptions}
            bankDetails={paySettings.bankDetails ?? ""}
            instructions={paySettings.manualInstructions ?? ""}
          />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Detail paiement */}
        <div className="space-y-6">
          <section className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-foreground">
              <Receipt className="h-5 w-5 text-brand-600" /> Détail du paiement
            </h2>
            <div className="space-y-2.5 text-sm">
              <Row label={isNegotiating ? "Montant négocié" : "Prix du séjour"} value={formatPrice(reservation.subtotalAmount)} />
              {reservation.cleaningFeeAmount > 0 && <Row label="Frais de ménage" value={formatPrice(reservation.cleaningFeeAmount)} />}
              <Row label="Frais de service KoraStay" value={formatPrice(reservation.serviceFeeAmount)} />
              {stayDiscount > 0 && (
                <div className="flex justify-between font-semibold text-success">
                  <span>Réduction séjour{stayDiscountPct > 0 ? ` (−${stayDiscountPct}%)` : ""}</span>
                  <span>−{formatPrice(stayDiscount)}</span>
                </div>
              )}
              {referralDiscount > 0 && (
                <div className="flex justify-between font-semibold text-success">
                  <span>Parrainage (−5%)</span>
                  <span>−{formatPrice(referralDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-3 text-base font-extrabold text-foreground">
                <span>Total du séjour</span><span>{formatPrice(reservation.totalAmount)}</span>
              </div>
              {reservation.cautionAmount > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-surface-soft px-3 py-2 text-foreground">
                  <span className="flex items-center gap-1.5">Caution (dépôt de garantie)
                    <StatusBadge status={reservation.cautionStatus} map={cautionStatusMeta} size="sm" />
                  </span>
                  <span className="font-semibold">{formatPrice(reservation.cautionAmount)}</span>
                </div>
              )}
              {reservation.depositAmount > 0 && reservation.status !== "PENDING_APPROVAL" && reservation.status !== "NEGOTIATING" && (
                <div className="mt-1 space-y-1 rounded-2xl bg-brand-50/60 px-3 py-2.5">
                  <div className="flex justify-between text-brand-800">
                    <span className="font-semibold">Montant {hasReceipt ? "regle" : "a payer maintenant"}</span>
                    <span className="font-bold">{formatPrice(hasReceipt ? reservation.amountPaid : reservation.depositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Solde restant</span>
                    <span>{formatPrice(reservation.balanceDueAmount)}</span>
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
            <p className="mt-4 flex items-start gap-2 rounded-2xl bg-emerald-50/70 px-4 py-3 text-xs text-emerald-800">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              {paySettings.payViaKoraStayNote}
            </p>
          </section>

          {/* Programme pack */}
          {isPack && reservation.pack?.programDays && reservation.pack.programDays.length > 0 && (
            <section className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
              <h2 className="mb-4 font-bold text-foreground">Programme du séjour</h2>
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
              <p className="text-sm font-bold text-foreground">Votre hôte</p>
              <p className="mt-1 text-sm text-muted">{reservation.residence.owner.firstName}</p>
              <div className="mt-3 space-y-2">
                <ContactButton
                  otherUserId={reservation.residence.owner.id}
                  reservationId={reservation.id}
                  subject={`Réservation ${reservation.reference}`}
                  basePath="/account/messages"
                  label="Contacter l'hôte"
                  variant="primary"
                  className="w-full"
                />
                {reservation.residence.owner.phone && (
                  <a href={`tel:${reservation.residence.owner.phone}`} className="flex items-center justify-center gap-2 text-sm font-semibold text-muted hover:text-foreground">
                    <Phone className="h-4 w-4" /> {reservation.residence.owner.phone}
                  </a>
                )}
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/residences/${reservation.residence.slug}`}>Voir la résidence</Link>
                </Button>
              </div>
            </div>
          )}

          {hasReceipt && (
            <Button asChild variant="outline" className="w-full">
              <Link href={`/account/bookings/${reservation.id}/recu`} target="_blank">
                <Receipt className="h-4 w-4" /> Reçu KoraStay
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
            Réservation protégée par KoraStay Assistance.
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
