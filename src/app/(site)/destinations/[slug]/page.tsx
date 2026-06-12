import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { getDestinationBySlug } from "@/lib/queries";
import { getUserFavoriteIds } from "@/server/actions/favorites";
import { ResidenceCard } from "@/components/public/residence-card";
import { PackCard } from "@/components/public/pack-card";
import { SmartImage } from "@/components/ui/smart-image";
import { MapEmbed } from "@/components/public/map-embed";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  return { title: dest?.name ?? "Destination", description: dest?.description ?? undefined };
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest || !dest.isActive) notFound();
  const favorites = await getUserFavoriteIds();

  return (
    <div>
      {/* Hero */}
      <section className="relative h-64 sm:h-80">
        <SmartImage src={dest.heroImageUrl} alt={dest.name} seed={`dest-${dest.slug}`} priority />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
        <div className="container-page absolute inset-x-0 bottom-0 pb-7 text-white">
          {dest.region && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-white/80">
              <MapPin className="h-4 w-4" /> {dest.region}
            </p>
          )}
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{dest.name}</h1>
        </div>
      </section>

      <div className="container-page py-10">
        {dest.description && (
          <p className="mb-8 max-w-3xl text-lg leading-relaxed text-foreground/90">{dest.description}</p>
        )}

        {dest.latitude != null && dest.longitude != null && (
          <div className="mb-12">
            <MapEmbed latitude={dest.latitude} longitude={dest.longitude} label={dest.name} delta={0.08} zoom={12} heightClass="h-72" />
          </div>
        )}

        {/* Residences */}
        {dest.residences.length > 0 ? (
          <section className="mb-12">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Résidences a {dest.name}
              </h2>
              <Link href={`/residences?city=${dest.slug}`} className="flex items-center gap-1 text-sm font-semibold text-brand-600">
                Tout voir <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {dest.residences.slice(0, 4).map((r) => (
                <ResidenceCard key={r.id} residence={r} favorited={favorites.residences.has(r.id)} />
              ))}
            </div>
          </section>
        ) : (
          <div className="mb-12 rounded-3xl border border-dashed border-border bg-surface-soft/40 p-8 text-center">
            <p className="text-muted">De nouvelles résidences arrivent bientôt a {dest.name}.</p>
            <Button asChild variant="outline" className="mt-4"><Link href="/residences">Voir toutes les résidences</Link></Button>
          </div>
        )}

        {/* Packs */}
        {dest.packs.length > 0 && (
          <section>
            <h2 className="mb-5 font-display text-2xl font-semibold text-foreground">
              Packs Découverte a {dest.name}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {dest.packs.map((p) => (
                <PackCard key={p.id} pack={{ ...p, destination: { name: dest.name } }} favorited={favorites.packs.has(p.id)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
