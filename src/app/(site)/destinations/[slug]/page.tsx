import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { getDestinationBySlug } from "@/lib/queries";
import { getUserFavoriteIds } from "@/server/actions/favorites";
import { ResidenceCard } from "@/components/public/residence-card";
import { PackCard } from "@/components/public/pack-card";
import { MapEmbed } from "@/components/public/map-embed";
import { SectionHeading } from "@/components/public/section-heading";
import { ArchImage } from "@/components/brand/arch-image";
import { Motif, Ornament } from "@/components/brand/motif";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [dest, { dict }] = await Promise.all([getDestinationBySlug(slug), getI18n()]);
  return {
    title: dest?.name ?? dict.destinations.notFound,
    description: dest?.description ?? undefined,
    alternates: alternatesFor(`/destinations/${slug}`),
  };
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest || !dest.isActive) notFound();
  const [favorites, { locale, dict }] = await Promise.all([getUserFavoriteIds(), getI18n()]);
  const t = dict.destinations;

  return (
    <>
      {/* Hero : texte + grande arche photo */}
      <section className="grain relative overflow-hidden border-b border-border/70">
        <Motif variant="bogolan" fade="bottom" className="text-sand-500/[0.14]" />
        <div aria-hidden="true" className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-gold-400/70 blur-[2px]" />
        <div className="container-page relative grid items-center gap-10 py-10 md:grid-cols-[1.1fr_1fr] md:py-16">
          <div>
            <p className="eyebrow flex items-center gap-3 text-[11px] text-terracotta">
              <Ornament side="left" />
              {dest.region ?? t.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-[3rem] font-normal leading-[1] tracking-[-0.03em] text-foreground md:text-display-lg lg:text-display-xl">
              {dest.name}
            </h1>
            {dest.description && (
              <p className="mt-6 max-w-xl text-pretty text-[16.5px] leading-relaxed text-muted">{dest.description}</p>
            )}
            <Button asChild size="lg" className="mt-8">
              <Link href={localePath(`/residences?city=${dest.slug}`, locale)}>
                {t.exploreStays} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <ArchImage
            src={dest.heroImageUrl}
            alt={dest.name}
            seed={`dest-${dest.slug}`}
            priority
            outline
            sizes="(max-width: 768px) 80vw, 420px"
            className="mx-auto aspect-[4/5] w-full max-w-[420px] shadow-card-hover"
          />
        </div>
      </section>

      <div className="container-page py-14 md:py-20">
        {dest.latitude != null && dest.longitude != null && (
          <section className="mb-20">
            <h2 className="mb-5 flex items-center gap-3 font-display text-[1.65rem] font-normal text-foreground">
              <MapPin className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.mapTitle}
            </h2>
            <div className="overflow-hidden rounded-[1.75rem] shadow-soft">
              <MapEmbed latitude={dest.latitude} longitude={dest.longitude} label={dest.name} delta={0.08} zoom={12} heightClass="h-80" />
            </div>
          </section>
        )}

        {/* Logements */}
        {dest.residences.length > 0 ? (
          <section className="mb-20">
            <SectionHeading
              eyebrow={dict.home.residences.eyebrow}
              title={t.residencesIn.replace("{city}", dest.name)}
              href={localePath(`/residences?city=${dest.slug}`, locale)}
              hrefLabel={dict.common.seeAll}
            />
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {dest.residences.slice(0, 4).map((r) => (
                <ResidenceCard key={r.id} residence={r} favorited={favorites.residences.has(r.id)} />
              ))}
            </div>
          </section>
        ) : (
          <div className="mb-20 rounded-[1.75rem] border border-dashed border-sand-400/70 bg-sand-50/70 p-10 text-center">
            <p className="font-display text-xl text-foreground">{t.comingSoon.replace("{city}", dest.name)}</p>
            <Button asChild variant="outline" className="mt-5">
              <Link href={localePath("/residences", locale)}>{t.seeAllResidences}</Link>
            </Button>
          </div>
        )}

        {/* Packs */}
        {dest.packs.length > 0 && (
          <section>
            <SectionHeading eyebrow={dict.home.experiences.eyebrow} title={t.packsIn.replace("{city}", dest.name)} />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {dest.packs.map((p) => (
                <PackCard key={p.id} pack={{ ...p, destination: { name: dest.name } }} favorited={favorites.packs.has(p.id)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
