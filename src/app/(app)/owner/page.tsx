import Link from "next/link";
import { Home, CalendarCheck, Wallet, Plus, Clock, ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getOwnerStats, getOwnerBookings } from "@/lib/owner-queries";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { table, sectionTitle } from "@/components/dashboard/styles";
import { reservationStatusMeta } from "@/lib/enums";
import { formatPrice, formatDateRange } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashOwner.home.metaTitle };
}

export default async function OwnerDashboard() {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const [stats, recent, { locale, dict }] = await Promise.all([
    getOwnerStats(user.id),
    getOwnerBookings(user.id, 5),
    getI18n(),
  ]);
  const t = dict.dashOwner.home;
  const th = dict.dashOwner.table;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow={dict.dash.spaces.OWNER}
        title={dict.dash.hello.replace("{name}", user.firstName)}
        description={t.subtitle}
        actions={
          <Button asChild variant="terracotta">
            <Link href={localePath("/owner/residences/new", locale)}><Plus className="h-4 w-4" /> {t.addResidence}</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard label={t.kpiPublished} value={stats.published} icon={Home} tone="brand" href="/owner/residences?status=PUBLISHED" />
        <KpiCard label={t.kpiPending} value={stats.pending} icon={Clock} tone="gold" hint={t.kpiPendingHint} href="/owner/residences?status=PENDING_VALIDATION" />
        <KpiCard label={t.kpiBookings} value={stats.bookings} icon={CalendarCheck} tone="info" href="/owner/bookings" />
        <KpiCard label={t.kpiRevenue} value={formatPrice(stats.revenue)} icon={Wallet} tone="danger" href="/owner/revenues" />
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <h2 className={sectionTitle}>{t.recent}</h2>
        <Link href={localePath("/owner/bookings", locale)} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta">
          {dict.dash.common.seeAll} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-4">
        {recent.length === 0 ? (
          <EmptyState icon={CalendarCheck} title={t.emptyTitle} description={t.emptyText} />
        ) : (
          <div className={table.wrap}>
            <table className={table.table}>
              <thead className={table.head}>
                <tr>
                  <th className={table.th}>{th.reference}</th>
                  <th className={`${table.th} hidden sm:table-cell`}>{th.residence}</th>
                  <th className={`${table.th} hidden md:table-cell`}>{th.dates}</th>
                  <th className={table.th}>{th.status}</th>
                  <th className={`${table.th} text-right`}>{th.amount}</th>
                </tr>
              </thead>
              <tbody className={table.body}>
                {recent.map((r) => (
                  <tr key={r.id} className={table.row}>
                    <td className={table.td}>
                      <Link href={localePath(`/owner/bookings/${r.id}`, locale)} className={table.link}>{r.reference}</Link>
                    </td>
                    <td className={`${table.td} hidden text-foreground sm:table-cell`}>{r.residence?.name}</td>
                    <td className={`${table.td} hidden text-muted md:table-cell`}>{formatDateRange(r.startDate, r.endDate, locale)}</td>
                    <td className={table.td}><StatusBadge status={r.status} map={reservationStatusMeta} size="sm" /></td>
                    <td className={`${table.td} text-right font-semibold text-foreground`}>{formatPrice(r.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
