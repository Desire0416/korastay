import Link from "next/link";
import { Plus, Home, Users, BedDouble, Star, Pencil } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getOwnerResidences } from "@/lib/owner-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { residenceStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Mes residences" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function OwnerResidencesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const q = str(sp.q)?.trim().toLowerCase();

  const all = await getOwnerResidences(user.id);
  const residences = all.filter(
    (r) =>
      (!status || r.status === status) &&
      (!q || r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q))
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Mes residences"
        description="Gerez vos logements, leurs tarifs et leur disponibilite."
        actions={<Button asChild><Link href="/owner/residences/new"><Plus className="h-4 w-4" /> Ajouter</Link></Button>}
      />

      {all.length > 0 && (
        <FilterBar
          fields={[
            { type: "search", name: "q", placeholder: "Nom, ville..." },
            { type: "select", name: "status", label: "Tous les statuts", options: toFilterOptions(residenceStatusMeta) },
          ]}
        />
      )}

      {all.length === 0 ? (
        <EmptyState
          icon={Home}
          title="Aucune residence"
          description="Ajoutez votre premiere residence pour commencer a recevoir des reservations."
          action={<Button asChild><Link href="/owner/residences/new"><Plus className="h-4 w-4" /> Ajouter une residence</Link></Button>}
        />
      ) : residences.length === 0 ? (
        <EmptyState icon={Home} title="Aucun resultat" description="Aucune residence ne correspond a ces criteres." />
      ) : (
        <div className="space-y-3">
          {residences.map((r) => (
            <div key={r.id} className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4 shadow-soft sm:flex-row sm:items-center">
              <div className="h-24 w-full shrink-0 overflow-hidden rounded-2xl sm:h-20 sm:w-28">
                <SmartImage src={r.images[0]?.url} alt={r.name} seed={`${r.slug}-0`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-foreground">{r.name}</h3>
                  <StatusBadge status={r.status} map={residenceStatusMeta} size="sm" />
                </div>
                <p className="text-sm text-muted">{r.city}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {r.capacity}</span>
                  <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {r.bedrooms} ch.</span>
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> {r.ratingCount} avis</span>
                  <span>{r._count.reservations} reservation{r._count.reservations > 1 ? "s" : ""}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <p className="font-extrabold text-foreground">{formatPrice(r.pricePerNight)}<span className="text-xs font-normal text-muted">/nuit</span></p>
                <Button asChild variant="outline" size="sm"><Link href={`/owner/residences/${r.id}`}><Pencil className="h-3.5 w-3.5" /> Gerer</Link></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
