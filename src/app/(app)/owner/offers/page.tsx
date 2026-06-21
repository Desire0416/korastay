import { Handshake, CalendarDays, Users, Clock } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getOwnerPriceOffers } from "@/lib/owner-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { SmartImage } from "@/components/ui/smart-image";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { OfferResponsePanel } from "@/components/dashboard/offer-response-panel";
import { offerStatusMeta } from "@/lib/enums";
import { formatPrice, formatDateRange } from "@/lib/utils";

export const metadata = { title: "Offres de prix reçues" };

function timeLeft(expiresAt: Date): string {
  const ms = expiresAt.getTime() - Date.now();
  if (ms <= 0) return "Expirée";
  const h = Math.floor(ms / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (h > 0) return `${h}h ${m}min restantes`;
  return `${m} min restantes`;
}

export default async function OwnerOffersPage() {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const offers = await getOwnerPriceOffers(user.id);

  // Sépare les offres attendant le proprio vs celles attendant le voyageur
  const awaitingOwner = offers.filter((o) => o.status === "PENDING" && o.proposedBy === "TRAVELER");
  const awaitingTraveler = offers.filter((o) => o.status === "PENDING" && o.proposedBy === "OWNER");

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Offres de prix reçues"
        description="Négociez librement le prix avec vos voyageurs."
      />

      {offers.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="Aucune offre en cours"
          description="Les offres de prix proposées par les voyageurs pour vos résidences apparaîtront ici."
        />
      ) : (
        <div className="space-y-8">

          {/* ── Offres à traiter ── */}
          {awaitingOwner.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                  {awaitingOwner.length}
                </span>
                En attente de votre réponse
              </h2>
              <div className="space-y-4">
                {awaitingOwner.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </section>
          )}

          {/* ── Contre-offres envoyées ── */}
          {awaitingTraveler.length > 0 && (
            <section>
              <h2 className="mb-4 text-base font-bold text-foreground text-muted">
                Contre-offres envoyées — en attente du voyageur
              </h2>
              <div className="space-y-4">
                {awaitingTraveler.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
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

function OfferCard({ offer }: { offer: OfferWithRelations }) {
  const res = offer.reservation;
  const residence = res.residence;
  const traveler = res.traveler;
  const history = res.priceOffers;
  const isUrgent = offer.proposedBy === "TRAVELER" && offer.expiresAt.getTime() - Date.now() < 6 * 60 * 60 * 1000;

  return (
    <div className={`rounded-3xl border bg-surface p-5 shadow-soft ${isUrgent ? "border-warning-300 bg-warning-50/30" : "border-border"}`}>
      {/* En-tête résidence + voyageur */}
      <div className="flex gap-4">
        <div className="h-20 w-24 shrink-0 overflow-hidden rounded-2xl">
          <SmartImage
            src={residence?.images[0]?.url}
            alt={residence?.name ?? ""}
            seed={`${residence?.slug ?? offer.id}-0`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-foreground">{residence?.name}</p>
          <p className="mt-0.5 text-sm text-muted">
            Voyageur : <span className="font-medium text-foreground">{traveler?.firstName} {traveler?.lastName}</span>
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDateRange(res.startDate, res.endDate)} ({res.nights} nuit{res.nights > 1 ? "s" : ""})
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {res.adults + res.children} voyageur{res.adults + res.children > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <StatusBadge status={offer.status} map={offerStatusMeta} size="sm" />
          {offer.proposedBy === "TRAVELER" && (
            <p className={`mt-1 flex items-center justify-end gap-1 text-xs font-medium ${isUrgent ? "text-warning-700" : "text-muted"}`}>
              <Clock className="h-3 w-3" />
              {timeLeft(offer.expiresAt)}
            </p>
          )}
        </div>
      </div>

      {/* Historique des offres */}
      {history.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <p className="text-xs font-semibold uppercase text-muted">Historique</p>
          <div className="space-y-1.5">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-xl bg-surface-soft px-3 py-2 text-sm">
                <span className="text-muted">
                  {h.proposedBy === "TRAVELER" ? "Voyageur" : "Vous"} a proposé
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{formatPrice(h.amount)}</span>
                  <StatusBadge status={h.status} map={offerStatusMeta} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prix de référence */}
      {residence?.pricePerNight && (
        <p className="mt-3 text-xs text-muted">
          Prix de référence : {formatPrice(residence.pricePerNight)} × {res.nights} nuit{res.nights > 1 ? "s" : ""} = {formatPrice(residence.pricePerNight * res.nights)}
        </p>
      )}

      {/* Panel d'action */}
      <div className="mt-4">
        <OfferResponsePanel
          offerId={offer.id}
          currentAmount={offer.amount}
          proposedBy={offer.proposedBy}
        />
      </div>
    </div>
  );
}
