import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Plus, Pencil, CheckCircle2, MapPin } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { SmartImage } from "@/components/ui/smart-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Destinations - Admin" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminDestinationsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const active = str(sp.active);
  const q = str(sp.q)?.trim();

  const where: Prisma.DestinationWhereInput = {};
  if (active === "active") where.isActive = true;
  else if (active === "inactive") where.isActive = false;
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { region: { contains: q, mode: "insensitive" } }];

  const destinations = await prisma.destination.findMany({
    where,
    include: { _count: { select: { residences: true, packs: true } } },
    orderBy: { priority: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Destinations"
        description="Gerez les villes couvertes par KoraStay."
        actions={<Button asChild><Link href="/admin/destinations/new"><Plus className="h-4 w-4" /> Nouvelle destination</Link></Button>}
      />

      {sp.created === "1" && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-success/30 bg-emerald-50 p-4 text-sm text-success">
          <CheckCircle2 className="h-5 w-5" /> Destination creee avec succes.
        </div>
      )}

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: "Nom, region..." },
          { type: "select", name: "active", label: "Toutes", options: [{ value: "active", label: "Actives" }, { value: "inactive", label: "Inactives" }] },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((d) => (
          <div key={d.id} className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
            <div className="relative aspect-[16/10]">
              <SmartImage src={d.heroImageUrl} alt={d.name} seed={`dest-${d.slug}`} />
              <div className="absolute right-2 top-2">
                <Badge tone={d.isActive ? "success" : "neutral"} className="bg-white/95">{d.isActive ? "Active" : "Inactive"}</Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-foreground">{d.name}</h3>
                <Button asChild variant="outline" size="sm"><Link href={`/admin/destinations/${d.id}/edit`}><Pencil className="h-3.5 w-3.5" /> Modifier</Link></Button>
              </div>
              <p className="flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3" /> {d.region ?? "-"}</p>
              <p className="mt-2 text-xs text-muted">{d._count.residences} residence(s) · {d._count.packs} pack(s) · priorite {d.priority}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
