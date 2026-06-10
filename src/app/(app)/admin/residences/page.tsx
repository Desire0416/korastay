import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { SmartImage } from "@/components/ui/smart-image";
import { Button } from "@/components/ui/button";
import { residenceStatusMeta, residenceTypeMeta, qualityLevelMeta, toFilterOptions } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Residences - Admin" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminResidencesPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const type = str(sp.type);
  const q = str(sp.q)?.trim();

  const where: Prisma.ResidenceWhereInput = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { owner: { is: { OR: [{ firstName: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }] } } },
    ];
  }

  const residences = await prisma.residence.findMany({
    where,
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, owner: { select: { firstName: true, lastName: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Residences"
        description="Validez, creez et gerez le catalogue de residences."
        actions={<Button asChild><Link href="/admin/residences/new"><Plus className="h-4 w-4" /> Nouvelle residence</Link></Button>}
      />

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: "Nom, ville, proprietaire..." },
          { type: "select", name: "status", label: "Tous les statuts", options: toFilterOptions(residenceStatusMeta) },
          { type: "select", name: "type", label: "Tous les types", options: toFilterOptions(residenceTypeMeta) },
        ]}
      />

      <div className="space-y-3">
        {residences.map((r) => (
          <Link key={r.id} href={`/admin/residences/${r.id}`} className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-4 shadow-soft transition-shadow hover:shadow-card">
            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-2xl"><SmartImage src={r.images[0]?.url} alt={r.name} seed={`${r.slug}-0`} /></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-foreground">{r.name}</h3>
                <StatusBadge status={r.status} map={residenceStatusMeta} size="sm" />
                {r.qualityLevel && <span className="text-xs font-semibold text-gold-600">{qualityLevelMeta[r.qualityLevel]?.label}</span>}
              </div>
              <p className="text-sm text-muted">{r.city} - {r.owner.firstName} {r.owner.lastName}</p>
            </div>
            <p className="hidden shrink-0 font-extrabold text-foreground sm:block">{formatPrice(r.pricePerNight)}<span className="text-xs font-normal text-muted">/nuit</span></p>
          </Link>
        ))}
        {residences.length === 0 && <p className="py-10 text-center text-muted">Aucune residence.</p>}
      </div>
    </div>
  );
}
