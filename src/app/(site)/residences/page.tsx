import { Suspense } from "react";
import Link from "next/link";
import { SearchX, ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react";
import { getResidences, getAllDestinations } from "@/lib/queries";
import { getUserFavoriteIds } from "@/server/actions/favorites";
import { ResidenceCard } from "@/components/public/residence-card";
import { MobileResidenceCard } from "@/components/public/mobile/mobile-cards";
import { ResidenceFilters } from "@/components/public/residence-filters";
import { ResidencesMap } from "@/components/public/residences-map";
import { PageHero } from "@/components/public/page-hero";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { alternatesFor } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: dict.residences.metaTitle,
    description: dict.residences.metaDescription,
    alternates: alternatesFor("/residences"),
  };
}

type SP = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ResidencesPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const page = Number(str(sp.page) ?? 1);

  const filters = {
    city: str(sp.city),
    type: str(sp.type),
    minPrice: str(sp.minPrice) ? Number(str(sp.minPrice)) : undefined,
    maxPrice: str(sp.maxPrice) ? Number(str(sp.maxPrice)) : undefined,
    capacity: str(sp.capacity) ? Number(str(sp.capacity)) : str(sp.guests) ? Number(str(sp.guests)) : undefined,
    verified: str(sp.verified) === "1",
    amenities: str(sp.amenities)?.split(",").filter(Boolean),
    sort: str(sp.sort),
    checkin: str(sp.checkin),
    checkout: str(sp.checkout),
    page,
  };

  const [{ items, total, pageCount }, destinations, favorites, { locale, dict }] =
    await Promise.all([
      getResidences(filters),
      getAllDestinations(),
      getUserFavoriteIds(),
      getI18n(),
    ]);

  const cityName = destinations.find((d) => d.slug === filters.city)?.name;

  // Donnees carte : coords propres de la residence, repli sur celles de la
  // destination. Si on utilise le repli (residence sans coords), petit decalage
  // deterministe autour du centre-ville pour ne pas empiler les marqueurs.
  const jitter = (seed: string, range = 0.012): [number, number] => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) | 0;
    const f = (n: number) => ((((n % 1000) + 1000) % 1000) / 1000 - 0.5) * range;
    return [f(h), f(h >> 10)];
  };
  const mapData = items.flatMap((r) => {
    let lat = r.latitude ?? r.destination?.latitude ?? null;
    let lng = r.longitude ?? r.destination?.longitude ?? null;
    if (lat == null || lng == null) return [];
    if (r.latitude == null || r.longitude == null) {
      const [dLat, dLng] = jitter(r.id);
      lat += dLat;
      lng += dLng;
    }
    return [{ id: r.id, slug: r.slug, name: r.name, city: r.city, latitude: lat, longitude: lng, pricePerNight: r.pricePerNight }];
  });

  // Construit l'URL d'une page donnee en conservant les filtres
  function pageHref(p: number) {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      const value = str(v);
      if (value && k !== "page") params.set(k, value);
    });
    params.set("page", String(p));
    return `${localePath("/residences", locale)}?${params.toString()}`;
  }

  // Lien identique sans le filtre de dates (retirer la disponibilite).
  const withoutDatesHref = (() => {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      const value = str(v);
      if (value && k !== "page" && k !== "checkin" && k !== "checkout") params.set(k, value);
    });
    const qs = params.toString();
    return qs ? `${localePath("/residences", locale)}?${qs}` : localePath("/residences", locale);
  })();

  // Puces de ville : conserve les autres filtres, remplace la ville.
  function cityHref(slug?: string) {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      const value = str(v);
      if (value && k !== "page" && k !== "city") params.set(k, value);
    });
    if (slug) params.set("city", slug);
    const qs = params.toString();
    return qs ? `${localePath("/residences", locale)}?${qs}` : localePath("/residences", locale);
  }

  const countLabel =
    (total > 1 ? dict.residences.countPlural : dict.residences.countSingular).replace("{n}", String(total)) +
    (cityName ? "" : dict.residences.inCotedivoire);

  return (
    <>
      <PageHero
        eyebrow={dict.residences.eyebrow}
        title={cityName ? dict.residences.heroTitleIn : dict.residences.heroTitle}
        accent={cityName ? `${cityName}.` : dict.residences.heroAccent}
        description={
          <>
            <p>{dict.residences.heroDesc}</p>
            <p className="mt-3 flex flex-wrap items-center gap-3">
              <span className="font-semibold text-foreground">{countLabel}</span>
              {filters.checkin && filters.checkout && (
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {dict.residences.availableFromTo.replace("{from}", formatDate(filters.checkin)).replace("{to}", formatDate(filters.checkout))}
                  <Link href={withoutDatesHref} className="-mr-1 rounded-full p-0.5 text-brand-600 hover:bg-brand-100" aria-label={dict.residences.removeDates}>
                    <X className="h-3.5 w-3.5" />
                  </Link>
                </span>
              )}
            </p>
          </>
        }
      >
        {/* Villes */}
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
          <Link
            href={cityHref()}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              !filters.city ? "border-ink bg-ink text-white" : "border-ink/15 bg-white/60 text-foreground hover:border-ink/40"
            )}
          >
            {dict.search.allCities}
          </Link>
          {destinations.map((d) => (
            <Link
              key={d.slug}
              href={cityHref(d.slug)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                filters.city === d.slug ? "border-ink bg-ink text-white" : "border-ink/15 bg-white/60 text-foreground hover:border-ink/40"
              )}
            >
              {d.name}
            </Link>
          ))}
        </div>
      </PageHero>

      <div className="container-page pb-6">
        <div className="sticky top-[var(--header-h)] z-30 -mx-5 mb-8 border-b border-border bg-background/90 px-5 py-3 backdrop-blur md:mx-0 md:-mt-6 md:rounded-full md:border md:bg-white/90 md:px-3 md:py-2 md:shadow-card">
          <Suspense fallback={<div className="h-9" />}>
            <ResidenceFilters
              destinations={destinations.map((d) => ({ name: d.name, slug: d.slug }))}
              total={total}
            />
          </Suspense>
        </div>

        <ResidencesMap residences={mapData} />

        {items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={dict.residences.emptyTitle}
            description={dict.residences.emptyDesc}
            action={
              <Button asChild>
                <Link href={localePath("/residences", locale)}>{dict.residences.resetSearch}</Link>
              </Button>
            }
          />
        ) : (
          <>
            {/* Mobile : grille compacte 2 colonnes (app) */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:hidden">
              {items.map((r, i) => (
                <MobileResidenceCard
                  key={r.id}
                  residence={r}
                  favorited={favorites.residences.has(r.id)}
                  priority={i < 4}
                />
              ))}
            </div>
            <div className="hidden gap-x-6 gap-y-12 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((r, i) => (
                <ResidenceCard
                  key={r.id}
                  residence={r}
                  favorited={favorites.residences.has(r.id)}
                  priority={i < 4}
                />
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {pageCount > 1 && (
          <nav className="mt-16 flex items-center justify-center gap-2" aria-label="Pagination">
            <Button asChild variant="outline" size="icon" disabled={page <= 1}>
              <Link href={pageHref(Math.max(1, page - 1))} aria-label={dict.residences.prevPage}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            {Array.from({ length: pageCount }).map((_, i) => (
              <Link
                key={i}
                href={pageHref(i + 1)}
                aria-current={page === i + 1 ? "page" : undefined}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  page === i + 1
                    ? "bg-ink text-white"
                    : "border border-ink/15 text-foreground hover:border-ink/40"
                )}
              >
                {i + 1}
              </Link>
            ))}
            <Button asChild variant="outline" size="icon" disabled={page >= pageCount}>
              <Link href={pageHref(Math.min(pageCount, page + 1))} aria-label={dict.residences.nextPage}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </nav>
        )}
      </div>
    </>
  );
}
