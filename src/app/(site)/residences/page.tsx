import { Suspense } from "react";
import Link from "next/link";
import { SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import { getResidences, getAllDestinations } from "@/lib/queries";
import { getUserFavoriteIds } from "@/server/actions/favorites";
import { ResidenceCard } from "@/components/public/residence-card";
import { ResidenceFilters } from "@/components/public/residence-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Residences verifiees",
  description:
    "Parcourez les residences meublees verifiees KoraStay en Cote d'Ivoire : studios, appartements et villas.",
};

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
    page,
  };

  const [{ items, total, pageCount }, destinations, favorites] =
    await Promise.all([
      getResidences(filters),
      getAllDestinations(),
      getUserFavoriteIds(),
    ]);

  const cityName = destinations.find((d) => d.slug === filters.city)?.name;

  // Construit l'URL d'une page donnee en conservant les filtres
  function pageHref(p: number) {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      const value = str(v);
      if (value && k !== "page") params.set(k, value);
    });
    params.set("page", String(p));
    return `/residences?${params.toString()}`;
  }

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          {cityName ? `Residences a ${cityName}` : "Residences verifiees"}
        </h1>
        <p className="mt-1 text-muted">
          {total} logement{total > 1 ? "s" : ""} disponible{total > 1 ? "s" : ""}
          {cityName ? "" : " en Cote d'Ivoire"}
        </p>
      </div>

      <div className="sticky top-[var(--header-h)] z-30 -mx-5 mb-7 border-y border-border bg-background/90 px-5 py-3 backdrop-blur md:mx-0 md:rounded-2xl md:border md:px-4">
        <Suspense fallback={<div className="h-9" />}>
          <ResidenceFilters
            destinations={destinations.map((d) => ({ name: d.name, slug: d.slug }))}
            total={total}
          />
        </Suspense>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Aucune residence ne correspond"
          description="Essayez d'elargir votre recherche ou de modifier vos filtres."
          action={
            <Button asChild>
              <Link href="/residences">Reinitialiser la recherche</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((r, i) => (
            <ResidenceCard
              key={r.id}
              residence={r}
              favorited={favorites.residences.has(r.id)}
              priority={i < 4}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Button asChild variant="outline" size="icon" disabled={page <= 1}>
            <Link href={pageHref(Math.max(1, page - 1))} aria-label="Page precedente">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          {Array.from({ length: pageCount }).map((_, i) => (
            <Link
              key={i}
              href={pageHref(i + 1)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                page === i + 1
                  ? "bg-brand-500 text-white"
                  : "border border-border text-foreground hover:border-brand-300"
              )}
            >
              {i + 1}
            </Link>
          ))}
          <Button asChild variant="outline" size="icon" disabled={page >= pageCount}>
            <Link href={pageHref(Math.min(pageCount, page + 1))} aria-label="Page suivante">
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
