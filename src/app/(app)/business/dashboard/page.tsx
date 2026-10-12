import Link from "next/link";
import { FileText, CheckCircle2, Clock, Plus, ArrowRight, MapPin, CalendarDays } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { card, sectionTitle } from "@/components/dashboard/styles";
import { businessRequestStatusMeta } from "@/lib/enums";
import { formatDate, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashBusiness.home.metaTitle };
}

export default async function BusinessDashboard() {
  const user = await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"]);
  const [membership, { locale, dict }] = await Promise.all([
    prisma.businessMember.findFirst({ where: { userId: user.id }, include: { businessAccount: true } }),
    getI18n(),
  ]);
  const account = membership?.businessAccount;
  const t = dict.dashBusiness.home;

  const requests = await prisma.businessRequest.findMany({
    where: account ? { businessAccountId: account.id } : { email: user.email },
    orderBy: { createdAt: "desc" },
  });

  const pending = requests.filter((r) => ["NEW", "IN_REVIEW", "QUOTED"].includes(r.status)).length;
  const confirmed = requests.filter((r) => r.status === "CONFIRMED").length;
  const newHref = localePath("/business/requests/new", locale);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow={dict.dash.spaces.BUSINESS}
        title={account?.name ?? dict.dash.hello.replace("{name}", user.firstName)}
        description={t.subtitle}
        actions={<Button asChild variant="terracotta"><Link href={newHref}><Plus className="h-4 w-4" /> {t.newRequest}</Link></Button>}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <KpiCard label={t.kpiRequests} value={requests.length} icon={FileText} tone="brand" href="/business/requests" />
        <KpiCard label={t.kpiOpen} value={pending} icon={Clock} tone="gold" href="/business/requests?status=open" />
        <KpiCard label={t.kpiConfirmed} value={confirmed} icon={CheckCircle2} tone="info" href="/business/requests?status=CONFIRMED" />
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <h2 className={sectionTitle}>{t.recent}</h2>
        <Link href={localePath("/business/requests", locale)} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta">
          {dict.dash.common.seeAll} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="mt-4 space-y-2.5">
        {requests.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t.emptyTitle}
            description={t.emptyText}
            action={<Button asChild><Link href={newHref}>{t.newRequest}</Link></Button>}
          />
        ) : (
          requests.slice(0, 5).map((r) => (
            <Link
              key={r.id}
              href={localePath(`/business/requests/${r.id}`, locale)}
              className={cn(card, "flex items-center justify-between gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-card sm:p-5")}
            >
              <div className="min-w-0">
                <p className="truncate font-display text-lg leading-tight text-foreground">{r.needType ?? t.request}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  {r.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {r.city}</span>}
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(r.createdAt, locale)}</span>
                </p>
              </div>
              <StatusBadge status={r.status} map={businessRequestStatusMeta} size="sm" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
