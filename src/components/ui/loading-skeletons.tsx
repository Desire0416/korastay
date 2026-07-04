import { Skeleton } from "@/components/ui/skeleton";

// ============================================================
// Squelettes de chargement partages (fichiers loading.tsx).
// Affiches instantanement par Next.js des qu'un lien est clique,
// pendant que le rendu serveur de la page se termine.
// ============================================================

function CardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
      <div className="mt-3 space-y-2 px-0.5">
        <Skeleton className="h-4 w-3/4 rounded-lg" />
        <Skeleton className="h-3 w-1/2 rounded-lg" />
        <Skeleton className="h-4 w-1/3 rounded-lg" />
      </div>
    </div>
  );
}

/** Grille de cartes — miroir de la liste des residences/packs/activites. */
export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Page detail d'une residence — galerie + contenu + widget de reservation. */
export function ResidenceDetailSkeleton() {
  return (
    <div className="container-page py-6">
      <Skeleton className="h-5 w-40 rounded-lg" />
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        <Skeleton className="aspect-[4/3] w-full sm:col-span-2 lg:row-span-2 lg:aspect-auto" />
        <Skeleton className="hidden aspect-[4/3] w-full lg:block" />
        <Skeleton className="hidden aspect-[4/3] w-full lg:block" />
        <Skeleton className="hidden aspect-[4/3] w-full lg:block" />
        <Skeleton className="hidden aspect-[4/3] w-full lg:block" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3 rounded-xl" />
          <Skeleton className="h-4 w-1/2 rounded-lg" />
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-5/6 rounded-lg" />
            <Skeleton className="h-4 w-4/6 rounded-lg" />
          </div>
        </div>
        <Skeleton className="hidden h-96 w-full rounded-3xl lg:block" />
      </div>
    </div>
  );
}

/** Tableau de bord connecte — en-tete + cartes stats + lignes de liste. */
export function DashboardSkeleton({ stats = 4, rows = 5 }: { stats?: number; rows?: number }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56 rounded-xl" />
        <Skeleton className="h-4 w-72 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: stats }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-3xl" />
        ))}
      </div>
      <div className="space-y-3 rounded-3xl border border-border bg-surface p-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2 rounded-lg" />
              <Skeleton className="h-3 w-1/3 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
