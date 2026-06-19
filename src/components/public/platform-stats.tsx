import {
  Eye, Users, KeyRound, Compass, Handshake, BedDouble, MapPin, Sparkles,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/public/section-heading";
import { CountUp } from "@/components/public/count-up";
import { cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import type { CommunityStats } from "@/lib/queries";

type OfferStats = { residences: number; destinations: number; packs: number };
type Tile = { value: number; icon: LucideIcon; label: string; highlight?: boolean };

// Bandeau public "KoraStay en chiffres" : compteur de visites + comptes crees
// par type (voyageurs, propriétaires, guides, partenaires) + indicateurs d'offre.
export async function PlatformStats({
  community,
  offer,
}: {
  community: CommunityStats;
  offer: OfferStats;
}) {
  const { dict } = await getI18n();
  const s = dict.platformStats;
  const tiles: Tile[] = [
    { value: community.visits, icon: Eye, label: s.visits, highlight: true },
    { value: community.travelers, icon: Users, label: s.travelers },
    { value: community.owners, icon: KeyRound, label: s.owners },
    { value: community.guides, icon: Compass, label: s.guides },
    { value: community.partners, icon: Handshake, label: s.partners },
    { value: offer.residences, icon: BedDouble, label: s.residences },
    { value: offer.destinations, icon: MapPin, label: s.destinations },
    { value: offer.packs, icon: Sparkles, label: s.packs },
  ];

  return (
    <section className="bg-surface py-16">
      <div className="container-page">
        <SectionHeading
          align="center"
          eyebrow={s.eyebrow}
          title={s.title}
          description={s.description}
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.label}
                className={cn(
                  "flex flex-col items-center rounded-3xl border p-6 text-center shadow-soft transition-transform hover:-translate-y-0.5",
                  tile.highlight
                    ? "border-transparent bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-card"
                    : "border-border bg-background",
                )}
              >
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl",
                    tile.highlight ? "bg-white/15 text-white" : "bg-brand-50 text-brand-600",
                  )}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <CountUp
                  value={tile.value}
                  className={cn(
                    "mt-4 font-display text-3xl font-semibold tabular-nums sm:text-4xl",
                    tile.highlight ? "text-white" : "text-foreground",
                  )}
                />
                <p
                  className={cn(
                    "mt-1 text-sm font-medium",
                    tile.highlight ? "text-white/85" : "text-muted",
                  )}
                >
                  {tile.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
