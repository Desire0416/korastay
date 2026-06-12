import Link from "next/link";
import {
  CalendarCheck, Wallet, Home, Clock, Users, Handshake, Briefcase, AlertTriangle, CreditCard, ArrowRight,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAdminStats, getReservationsByCity, getRecentReservationsAdmin, getMonthlyStats, getTopListings } from "@/lib/admin-queries";
import { getAnnouncement } from "@/lib/settings";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { MonthlyBars } from "@/components/dashboard/monthly-bars";
import { StatusBadge } from "@/components/ui/status-badge";
import { reservationStatusMeta } from "@/lib/enums";
import { formatPrice, formatPriceShort, formatDateShort } from "@/lib/utils";
import { Megaphone } from "lucide-react";

export const metadata = { title: "Administration" };

export default async function AdminDashboard() {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const [stats, byCity, recent, monthly, top, announcement] = await Promise.all([
    getAdminStats(),
    getReservationsByCity(),
    getRecentReservationsAdmin(6),
    getMonthlyStats(6),
    getTopListings(5),
    getAnnouncement(),
  ]);
  const maxCity = Math.max(1, ...byCity.map((c) => c.count));

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Tableau de bord" description="Vue d'ensemble de la plateforme KoraStay." />

      {announcement && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-gold-200 bg-gold-50 p-4">
          <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
          <p className="text-sm text-gold-800">{announcement}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard label="Réservations (mois)" value={stats.bookingsMonth} icon={CalendarCheck} tone="brand" href="/admin/reservations" />
        <KpiCard label="Revenus encaisses" value={formatPrice(stats.revenue)} icon={Wallet} tone="success" href="/admin/payments?status=PAID" />
        <KpiCard label="Paiements confirmés" value={stats.paidPaymentsCount} icon={CreditCard} tone="info" href="/admin/payments?status=PAID" />
        <KpiCard label="Résidences publiees" value={stats.publishedResidences} icon={Home} tone="brand" href="/admin/residences?status=PUBLISHED" />
        <KpiCard label="Résidences en attente" value={stats.pendingResidences} icon={Clock} tone="gold" href="/admin/residences?status=PENDING_VALIDATION" />
        <KpiCard label="Utilisateurs" value={stats.users} icon={Users} tone="info" href="/admin/users" />
        <KpiCard label="Partenaires en attente" value={stats.pendingPartners} icon={Handshake} tone="gold" href="/admin/partners?status=PENDING_REVIEW" />
        <KpiCard label="Demandes business" value={stats.businessRequests} icon={Briefcase} tone="brand" href="/admin/business" />
      </div>

      {/* Graphiques mensuels */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
          <h2 className="mb-4 font-bold text-foreground">Réservations par mois</h2>
          <MonthlyBars data={monthly.map((m) => ({ label: m.label, value: m.count }))} />
        </div>
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
          <h2 className="mb-4 font-bold text-foreground">Revenus par mois</h2>
          <MonthlyBars data={monthly.map((m) => ({ label: m.label, value: m.revenue }))} formatValue={formatPriceShort} color="bg-gold-500" />
        </div>
      </div>

      {/* Top residences / packs */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
          <h2 className="mb-4 font-bold text-foreground">Top résidences</h2>
          {top.topResidences.length === 0 ? <p className="text-sm text-muted">Aucune donnée.</p> : (
            <ul className="space-y-2">
              {top.topResidences.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-foreground"><span className="mr-2 font-bold text-brand-500">{i + 1}.</span>{r.name}</span>
                  <span className="shrink-0 text-muted">{r.count} resa · {formatPrice(r.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
          <h2 className="mb-4 font-bold text-foreground">Top packs</h2>
          {top.topPacks.length === 0 ? <p className="text-sm text-muted">Aucune donnée.</p> : (
            <ul className="space-y-2">
              {top.topPacks.map((p, i) => (
                <li key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-foreground"><span className="mr-2 font-bold text-gold-500">{i + 1}.</span>{p.name}</span>
                  <span className="shrink-0 text-muted">{p.count} resa · {formatPrice(p.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Repartition par ville */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
          <h2 className="mb-4 font-bold text-foreground">Réservations par ville</h2>
          {byCity.length === 0 ? (
            <p className="text-sm text-muted">Aucune donnée.</p>
          ) : (
            <div className="space-y-3">
              {byCity.slice(0, 8).map((c) => (
                <div key={c.city}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{c.city}</span>
                    <span className="text-muted">{c.count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-surface-soft">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${(c.count / maxCity) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reservations recentes */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-foreground">Réservations récentes</h2>
            <Link href="/admin/reservations" className="flex items-center gap-1 text-sm font-semibold text-brand-600">Tout voir <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="space-y-2">
            {recent.map((r) => (
              <Link key={r.id} href={`/admin/reservations/${r.id}`} className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-surface-soft">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{r.residence?.name ?? r.pack?.name}</p>
                  <p className="text-xs text-muted">{r.traveler.firstName} {r.traveler.lastName} - {formatDateShort(r.startDate)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={r.status} map={reservationStatusMeta} size="sm" />
                  <span className="text-sm font-semibold text-foreground">{formatPrice(r.totalAmount)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {stats.disputes > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-danger/30 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 text-danger" />
          <p className="text-sm text-danger">{stats.disputes} litige(s) en cours necessitent votre attention.</p>
        </div>
      )}
    </div>
  );
}
