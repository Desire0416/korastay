import { SectionHeading } from "@/components/public/section-heading";
import { CountUp } from "@/components/public/count-up";
import { Motif } from "@/components/brand/motif";
import { cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import type { CommunityStats } from "@/lib/queries";

type OfferStats = { residences: number; destinations: number; packs: number };

// Bandeau public "KoraStay en chiffres" (masquable par l'admin) : compteur
// de visites + comptes par type + indicateurs d'offre. v2 : grands chiffres
// serif separes par des filets, la tuile "visites" en terracotta.
export async function PlatformStats({
  community,
  offer,
}: {
  community: CommunityStats;
  offer: OfferStats;
}) {
  const { dict } = await getI18n();
  const s = dict.home.stats;
  const tiles = [
    { value: community.visits, label: s.visits, highlight: true },
    { value: community.travelers, label: s.travelers },
    { value: community.owners, label: s.owners },
    { value: community.guides, label: s.guides },
    { value: community.partners, label: s.partners },
    { value: offer.residences, label: s.residences },
    { value: offer.destinations, label: s.destinations },
    { value: offer.packs, label: s.packs },
  ];

  return (
    <section className="container-page py-20 lg:py-24">
      <SectionHeading
        align="center"
        eyebrow={s.eyebrow}
        title={s.title}
        accent={s.accent}
        description={s.description}
      />
      {/* gap-px sur fond "border" : filets fins entre les tuiles */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-border bg-border lg:grid-cols-4">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className={cn(
              "relative flex flex-col items-center justify-center overflow-hidden px-4 py-9 text-center",
              tile.highlight ? "bg-terracotta text-white" : "bg-surface"
            )}
          >
            {tile.highlight && <Motif variant="bogolan" className="text-white/10" />}
            <CountUp
              value={tile.value}
              className={cn(
                "relative font-display text-4xl tabular-nums sm:text-5xl",
                tile.highlight ? "text-white" : "text-foreground"
              )}
            />
            <p className={cn("eyebrow relative mt-3 text-[10.5px]", tile.highlight ? "text-white/85" : "text-muted")}>
              {tile.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
