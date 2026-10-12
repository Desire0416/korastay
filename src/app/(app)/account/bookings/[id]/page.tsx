import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, CalendarDays, Users, MapPin, ChevronLeft, Receipt,
  ShieldCheck, Phone, Star, Package, Ticket, Clock, Send, Handshake, XCircle, AlertCircle,
  type LucideIcon,
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
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAccount.card.booking };
}

type SP = Record<string, string | string[] | undefined>;

// Bandeau d'etat (succes, info, attente...) en haut de la fiche.
function Banner({ icon: Icon, tone, title, text }: { icon: LucideIcon; tone: "brand" | "gold" | "ink" | "terracotta"; title: string; text: string }) {
  const styles = {
    brand: "bg-brand-500 text-white",
    gold: "bg-gold-400 text-ink-900",
    ink: "bg-ink text-white",
    terracotta: "bg-terracotta text-white",
  }[tone];
  return (
    <div className={cn("mb-6 flex items-start gap-4 rounded-[1.5rem] p-5 shadow-soft", styles)}>
      <span className="flex h-11 w-10 shrink-0 items-center justify-center rounded-arch-sm bg-white/15">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <div>
        <p className="font-display text-xl">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed opacity-85">{text}</p>
      </div>
    </div>
  );
}

// Encart d'etat de negociation.
function Notice({ icon: Icon, tone, title, text }: { icon: LucideIcon; tone: "brand" | "warning" | "danger" | "neutral" | "success"; title: string; text: string }) {
  const styles = {
    brand: "bg-brand-50 text-brand-800 ring-brand-200/70",
    success: "bg-brand-50 text-brand-800 ring-brand-200/70",
    warning: "bg-warning-50 text-warning-800 ring-warning-200/70",
    danger: "bg-danger-50 text-danger-700 ring-danger-200/70",
    neutral: "bg-sand-50 text-foreground ring-sand-200",
  }[tone];
  return (
    <div className={cn("flex items-start gap-3 rounded-xl px-4 py-3 ring-1 ring-inset", styles)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs leading-relaxed opacity-80">{text}</p>
      </div>
    </div>
  );
}

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
  const [reservation, { locale, dict }] = await Promise.all([getReservationDetail(user.id, id), getI18n()]);
  if (!reservation) notFound();
  const t = dict.dashAccount.detail;

  const justConfirmed = sp.confirmed === "1";
  const justRequested = sp.requested === "1";
  const justOffered = sp.offered === "1";
  const pendingValidation = sp.pending_validation === "1";
  const paySettings = await getPaymentSettings();
  const recvNumbers = paySettings.receivingNumbers ?? {};
  const manualOptions = enabledPaymentMethods(paySettings)
    .filter((v) => v !== "CARD") // la carte exige un agregateur en ligne
    .map((v) => ({
      value: v,
      label: dict.enums.paymentMethod[v]?.label ?? paymentMethodMeta[v]?.label ?? v,
      number: recvNumbers[v] ?? "",
    }));
  const hasPendingPayment = reservation.payments.some((p) => p.status === "PENDING");
  const isPack = reservation.type === "PACK";
  const isActivity = reservation.type === "ACTIVITY";
  const title = reservation.residence?.name ?? reservation.pack?.name ?? reservation.activity?.name ?? dict.dashAccount.card.booking;
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
  const r = dict.dashAccount.refund;
  const refundLabel = isPack
    ? refund.refundRate === 1 ? r.packFull : refund.refundRate > 0 ? r.packHalf : r.packNone
    : refund.refundRate === 1 ? r.residenceFull : refund.refundRate > 0 ? r.residenceHalf : r.residenceNone;

  const canCancel = ["CONFIRMED", "PENDING_PAYMENT", "PENDING_APPROVAL"].includes(reservation.status);
  const canReview = reservation.status === "COMPLETED" && !reservation.review;
  const hasReceipt = ["CONFIRMED", "CHECKED_IN", "COMPLETED"].includes(reservation.status);

  // Negociation
  const negotiationStatus = reservation.negotiationStatus ?? "NONE";
  const isNegotiating = negotiationStatus !== "NONE";
  const offerHistory = reservation.priceOffers ?? [];
  const pendingOfferFromOwner = offerHistory.find((o) => o.status === "PENDING" && o.proposedBy === "OWNER");
  const waitingForOwner =
    negotiationStatus === "OPEN" && offerHistory.some((o) => o.status === "PENDING" && o.proposedBy === "TRAVELER");

  const guests = reservation.adults + reservation.children;
  const card = "rounded-[1.5rem] border border-border/80 bg-surface p-5 shadow-soft sm:p-6";

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={localePath("/account/bookings", locale)} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>

      {justOffered && reservation.status === "NEGOTIATING" && (
        <Banner icon={Handshake} tone="brand" title={t.offerSentTitle} text={t.offerSentText} />
      )}
      {justConfirmed && reservation.status === "CONFIRMED" && (
        <Banner icon={CheckCircle2} tone="brand" title={t.confirmedTitle} text={t.confirmedText} />
      )}
      {justRequested && reservation.status === "PENDING_APPROVAL" && (
        <Banner icon={Send} tone="gold" title={t.requestedTitle} text={t.requestedText} />
      )}
      {(pendingValidation || (hasPendingPayment && reservation.status === "PENDING_PAYMENT")) && (
        <Banner icon={Clock} tone="ink" title={t.verifyingTitle} text={t.verifyingText} />
      )}

      {/* En-tete */}
      <div className="overflow-hidden rounded-[1.75rem] border border-border/80 bg-surface shadow-soft">
        <div className="relative h-48 sm:h-60">
          <SmartImage src={image} alt={title} seed={`${seed}-0`} priority sizes="(max-width: 1024px) 100vw, 900px" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white sm:p-6">
            <div className="min-w-0">
              <p className="eyebrow flex items-center gap-1.5 text-[10px] text-gold-300">
                {isPack || isActivity ? <Package className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                {placeLabel}
                {isActivity && reservation.guideProfile ? ` · ${t.guide.replace("{name}", reservation.guideProfile.businessName)}` : ""}
              </p>
              <h1 className="mt-1.5 font-display text-[1.75rem] leading-tight sm:text-[2.1rem]">{title}</h1>
            </div>
            <StatusBadge status={reservation.status} map={reservationStatusMeta} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px bg-border/70 sm:grid-cols-3">
          <Info icon={Ticket} label={t.reference} value={reservation.reference} />
          <Info icon={CalendarDays} label={t.dates} value={`${formatDate(reservation.startDate, locale)} – ${formatDate(reservation.endDate, locale)}`} />
          <Info icon={Users} label={t.travelers} value={t.persons.replace("{n}", String(guests))} />
        </div>
      </div>

      {/* Negociation */}
      {isNegotiating && (
        <div className={cn("mt-6", card)}>
          <h2 className="mb-4 flex items-center gap-2.5 font-display text-xl text-foreground">
            <Handshake className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.negotiationTitle}
          </h2>

          {offerHistory.length > 0 && (
            <div className="mb-4 space-y-2">
              {offerHistory.map((offer) => (
                <div key={offer.id} className="flex items-center justify-between rounded-xl bg-sand-50 px-4 py-2.5 text-sm ring-1 ring-inset ring-sand-200">
                  <span className="text-muted">{offer.proposedBy === "TRAVELER" ? t.yourOffer : t.ownerCounter}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{formatPrice(offer.amount)}</span>
                    <StatusBadge status={offer.status} map={offerStatusMeta} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {negotiationStatus === "OPEN" && waitingForOwner && (
            <Notice icon={Clock} tone="brand" title={t.waitingOwnerTitle} text={t.waitingOwnerText} />
          )}

          {negotiationStatus === "OPEN" && pendingOfferFromOwner && (
            <div className="space-y-4">
              <Notice
                icon={AlertCircle}
                tone="warning"
                title={t.counterTitle}
                text={
                  t.counterText.replace("{amount}", formatPrice(pendingOfferFromOwner.amount)) +
                  (pendingOfferFromOwner.message ? ` ${t.counterMessage.replace("{message}", pendingOfferFromOwner.message)}` : "")
                }
              />
              <TravelerOfferPanel offerId={pendingOfferFromOwner.id} counterAmount={pendingOfferFromOwner.amount} />
            </div>
          )}

          {negotiationStatus === "AGREED" && (
            <Notice
              icon={CheckCircle2}
              tone="success"
              title={t.agreedTitle}
              text={t.agreedText.replace("{amount}", formatPrice(reservation.negotiatedPrice ?? reservation.subtotalAmount))}
            />
          )}
          {negotiationStatus === "REJECTED" && <Notice icon={XCircle} tone="danger" title={t.rejectedTitle} text={t.rejectedText} />}
          {negotiationStatus === "EXPIRED" && <Notice icon={Clock} tone="neutral" title={t.expiredTitle} text={t.expiredText} />}
        </div>
      )}

      {/* En attente de validation : compte a rebours */}
      {reservation.status === "PENDING_APPROVAL" && reservation.expiresAt && (
        <div className="mt-6 rounded-[1.5rem] bg-gold-50 p-5 shadow-soft ring-1 ring-inset ring-gold-200/70 sm:p-6">
          <p className="mb-1.5 flex items-center gap-2 font-display text-xl text-gold-900">
            <Clock className="h-5 w-5" /> {t.pendingTitle}
          </p>
          <p className="mb-4 text-sm leading-relaxed text-gold-900/80">
            {(isPack ? t.pendingTextPack : t.pendingTextResidence).replace("{amount}", formatPrice(reservation.depositAmount))}
          </p>
          <ValidationCountdown deadline={reservation.expiresAt.toISOString()} startedAt={reservation.createdAt.toISOString()} />
        </div>
      )}

      {/* Validee : paiement de l'acompte */}
      {reservation.status === "PENDING_PAYMENT" && !hasPendingPayment && (
        <div className="relative mt-6 overflow-hidden rounded-[1.5rem] border border-border/80 bg-surface p-5 pt-7 shadow-card sm:p-6 sm:pt-8">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 overflow-hidden">
            <div className="motif motif-kente text-terracotta/70" />
          </div>
          <p className="mb-1 flex items-center gap-2 font-display text-xl text-brand-700">
            <CheckCircle2 className="h-5 w-5" /> {t.approvedTitle}
          </p>
          <p className="mb-4 text-sm leading-relaxed text-foreground/80">
            {t.approvedText
              .replace("{amount}", formatPrice(reservation.depositAmount))
              .replace("{part}", reservation.paymentPolicy === "FULL" ? t.full : t.deposit)}
            {reservation.balanceDueAmount > 0 && t.balanceText.replace("{amount}", formatPrice(reservation.balanceDueAmount))}
          </p>
          {reservation.expiresAt && (
            <p className="mb-5 flex items-center gap-1.5 rounded-xl bg-warning-50 px-3 py-2 text-sm font-semibold text-warning-800 ring-1 ring-inset ring-warning-200/70">
              <Clock className="h-4 w-4 shrink-0" /> {t.payBefore.replace("{date}", formatDate(reservation.expiresAt, locale))}
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
        <div className="space-y-6">
          {/* Detail du paiement */}
          <section className={card}>
            <h2 className="mb-4 flex items-center gap-2.5 font-display text-xl text-foreground">
              <Receipt className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.paymentTitle}
            </h2>
            <div className="space-y-2.5 text-sm">
              <Row label={isNegotiating ? t.negotiatedAmount : t.stayPrice} value={formatPrice(reservation.subtotalAmount)} />
              {reservation.cleaningFeeAmount > 0 && <Row label={t.cleaningFee} value={formatPrice(reservation.cleaningFeeAmount)} />}
              <Row label={t.serviceFee} value={formatPrice(reservation.serviceFeeAmount)} />
              {stayDiscount > 0 && (
                <div className="flex justify-between font-semibold text-success">
                  <span>{t.stayDiscount}{stayDiscountPct > 0 ? ` (−${stayDiscountPct} %)` : ""}</span>
                  <span>−{formatPrice(stayDiscount)}</span>
                </div>
              )}
              {referralDiscount > 0 && (
                <div className="flex justify-between font-semibold text-success">
                  <span>{t.referral}</span>
                  <span>−{formatPrice(referralDiscount)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-border pt-3 font-bold text-foreground">
                <span>{t.stayTotal}</span>
                <span className="font-display text-2xl font-normal">{formatPrice(reservation.totalAmount)}</span>
              </div>
              {reservation.cautionAmount > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-sand-50 px-3 py-2.5 text-foreground ring-1 ring-inset ring-sand-200">
                  <span className="flex flex-wrap items-center gap-1.5">
                    {t.caution}
                    <StatusBadge status={reservation.cautionStatus} map={cautionStatusMeta} size="sm" />
                  </span>
                  <span className="font-semibold">{formatPrice(reservation.cautionAmount)}</span>
                </div>
              )}
              {reservation.depositAmount > 0 && reservation.status !== "PENDING_APPROVAL" && reservation.status !== "NEGOTIATING" && (
                <div className="mt-1 space-y-1 rounded-xl bg-brand-50 px-3.5 py-3 ring-1 ring-inset ring-brand-200/60">
                  <div className="flex justify-between text-brand-800">
                    <span className="font-semibold">{hasReceipt ? t.amountPaid : t.amountNow}</span>
                    <span className="font-bold">{formatPrice(hasReceipt ? reservation.amountPaid : reservation.depositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>{t.balance}</span>
                    <span>{formatPrice(reservation.balanceDueAmount)}</span>
                  </div>
                </div>
              )}
            </div>
            {payment && (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-sand-50 px-4 py-3 ring-1 ring-inset ring-sand-200">
                <span className="text-sm font-medium text-foreground">{t.paymentStatus}</span>
                <StatusBadge status={payment.status} map={paymentStatusMeta} size="sm" />
              </div>
            )}
            {reservation.refunds.length > 0 && (
              <div className="mt-3 rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink ring-1 ring-inset ring-ink-100">
                {t.refundInProgress.replace("{amount}", formatPrice(reservation.refunds[0].amount))}
              </div>
            )}
            {paySettings.payViaKoraStayNote && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-800 ring-1 ring-inset ring-brand-200/60">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                {paySettings.payViaKoraStayNote}
              </p>
            )}
          </section>

          {/* Programme pack */}
          {isPack && reservation.pack?.programDays && reservation.pack.programDays.length > 0 && (
            <section className={card}>
              <h2 className="mb-5 font-display text-xl text-foreground">{t.programTitle}</h2>
              <div className="space-y-5">
                {reservation.pack.programDays.map((day) => (
                  <div key={day.id}>
                    <p className="eyebrow text-[10px] text-terracotta">
                      {t.day.replace("{n}", String(day.dayNumber))} · {day.title}
                    </p>
                    <ul className="mt-2 space-y-1.5 border-l-2 border-dashed border-terracotta/30 pl-4">
                      {day.activities.map((a) => (
                        <li key={a.id} className="text-sm text-foreground/90">
                          {a.timeLabel && <span className="font-semibold text-terracotta">{a.timeLabel} · </span>}
                          {a.title}
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
            <div className={card}>
              <p className="eyebrow text-[10px] text-muted">{t.host}</p>
              <p className="mt-1 font-display text-xl text-foreground">{reservation.residence.owner.firstName}</p>
              <div className="mt-4 space-y-2">
                <ContactButton
                  otherUserId={reservation.residence.owner.id}
                  reservationId={reservation.id}
                  subject={t.bookingSubject.replace("{ref}", reservation.reference)}
                  basePath="/account/messages"
                  label={t.contactHost}
                  variant="primary"
                  className="w-full"
                />
                {reservation.residence.owner.phone && (
                  <a href={`tel:${reservation.residence.owner.phone}`} className="flex items-center justify-center gap-2 py-1 text-sm font-semibold text-muted hover:text-ink">
                    <Phone className="h-4 w-4" /> {reservation.residence.owner.phone}
                  </a>
                )}
                <Button asChild variant="outline" className="w-full">
                  <Link href={localePath(`/residences/${reservation.residence.slug}`, locale)}>{t.viewHome}</Link>
                </Button>
              </div>
            </div>
          )}

          {hasReceipt && (
            <Button asChild variant="outline" className="w-full">
              <Link href={localePath(`/account/bookings/${reservation.id}/recu`, locale)} target="_blank">
                <Receipt className="h-4 w-4" /> {t.receipt}
              </Link>
            </Button>
          )}

          {canReview && (
            <Button asChild className="w-full">
              <Link href={localePath("/account/reviews", locale)}><Star className="h-4 w-4" /> {t.leaveReview}</Link>
            </Button>
          )}

          {canCancel && (
            <CancelReservationButton reservationId={reservation.id} refundLabel={refundLabel} refundAmount={refund.refundableAmount} />
          )}

          <div className="flex items-center gap-2 rounded-xl bg-sand-50 px-4 py-3 text-xs text-muted ring-1 ring-inset ring-sand-200">
            <ShieldCheck className="h-4 w-4 shrink-0 text-brand-500" />
            {t.protected}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Ticket; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 bg-surface px-5 py-4">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
      <div className="min-w-0">
        <p className="eyebrow text-[9.5px] text-muted">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
