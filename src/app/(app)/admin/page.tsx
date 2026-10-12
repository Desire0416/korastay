import Link from "next/link";
import {
  CalendarCheck, Wallet, Home, Clock, Users, Handshake, Briefcase, AlertTriangle, CreditCard, ArrowRight, Megaphone,
  BarChart3, Trophy, MapPin, type LucideIcon,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAdminStats, getReservationsByCity, getRecentReservationsAdmin, getMonthlyStats, getTopListings } from "@/lib/admin-queries";
import { getAnnouncement } from "@/lib/settings";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { MonthlyBars } from "@/components/dashboard/monthly-bars";
import { StatusBadge } from "@/components/ui/status-badge";
import { card, cardTitle } from "@/components/dashboard/styles";
import { reservationStatusMeta } from "@/lib/enums";
import { formatPrice, formatPriceShort, formatDateShort, MONTHS_SHORT, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.ops.home.metaTitle };
}

export default async function AdminDashboard() {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const [stats, byCity, recent, monthly, top, announcement, { locale, dict }] = await Promise.all([
    getAdminStats(),
    getReservationsByCity(),
    getRecentReservationsAdmin(6),
    getMonthlyStats(6),
    getTopListings(5),
    getAnnouncement(),
    getI18n(),
  ]);
  const t = dict.dashAdmin.ops.home;
  const maxCity = Math.max(1, ...byCity.map((c) => c.count));
  const monthLabel = (m: { month: number }) => MONTHS_SHORT[locale][m.month];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader eyebrow={dict.dash.spaces.ADMIN} title={t.title} description={t.subtitle} />

      {announcement && (
        <div className="mb-6 flex items-start gap-3 rounded-[1.25rem] bg-gold-50 p-4 text-gold-900 ring-1 ring-inset ring-gold-200/70">
          <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
          <p className="text-sm">{announcement}</p>
        </div>
      )}

      {stats.disputes > 0 && (
        <Link
          href={localePath("/admin/reservations?status=DISPUTED", locale)}
          className="mb-6 flex items-center gap-3 rounded-[1.25rem] bg-danger-50 p-4 text-danger-700 ring-1 ring-inset ring-danger-200/70 transition-colors hover:bg-danger-100/60"
        >
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="flex-1 text-sm font-medium">{t.disputes.replace("{n}", String(stats.disputes))}</p>
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard label={t.kpiBookingsMonth} value={stats.bookingsMonth} icon={CalendarCheck} tone="brand" href="/admin/reservations" />
        <KpiCard label={t.kpiRevenue} value={formatPrice(stats.revenue)} icon={Wallet} tone="danger" href="/admin/payments?status=PAID" />
        <KpiCard label={t.kpiPaidPayments} value={stats.paidPaymentsCount} icon={CreditCard} tone="info" href="/admin/payments?status=PAID" />
        <KpiCard label={t.kpiPublished} value={stats.publishedResidences} icon={Home} tone="success" href="/admin/residences?status=PUBLISHED" />
        <KpiCard label={t.kpiPending} value={stats.pendingResidences} icon={Clock} tone="gold" href="/admin/residences?status=PENDING_VALIDATION" />
        <KpiCard label={t.kpiUsers} value={stats.users} icon={Users} tone="info" href="/admin/users" />
        <KpiCard label={t.kpiPendingPartners} value={stats.pendingPartners} icon={Handshake} tone="gold" href="/admin/partners?status=PENDING_REVIEW" />
        <KpiCard label={t.kpiBusiness} value={stats.businessRequests} icon={Briefcase} tone="brand" href="/admin/business" />
      </div>

      {/* Graphiques mensuels */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel icon={BarChart3} title={t.bookingsByMonth}>
          <MonthlyBars data={monthly.map((m) => ({ label: monthLabel(m), value: m.count }))} />
        </Panel>
        <Panel icon={Wallet} title={t.revenueByMonth}>
          <MonthlyBars data={monthly.map((m) => ({ label: monthLabel(m), value: m.revenue }))} formatValue={formatPriceShort} color="bg-gold-400" />
        </Panel>
      </div>

      {/* Top residences / packs */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel icon={Trophy} title={t.topResidences}>
          <TopList items={top.topResidences} noData={t.noData} unit={t.bookingsShort} accent="text-brand-600" />
        </Panel>
        <Panel icon={Trophy} title={t.topPacks}>
          <TopList items={top.topPacks} noData={t.noData} unit={t.bookingsShort} accent="text-terracotta" />
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Repartition par ville */}
        <Panel icon={MapPin} title={t.byCity}>
          {byCity.length === 0 ? (
            <p className="text-sm text-muted">{t.noData}</p>
          ) : (
            <div className="space-y-3.5">
              {byCity.slice(0, 8).map((c) => (
                <div key={c.city}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{c.city}</span>
                    <span className="text-muted">{c.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-sand-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${(c.count / maxCity) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Reservations recentes */}
        <section className={cn(card, "p-5 sm:p-6")}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className={cardTitle}>
              <CalendarCheck className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.recent}
            </h2>
            <Link href={localePath("/admin/reservations", locale)} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta">
              {dict.dash.common.seeAll} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="-mx-2 space-y-1">
            {recent.map((r) => (
              <Link
                key={r.id}
                href={localePath(`/admin/reservations/${r.id}`, locale)}
                className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-sand-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{r.residence?.name ?? r.pack?.name}</p>
                  <p className="text-xs text-muted">{r.traveler.firstName} {r.traveler.lastName} · {formatDateShort(r.startDate, locale)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={r.status} map={reservationStatusMeta} size="sm" />
                  <span className="text-sm font-semibold text-foreground">{formatPrice(r.totalAmount)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Panel({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <section className={cn(card, "p-5 sm:p-6")}>
      <h2 className={cn(cardTitle, "mb-5")}>
        <Icon className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {title}
      </h2>
      {children}
    </section>
  );
}

function TopList({ items, noData, unit, accent }: { items: { name: string; count: number; revenue: number }[]; noData: string; unit: string; accent: string }) {
  if (items.length === 0) return <p className="text-sm text-muted">{noData}</p>;
  return (
    <ol className="space-y-2.5">
      {items.map((r, i) => (
        <li key={i} className="flex items-center justify-between gap-3 text-sm">
          <span className="flex min-w-0 items-center gap-3">
            <span className={cn("w-5 shrink-0 font-display text-lg leading-none", accent)}>{i + 1}</span>
            <span className="truncate text-foreground">{r.name}</span>
          </span>
          <span className="shrink-0 text-xs text-muted">
            {unit.replace("{n}", String(r.count))} · <span className="font-semibold text-foreground">{formatPrice(r.revenue)}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
