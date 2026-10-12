import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, CalendarDays, ShieldCheck, Handshake } from "lucide-react";
import { getResidenceBySlug } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { computeResidencePrice, computeNegotiatedPrice, stayDiscountRate } from "@/lib/pricing";
import { referralDiscountRateFor } from "@/lib/referral";
import { getPaymentSettings, resolveResidencePolicy, buildFinance, enabledPaymentMethods } from "@/lib/payment-rules";
import { isMockPayments } from "@/lib/payments";
import { paymentMethodMeta } from "@/lib/enums";
import { createResidenceReservation } from "@/server/actions/reservations";
import { ReservationCheckout } from "@/components/public/reservation-checkout";
import { NegotiationOfferForm } from "@/components/public/negotiation-offer-form";
import { SmartImage } from "@/components/ui/smart-image";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Ornament } from "@/components/brand/motif";
import { formatPrice, formatDate, nightsBetween } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.checkout.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ReserverPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const { locale, dict } = await getI18n();

  const checkin = str(sp.checkin);
  const checkout = str(sp.checkout);
  const adults = Number(str(sp.adults) ?? 2);
  const children = Number(str(sp.children) ?? 0);
  const cleaning = str(sp.cleaning) === "1";
  const isNegotiateMode = str(sp.mode) === "negotiate";
  const proposedAmount = isNegotiateMode ? Number(str(sp.proposedAmount) ?? 0) : 0;

  const backUrl = localePath(`/residences/${slug}/reserver?checkin=${checkin}&checkout=${checkout}&adults=${adults}&children=${children}`, locale);
  const user = await getCurrentUser();
  if (!user) redirect(`${localePath("/login", locale)}?redirectTo=${encodeURIComponent(backUrl)}`);

  const residence = await getResidenceBySlug(slug);
  if (!residence || residence.status !== "PUBLISHED") notFound();
  if (!checkin || !checkout || nightsBetween(checkin, checkout) < 1) {
    redirect(localePath(`/residences/${slug}`, locale));
  }

  // Mode négociation : proposedAmount obligatoire et 2+ nuits
  const nights = nightsBetween(checkin, checkout);
  if (isNegotiateMode && (proposedAmount < 1 || nights < 2)) {
    redirect(localePath(`/residences/${slug}`, locale));
  }

  const settings = await getPaymentSettings();
  const price = computeResidencePrice({
    pricePerNight: residence.pricePerNight,
    cleaningFee: cleaning ? residence.cleaningFee : 0,
    startDate: checkin,
    endDate: checkout,
    serviceFeeRate: settings.serviceFeePercent / 100,
    serviceFeeMin: settings.serviceFeeMin,
    serviceFeeMax: settings.serviceFeeMax,
  });

  // Prix négocié (pour le recap en mode négociation)
  const cleaningFeeAmount = cleaning ? residence.cleaningFee : 0;
  const negotiatedPrice = isNegotiateMode
    ? computeNegotiatedPrice({
        negotiatedSubtotal: proposedAmount,
        cleaningFee: cleaningFeeAmount,
        serviceFeeRate: settings.serviceFeePercent / 100,
        serviceFeeMin: settings.serviceFeeMin,
        serviceFeeMax: settings.serviceFeeMax,
      })
    : null;

  const policy = resolveResidencePolicy(residence, price.nights, settings);
  const referralRate = await referralDiscountRateFor(user.id);
  const finance = buildFinance({
    subtotal: price.subtotal,
    cleaningFee: price.cleaningFee,
    serviceFee: price.serviceFee,
    policy,
    cautionEnabled: residence.cautionEnabled,
    cautionAmount: residence.depositAmount,
    stayDiscountRate: stayDiscountRate(price.nights),
    referralDiscountRate: referralRate,
  });
  const methods = enabledPaymentMethods(settings).map((v) => ({
    value: v,
    label: dict.enums.paymentMethod[v]?.label ?? paymentMethodMeta[v]?.label ?? v,
    hint: dict.enums.paymentMethod[v]?.hint ?? paymentMethodMeta[v]?.hint,
  }));
  const n = dict.negotiation;

  return (
    <div className="container-page py-8 md:py-12">
      <Link href={localePath(`/residences/${slug}`, locale)} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {dict.checkout.backToResidence}
      </Link>

      <p className="eyebrow flex items-center gap-3 text-[11px] text-terracotta">
        <Ornament side="left" />
        {dict.checkout.eyebrow}
      </p>
      <h1 className="mt-3 flex items-center gap-3 font-display text-[2.2rem] font-normal leading-tight tracking-[-0.02em] text-foreground md:text-[2.75rem]">
        {isNegotiateMode && <Handshake className="h-8 w-8 text-terracotta" strokeWidth={1.6} />}
        {isNegotiateMode ? n.confirmTitle : dict.checkout.title}
      </h1>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_420px]">
        {/* Formulaire */}
        <div className="order-2 lg:order-1">
          {isNegotiateMode ? (
            <NegotiationOfferForm
              residenceId={residence.id}
              residenceName={residence.name}
              slug={slug}
              startDate={checkin!}
              endDate={checkout!}
              nights={price.nights}
              adults={adults}
              childGuests={children}
              cleaningFeeAmount={cleaningFeeAmount}
              proposedAmount={proposedAmount}
              estimatedServiceFee={negotiatedPrice!.serviceFee}
              estimatedTotal={negotiatedPrice!.total}
              pricePerNight={residence.pricePerNight}
              baseSubtotal={price.subtotal}
              defaultName={`${user.firstName} ${user.lastName}`}
              defaultEmail={user.email}
              defaultPhone={user.phone ?? ""}
            />
          ) : (
            <ReservationCheckout
              action={createResidenceReservation}
              isMock={isMockPayments()}
              validationLabel="24h"
              depositLabel={formatPrice(finance.depositDue)}
              balanceLabel={finance.balanceDue > 0 ? formatPrice(finance.balanceDue) : undefined}
              cautionLabel={finance.cautionAmount > 0 ? formatPrice(finance.cautionAmount) : undefined}
              methods={methods}
              koraStayNote={settings.payViaKoraStayNote}
              hidden={{
                residenceId: residence.id,
                checkin: checkin!,
                checkout: checkout!,
                adults: String(adults),
                children: String(children),
                cleaning: cleaning ? "1" : "0",
              }}
              defaultName={`${user.firstName} ${user.lastName}`}
              defaultEmail={user.email}
              defaultPhone={user.phone ?? ""}
            />
          )}
        </div>

        {/* Recapitulatif */}
        <aside className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-surface p-6 pt-7 shadow-card lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 overflow-hidden">
              <div className="motif motif-kente text-terracotta/70" />
            </div>
            <div className="flex gap-4">
              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-arch-sm">
                <SmartImage src={residence.images[0]?.url} alt={residence.name} seed={`${residence.slug}-0`} />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 font-display text-lg leading-snug text-foreground">{residence.name}</p>
                <p className="text-sm text-muted">{residence.city}</p>
                {residence.isVerified && <VerifiedBadge size="sm" label={dict.card.verified} className="mt-1.5" />}
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex items-center gap-2 text-foreground">
                <CalendarDays className="h-4 w-4 text-muted" />
                {formatDate(checkin!)} &rarr; {formatDate(checkout!)}
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Users className="h-4 w-4 text-muted" />
                {adults + children} {adults + children > 1 ? dict.search.travelerPlural : dict.search.travelerSingular}
              </div>
            </div>

            <div className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm">
              {isNegotiateMode && negotiatedPrice ? (
                <>
                  <div className="flex justify-between text-muted">
                    <span>{n.referenceShort.replace("{n}", String(price.nights))}</span>
                    <span className="text-foreground">{formatPrice(price.subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-terracotta-700">
                    <span>{n.yourProposal}</span>
                    <span>{formatPrice(proposedAmount)}</span>
                  </div>
                  {negotiatedPrice.cleaningFee > 0 && (
                    <div className="flex justify-between text-muted">
                      <span>{dict.booking.cleaningFee}</span>
                      <span className="text-foreground">{formatPrice(negotiatedPrice.cleaningFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted">
                    <span>{dict.booking.serviceFee}</span>
                    <span className="text-foreground">{formatPrice(negotiatedPrice.serviceFee)}</span>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-border pt-3 font-bold text-foreground">
                    <span>{dict.booking.estimatedTotal}</span>
                    <span className="font-display text-2xl font-normal">{formatPrice(negotiatedPrice.total)}</span>
                  </div>
                  <p className="mt-1 rounded-xl bg-sand-50 px-3 py-2.5 text-xs leading-relaxed text-foreground/80 ring-1 ring-inset ring-sand-300/70">
                    {n.noPaymentNow}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-muted">
                    <span>{formatPrice(residence.pricePerNight)} x {price.nights} {price.nights > 1 ? dict.booking.nightPlural : dict.booking.nightSingular}</span>
                    <span className="text-foreground">{formatPrice(price.subtotal)}</span>
                  </div>
                  {price.cleaningFee > 0 && (
                    <div className="flex justify-between text-muted">
                      <span>{dict.booking.cleaningFee}</span>
                      <span className="text-foreground">{formatPrice(price.cleaningFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted">
                    <span>{dict.booking.serviceFee}</span>
                    <span className="text-foreground">{formatPrice(finance.serviceFee)}</span>
                  </div>
                  {finance.stayDiscount > 0 && (
                    <div className="flex justify-between font-semibold text-success">
                      <span>{dict.booking.stayDiscount.replace("{p}", String(Math.round(stayDiscountRate(price.nights) * 100)))}</span>
                      <span>−{formatPrice(finance.stayDiscount)}</span>
                    </div>
                  )}
                  {finance.referralDiscount > 0 && (
                    <div className="flex justify-between font-semibold text-success">
                      <span>{dict.checkout.referral}</span>
                      <span>−{formatPrice(finance.referralDiscount)}</span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between border-t border-border pt-3 font-bold text-foreground">
                    <span>{dict.booking.total}</span>
                    <span className="font-display text-2xl font-normal">{formatPrice(finance.total)}</span>
                  </div>
                  <div className="mt-1 space-y-1 rounded-xl bg-brand-50 px-3.5 py-3 text-sm ring-1 ring-inset ring-brand-200/60">
                    <div className="flex justify-between font-semibold text-brand-800">
                      <span>{dict.checkout.payNow}{policy === "FULL" ? dict.checkout.payNowFull : dict.checkout.payNowDeposit}</span>
                      <span>{formatPrice(finance.depositDue)}</span>
                    </div>
                    {finance.balanceDue > 0 && (
                      <div className="flex justify-between text-muted">
                        <span>{dict.checkout.balanceRemaining}</span>
                        <span>{formatPrice(finance.balanceDue)}</span>
                      </div>
                    )}
                    {finance.cautionAmount > 0 && (
                      <div className="flex justify-between text-muted">
                        <span>{dict.checkout.possibleDeposit}</span>
                        <span>{formatPrice(finance.cautionAmount)}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand-500" />
              {isNegotiateMode ? n.secureOffer : dict.checkout.securePayment}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
