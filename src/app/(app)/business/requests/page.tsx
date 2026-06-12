import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Plus, FileText, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { businessRequestStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = { title: "Mes demandes business" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function BusinessRequestsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const q = str(sp.q)?.trim();
  const membership = await prisma.businessMember.findFirst({ where: { userId: user.id } });

  const where: Prisma.BusinessRequestWhereInput = membership
    ? { businessAccountId: membership.businessAccountId }
    : { email: user.email };
  // "open" = demandes en cours (KPI tableau de bord)
  if (status === "open") where.status = { in: ["NEW", "IN_REVIEW", "QUOTED"] };
  else if (status) where.status = status;
  if (q) where.AND = [{ OR: [{ needType: { contains: q, mode: "insensitive" } }, { city: { contains: q, mode: "insensitive" } }, { organizationName: { contains: q, mode: "insensitive" } }] }];

  const requests = await prisma.businessRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Mes demandes" description="Suivez l'avancement de vos demandes." actions={<Button asChild><Link href="/business/requests/new"><Plus className="h-4 w-4" /> Nouvelle</Link></Button>} />

      {sp.created === "1" && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-success/30 bg-emerald-50 p-4 text-sm text-success">
          <CheckCircle2 className="h-5 w-5" /> Votre demande a ete envoyée. Un conseiller KoraStay Business vous contactera.
        </div>
      )}

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: "Besoin, ville, organisation..." },
          { type: "select", name: "status", label: "Tous les statuts", options: toFilterOptions(businessRequestStatusMeta) },
        ]}
      />

      {requests.length === 0 ? (
        <EmptyState icon={FileText} title="Aucune demande" description="Créez votre première demande de séjour professionnel." action={<Button asChild><Link href="/business/requests/new">Nouvelle demande</Link></Button>} />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Link key={r.id} href={`/business/requests/${r.id}`} className="flex items-center justify-between gap-3 rounded-3xl border border-border bg-surface p-5 shadow-soft hover:shadow-card">
              <div><p className="font-bold text-foreground">{r.needType ?? "Demande"}</p><p className="text-sm text-muted">{r.city} - {r.teamSize ? `${r.teamSize} pers. - ` : ""}{formatDate(r.createdAt)}</p></div>
              <div className="flex items-center gap-3">
                {r.budget && <span className="hidden text-sm text-muted sm:block">{formatPrice(r.budget)}</span>}
                <StatusBadge status={r.status} map={businessRequestStatusMeta} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
