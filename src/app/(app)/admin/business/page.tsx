import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Briefcase, MapPin, UserRound, CalendarDays } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { card } from "@/components/dashboard/styles";
import { businessRequestStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatDate, formatPrice, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.community.business.metaTitle };
}

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

  const [requests, { locale, dict }] = await Promise.all([prisma.businessRequest.findMany({ where, orderBy: { createdAt: "desc" } }), getI18n()]);
  const t = dict.dashAdmin.community.business;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t.title} description={t.subtitle} />

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: t.searchPlaceholder },
          { type: "select", name: "status", label: t.allStatuses, options: toFilterOptions(businessRequestStatusMeta) },
        ]}
      />

      {requests.length === 0 ? (
        <EmptyState icon={Briefcase} title={t.empty} />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Link
              key={r.id}
              href={localePath(`/admin/business/${r.id}`, locale)}
              className={cn(card, "flex items-center justify-between gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-card sm:p-5")}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg leading-tight text-foreground">{r.organizationName}</h3>
                  {r.organizationType && <span className="text-xs text-muted">{r.organizationType}</span>}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1"><UserRound className="h-3.5 w-3.5" /> {r.contactName}</span>
                  {r.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {r.city}</span>}
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(r.createdAt, locale)}</span>
                </p>
                {r.needType && <p className="mt-1 text-xs font-medium text-terracotta">{r.needType}</p>}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <StatusBadge status={r.status} map={businessRequestStatusMeta} size="sm" />
                {r.budget && <span className="text-xs font-semibold text-foreground">{formatPrice(r.budget)}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
