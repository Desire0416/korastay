import { Handshake, CalendarDays, Users, Clock } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getOwnerPriceOffers } from "@/lib/owner-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { SmartImage } from "@/components/ui/smart-image";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { OfferResponsePanel } from "@/components/dashboard/offer-response-panel";
import { card, sectionTitle } from "@/components/dashboard/styles";
import { offerStatusMeta } from "@/lib/enums";
import { formatPrice, formatDateRange, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashOwner.offers.metaTitle };
}

function timeLeft(expiresAt: Date, t: Dictionary["dashOwner"]["offers"]): string {
  const ms = expiresAt.getTime() - Date.now();
  if (ms <= 0) return t.expired;
  const h = Math.floor(ms / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (h > 0) return t.leftHm.replace("{h}", String(h)).replace("{m}", String(m));
  return t.leftM.replace("{m}", String(m));
}

export default async function OwnerOffersPage() {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const [offers, { locale, dict }] = await Promise.all([getOwnerPriceOffers(user.id), getI18n()]);
  const t = dict.dashOwner.offers;

  // Separe les offres attendant le proprietaire de celles attendant le voyageur
  const awaitingOwner = offers.filter((o) => o.status === "PENDING" && o.proposedBy === "TRAVELER");
  const awaitingTraveler = offers.filter((o) => o.status === "PENDING" && o.proposedBy === "OWNER");

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t.title} description={t.subtitle} />

      {offers.length === 0 ? (
        <EmptyState icon={Handshake} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <div className="space-y-10">
          {awaitingOwner.length > 0 && (
            <section>
              <h2 className={cn(sectionTitle, "mb-4 flex items-center gap-3")}>
                <span className="flex h-8 w-7 items-center justify-center rounded-arch-sm bg-terracotta font-sans text-xs font-bold text-white">
                  {awaitingOwner.length}
                </span>
                {t.awaitingYou}
              </h2>
              <div className="space-y-4">
                {awaitingOwner.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} dict={dict} locale={locale} />
                ))}
              </div>
            </section>
          )}

          {awaitingTraveler.length > 0 && (
            <section>
              <h2 className={cn(sectionTitle, "mb-4 text-muted")}>{t.awaitingTraveler}</h2>
              <div className="space-y-4">
                {awaitingTraveler.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} dict={dict} locale={locale} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

type OfferWithRelations = Awaited<ReturnType<typeof getOwnerPriceOffers>>[number];

function OfferCard({ offer, dict, locale }: { offer: OfferWithRelations; dict: Dictionary; locale: Locale }) {
  const t = dict.dashOwner.offers;
  const res = offer.reservation;
  const residence = res.residence;
  const traveler = res.traveler;
  const history = res.priceOffers;
  const isUrgent = offer.proposedBy === "TRAVELER" && offer.expiresAt.getTime() - Date.now() < 6 * 60 * 60 * 1000;
  const nights = dict.dash.common.nights.replace("{n}", String(res.nights));

  return (
    <div className={cn(card, "p-5 sm:p-6", isUrgent && "border-warning-300 ring-1 ring-inset ring-warning-200/70")}>
      {/* En-tete residence + voyageur */}
      <div className="flex gap-4">
        <div className="h-24 w-20 shrink-0 overflow-hidden rounded-arch-sm">
          <SmartImage src={residence?.images[0]?.url} alt={residence?.name ?? ""} seed={`${residence?.slug ?? offer.id}-0`} sizes="80px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-snug text-foreground">{residence?.name}</p>
          <p className="mt-0.5 text-sm text-muted">
            {t.travelerLabel} : <span className="font-medium text-foreground">{traveler?.firstName} {traveler?.lastName}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDateRange(res.startDate, res.endDate, locale)} ({nights})
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {t.persons.replace("{n}", String(res.adults + res.children))}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <StatusBadge status={offer.status} map={offerStatusMeta} size="sm" />
          {offer.proposedBy === "TRAVELER" && (
            <p className={cn("mt-1.5 flex items-center justify-end gap-1 text-xs font-medium", isUrgent ? "text-warning-700" : "text-muted")}>
              <Clock className="h-3 w-3" />
              {timeLeft(offer.expiresAt, t)}
            </p>
          )}
        </div>
      </div>

      {/* Historique des offres */}
      {history.length > 0 && (
        <div className="mt-5">
          <p className="eyebrow mb-2 text-[9.5px] text-muted">{t.history}</p>
          <div className="space-y-1.5">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-xl bg-sand-50 px-3.5 py-2 text-sm ring-1 ring-inset ring-sand-200">
                <span className="text-muted">{h.proposedBy === "TRAVELER" ? t.travelerProposed : t.youProposed}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{formatPrice(h.amount)}</span>
                  <StatusBadge status={h.status} map={offerStatusMeta} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prix de reference */}
      {residence?.pricePerNight && (
        <p className="mt-3 text-xs text-muted">
          {t.referencePrice
            .replace("{price}", formatPrice(residence.pricePerNight))
            .replace("{n}", nights)
            .replace("{total}", formatPrice(residence.pricePerNight * res.nights))}
        </p>
      )}

      <div className="mt-5">
        <OfferResponsePanel offerId={offer.id} currentAmount={offer.amount} proposedBy={offer.proposedBy} />
      </div>
    </div>
  );
}
