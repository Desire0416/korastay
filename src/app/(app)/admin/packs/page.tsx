import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Plus, Pencil, CheckCircle2, Compass } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setPackStatus } from "@/server/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { SmartImage } from "@/components/ui/smart-image";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { residenceStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Packs - Admin" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminPacksPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const destinationId = str(sp.destination);
  const q = str(sp.q)?.trim();

  const where: Prisma.PackWhereInput = {};
  if (status) where.status = status;
  if (destinationId) where.destinationId = destinationId;
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { destination: { is: { name: { contains: q, mode: "insensitive" } } } }];

  const [packs, destinations] = await Promise.all([
    prisma.pack.findMany({
      where,
      include: { destination: { select: { name: true } }, images: { take: 1 }, _count: { select: { reservations: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.destination.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Packs Découverte"
        description="Créez et gérez les packs touristiques."
        actions={<Button asChild><Link href="/admin/packs/new"><Plus className="h-4 w-4" /> Nouveau pack</Link></Button>}
      />

      {sp.created === "1" && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-success/30 bg-emerald-50 p-4 text-sm text-success">
          <CheckCircle2 className="h-5 w-5" /> Le pack a été créé avec succès.
        </div>
      )}

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: "Nom, destination..." },
          { type: "select", name: "status", label: "Tous les statuts", options: toFilterOptions(residenceStatusMeta, ["DRAFT", "PUBLISHED", "UNPUBLISHED"]) },
          { type: "select", name: "destination", label: "Toutes destinations", options: destinations.map((d) => ({ value: d.id, label: d.name })) },
        ]}
      />

      {packs.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Aucun pack"
          description="Créez votre premier pack touristique."
          action={<Button asChild><Link href="/admin/packs/new"><Plus className="h-4 w-4" /> Nouveau pack</Link></Button>}
        />
      ) : (
        <div className="space-y-3">
          {packs.map((p) => (
            <div key={p.id} className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-4 shadow-soft sm:flex-row sm:items-center">
              <div className="h-16 w-full shrink-0 overflow-hidden rounded-2xl sm:w-20"><SmartImage src={p.images[0]?.url} alt={p.name} seed={`pack-${p.slug}-0`} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-foreground">{p.name}</h3>
                  <StatusBadge status={p.status} map={residenceStatusMeta} size="sm" />
                </div>
                <p className="text-sm text-muted">{p.destination?.name ?? "Sans destination"} - {formatPrice(p.price)} - {p._count.reservations} réservation(s)</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm"><Link href={`/admin/packs/${p.id}/edit`}><Pencil className="h-3.5 w-3.5" /> Modifier</Link></Button>
                <AdminActions
                  actions={p.status === "PUBLISHED"
                    ? [{ label: "Dépublier", fn: setPackStatus.bind(null, p.id, "UNPUBLISHED"), variant: "ghost" }]
                    : [{ label: "Publier", fn: setPackStatus.bind(null, p.id, "PUBLISHED"), variant: "soft" }]}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
