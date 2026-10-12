import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, CalendarDays, Clock, ShieldCheck } from "lucide-react";
import { getPackBySlug } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { computePackPrice } from "@/lib/pricing";
import { getPaymentSettings, buildFinance, enabledPaymentMethods } from "@/lib/payment-rules";
import { isMockPayments } from "@/lib/payments";
import { paymentMethodMeta } from "@/lib/enums";
import { createPackReservation } from "@/server/actions/reservations";
import { ReservationCheckout } from "@/components/public/reservation-checkout";
import { SmartImage } from "@/components/ui/smart-image";
import { Ornament } from "@/components/brand/motif";
import { formatPrice, formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.packCheckout.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function PackReserverPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const startDate = str(sp.startDate);
  const persons = Number(str(sp.persons) ?? 2);
  const { locale, dict } = await getI18n();
  const t = dict.packCheckout;

  const backUrl = localePath(`/packs/${slug}/reserver?startDate=${startDate}&persons=${persons}`, locale);
  const user = await getCurrentUser();
  if (!user) redirect(`${localePath("/login", locale)}?redirectTo=${encodeURIComponent(backUrl)}`);

  const pack = await getPackBySlug(slug);
  if (!pack || pack.status !== "PUBLISHED") notFound();
  if (!startDate) redirect(localePath(`/packs/${slug}`, locale));

  const settings = await getPaymentSettings();
  const price = computePackPrice({
    basePrice: pack.price,
    basePersons: pack.basePersons,
    extraPersonPrice: pack.extraPersonPrice,
    persons,
    serviceFeeRate: settings.serviceFeePercent / 100,
    serviceFeeMin: settings.serviceFeeMin,
    serviceFeeMax: settings.serviceFeeMax,
  });
  // Packs : 100% a la reservation.
  const finance = buildFinance({ subtotal: price.subtotal + price.extras, serviceFee: price.serviceFee, policy: settings.packPolicy });
  const methods = enabledPaymentMethods(settings).map((v) => ({
    value: v,
    label: dict.enums.paymentMethod[v]?.label ?? paymentMethodMeta[v]?.label ?? v,
    hint: dict.enums.paymentMethod[v]?.hint ?? paymentMethodMeta[v]?.hint,
  }));

  return (
    <div className="container-page py-8 md:py-12">
      <Link href={localePath(`/packs/${slug}`, locale)} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <p className="eyebrow flex items-center gap-3 text-[11px] text-terracotta">
        <Ornament side="left" />
        {t.eyebrow}
      </p>
      <h1 className="mt-3 font-display text-[2.2rem] font-normal leading-tight tracking-[-0.02em] text-foreground md:text-[2.75rem]">
        {t.title}
      </h1>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_420px]">
        <div className="order-2 lg:order-1">
          <ReservationCheckout
            action={createPackReservation}
            isMock={isMockPayments()}
            validationLabel={t.validationDelay}
            depositLabel={`${formatPrice(finance.depositDue)} (100%)`}
            methods={methods}
            koraStayNote={settings.payViaKoraStayNote}
            hidden={{ packId: pack.id, startDate: startDate!, persons: String(persons) }}
            defaultName={`${user.firstName} ${user.lastName}`}
            defaultEmail={user.email}
            defaultPhone={user.phone ?? ""}
          />
        </div>

        <aside className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-surface p-6 pt-7 shadow-card lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 overflow-hidden">
              <div className="motif motif-kente text-terracotta/70" />
            </div>
            <div className="flex gap-4">
              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-arch-sm">
                <SmartImage src={pack.images[0]?.url} alt={pack.name} seed={`pack-${pack.slug}-0`} sizes="80px" />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 font-display text-lg leading-snug text-foreground">{pack.name}</p>
                {pack.destination && <p className="text-sm text-muted">{pack.destination.name}</p>}
              </div>
            </div>
            <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex items-center gap-2.5 text-foreground">
                <CalendarDays className="h-4 w-4 text-terracotta" /> {t.departure.replace("{date}", formatDate(startDate!, locale))}
              </div>
              <div className="flex items-center gap-2.5 text-foreground">
                <Clock className="h-4 w-4 text-terracotta" /> {pack.durationDays}{dict.card.dayShort} / {pack.durationNights}{dict.card.nightShort}
              </div>
              <div className="flex items-center gap-2.5 text-foreground">
                <Users className="h-4 w-4 text-terracotta" /> {persons} {persons > 1 ? dict.search.travelerPlural : dict.search.travelerSingular}
              </div>
            </div>
            <div className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm">
              <div className="flex justify-between text-muted">
                <span>{dict.packs.packLine.replace("{n}", String(pack.basePersons))}</span>
                <span className="text-foreground">{formatPrice(pack.price)}</span>
              </div>
              {price.extras > 0 && (
                <div className="flex justify-between text-muted">
                  <span>{dict.packs.extraPersons}</span>
                  <span className="text-foreground">{formatPrice(price.extras)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>{dict.booking.serviceFee}</span>
                <span className="text-foreground">{formatPrice(finance.serviceFee)}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-3 font-bold text-foreground">
                <span>{dict.booking.total}</span>
                <span className="font-display text-2xl font-normal">{formatPrice(finance.total)}</span>
              </div>
              <div className="mt-1 rounded-xl bg-brand-50 px-3.5 py-3 text-sm ring-1 ring-inset ring-brand-200/60">
                <div className="flex justify-between font-semibold text-brand-800">
                  <span>{t.payNowFull}</span>
                  <span>{formatPrice(finance.depositDue)}</span>
                </div>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand-500" /> {t.secure}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
