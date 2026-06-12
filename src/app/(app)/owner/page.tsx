import Link from "next/link";
import { Home, CalendarCheck, Wallet, Star, Plus, Clock, ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getOwnerStats, getOwnerBookings } from "@/lib/owner-queries";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { reservationStatusMeta } from "@/lib/enums";
import { formatPrice, formatDateRange } from "@/lib/utils";

export const metadata = { title: "Tableau de bord propriétaire" };

export default async function OwnerDashboard() {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const [stats, bookings] = await Promise.all([
    getOwnerStats(user.id),
    getOwnerBookings(user.id),
  ]);
  const recent = bookings.slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`Bonjour ${user.firstName}`}
        description="Pilotez vos résidences et vos réservations."
        actions={<Button asChild><Link href="/owner/residences/new"><Plus className="h-4 w-4" /> Ajouter une résidence</Link></Button>}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard label="Résidences publiees" value={stats.published} icon={Home} tone="brand" href="/owner/residences?status=PUBLISHED" />
        <KpiCard label="En attente" value={stats.pending} icon={Clock} tone="gold" hint="Validation KoraStay" href="/owner/residences?status=PENDING_VALIDATION" />
        <KpiCard label="Réservations" value={stats.bookings} icon={CalendarCheck} tone="info" href="/owner/bookings" />
        <KpiCard label="Revenus" value={formatPrice(stats.revenue)} icon={Wallet} tone="success" href="/owner/revenues" />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Réservations récentes</h2>
        <Link href="/owner/bookings" className="flex items-center gap-1 text-sm font-semibold text-brand-600">Tout voir <ArrowRight className="h-4 w-4" /></Link>
      </div>

      <div className="mt-4">
        {recent.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="Aucune réservation" description="Vos réservations apparaitront ici une fois vos résidences publiees." />
        ) : (
          <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-soft/50 text-left text-xs uppercase text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Référence</th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">Résidence</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Dates</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                  <th className="px-5 py-3 text-right font-semibold">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-soft/40">
                    <td className="px-5 py-3"><Link href={`/owner/bookings/${r.id}`} className="font-semibold text-brand-600">{r.reference}</Link></td>
                    <td className="hidden px-5 py-3 text-foreground sm:table-cell">{r.residence?.name}</td>
                    <td className="hidden px-5 py-3 text-muted md:table-cell">{formatDateRange(r.startDate, r.endDate)}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} map={reservationStatusMeta} size="sm" /></td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground">{formatPrice(r.totalAmount)}</td>
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
