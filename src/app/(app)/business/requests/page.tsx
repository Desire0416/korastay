import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Plus, FileText, CheckCircle2, MapPin, Users, CalendarDays } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { card } from "@/components/dashboard/styles";
import { businessRequestStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatDate, formatPrice, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashBusiness.requests.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function BusinessRequestsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const q = str(sp.q)?.trim();
  const [membership, { locale, dict }] = await Promise.all([prisma.businessMember.findFirst({ where: { userId: user.id } }), getI18n()]);
  const t = dict.dashBusiness.requests;

  const where: Prisma.BusinessRequestWhereInput = membership
    ? { businessAccountId: membership.businessAccountId }
    : { email: user.email };
  // "open" = demandes en cours (KPI tableau de bord)
  if (status === "open") where.status = { in: ["NEW", "IN_REVIEW", "QUOTED"] };
  else if (status) where.status = status;
  if (q) where.AND = [{ OR: [{ needType: { contains: q, mode: "insensitive" } }, { city: { contains: q, mode: "insensitive" } }, { organizationName: { contains: q, mode: "insensitive" } }] }];

  const requests = await prisma.businessRequest.findMany({ where, orderBy: { createdAt: "desc" } });
  const newHref = localePath("/business/requests/new", locale);
  const hasFilters = Boolean(status || q);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t.title}
        description={t.subtitle}
        actions={<Button asChild variant="terracotta"><Link href={newHref}><Plus className="h-4 w-4" /> {t.new}</Link></Button>}
      />

      {sp.created === "1" && (
        <div className="mb-5 flex items-center gap-3 rounded-[1.25rem] bg-brand-50 p-4 text-sm text-brand-800 ring-1 ring-inset ring-brand-200/70">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" /> {t.created}
        </div>
      )}

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: t.searchPlaceholder },
          { type: "select", name: "status", label: t.allStatuses, options: toFilterOptions(businessRequestStatusMeta) },
        ]}
      />

      {requests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t.emptyTitle}
          description={hasFilters ? t.noResultText : t.emptyText}
          action={hasFilters ? undefined : <Button asChild><Link href={newHref}>{dict.dashBusiness.home.newRequest}</Link></Button>}
        />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Link
              key={r.id}
              href={localePath(`/business/requests/${r.id}`, locale)}
              className={cn(card, "flex items-center justify-between gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-card")}
            >
              <div className="min-w-0">
                <p className="truncate font-display text-lg leading-tight text-foreground">{r.needType ?? dict.dashBusiness.home.request}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  {r.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {r.city}</span>}
                  {r.teamSize ? <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {t.persons.replace("{n}", String(r.teamSize))}</span> : null}
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(r.createdAt, locale)}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {r.budget && <span className="hidden text-sm font-semibold text-foreground sm:block">{formatPrice(r.budget)}</span>}
                <StatusBadge status={r.status} map={businessRequestStatusMeta} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
