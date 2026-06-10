import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { businessRequestStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = { title: "Business - Admin" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminBusinessPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const q = str(sp.q)?.trim();

  const where: Prisma.BusinessRequestWhereInput = {};
  if (status) where.status = status;
  if (q) where.OR = [{ organizationName: { contains: q, mode: "insensitive" } }, { contactName: { contains: q, mode: "insensitive" } }, { city: { contains: q, mode: "insensitive" } }];

  const requests = await prisma.businessRequest.findMany({ where, orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Demandes Business" description="Devis et demandes des entreprises et particuliers." />

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: "Organisation, contact, ville..." },
          { type: "select", name: "status", label: "Tous les statuts", options: toFilterOptions(businessRequestStatusMeta) },
        ]}
      />

      <div className="space-y-3">
        {requests.map((r) => (
          <Link key={r.id} href={`/admin/business/${r.id}`} className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-4 shadow-soft transition-shadow hover:shadow-card">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-foreground">{r.organizationName}</h3>
                {r.organizationType && <span className="text-xs text-muted">{r.organizationType}</span>}
              </div>
              <p className="text-sm text-muted">{r.contactName} - {r.city ?? "-"} - {formatDate(r.createdAt)}</p>
              {r.needType && <p className="text-xs text-brand-600">{r.needType}</p>}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <StatusBadge status={r.status} map={businessRequestStatusMeta} size="sm" />
              {r.budget && <span className="text-xs text-muted">{formatPrice(r.budget)}</span>}
            </div>
          </Link>
        ))}
        {requests.length === 0 && <p className="py-10 text-center text-muted">Aucune demande.</p>}
      </div>
    </div>
  );
}
