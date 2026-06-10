import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { verificationStatusMeta, partnerTypeMeta, toFilterOptions } from "@/lib/enums";

export const metadata = { title: "Partenaires - Admin" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminPartnersPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const type = str(sp.type);
  const q = str(sp.q)?.trim();

  const where: Prisma.PartnerProfileWhereInput = {};
  if (status) where.verificationStatus = status;
  if (type) where.type = type;
  if (q) {
    where.OR = [
      { businessName: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { user: { is: { OR: [{ firstName: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } } },
    ];
  }

  const partners = await prisma.partnerProfile.findMany({
    where,
    include: { user: { select: { firstName: true, lastName: true, email: true } }, _count: { select: { services: true, missions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Partenaires" description="Validez et gerez le reseau de partenaires." />

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: "Nom, ville, contact..." },
          { type: "select", name: "status", label: "Tous les statuts", options: toFilterOptions(verificationStatusMeta, ["PENDING_REVIEW", "VERIFIED", "NEEDS_CHANGES", "REJECTED", "SUSPENDED"]) },
          { type: "select", name: "type", label: "Tous les types", options: toFilterOptions(partnerTypeMeta) },
        ]}
      />

      <div className="space-y-3">
        {partners.map((p) => (
          <Link key={p.id} href={`/admin/partners/${p.id}`} className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-4 shadow-soft transition-shadow hover:shadow-card">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-foreground">{p.businessName}</h3>
                <Badge tone="gold">{partnerTypeMeta[p.type]?.label}</Badge>
              </div>
              <p className="text-sm text-muted">{p.city} - {p.user.firstName} {p.user.lastName} - {p._count.services} service(s)</p>
            </div>
            <StatusBadge status={p.verificationStatus} map={verificationStatusMeta} size="sm" />
          </Link>
        ))}
        {partners.length === 0 && <p className="py-10 text-center text-muted">Aucun partenaire.</p>}
      </div>
    </div>
  );
}
