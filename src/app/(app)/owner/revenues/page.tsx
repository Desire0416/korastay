import { Wallet, TrendingUp } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getOwnerRevenue } from "@/lib/owner-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Revenus" };

export default async function OwnerRevenuesPage() {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const { reservations, total } = await getOwnerRevenue(user.id);
  const avg = reservations.length ? Math.round(total / reservations.length) : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Revenus" description="Suivez vos gains (hors frais de service KoraStay)." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Revenu total" value={formatPrice(total)} icon={Wallet} tone="success" />
        <KpiCard label="Réservations" value={reservations.length} icon={TrendingUp} tone="brand" />
        <KpiCard label="Panier moyen" value={formatPrice(avg)} icon={Wallet} tone="gold" />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-bold text-foreground">Détail des revenus</h2>
      {reservations.length === 0 ? (
        <EmptyState icon={Wallet} title="Aucun revenu" description="Vos revenus apparaitront ici après vos premières réservations confirmées." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-soft/50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Référence</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Résidence</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Date</th>
                <th className="px-5 py-3 text-right font-semibold">Votre part</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-surface-soft/40">
                  <td className="px-5 py-3 font-semibold text-foreground">{r.reference}</td>
                  <td className="hidden px-5 py-3 text-muted sm:table-cell">{r.residence?.name}</td>
                  <td className="hidden px-5 py-3 text-muted md:table-cell">{r.confirmedAt ? formatDate(r.confirmedAt) : "-"}</td>
                  <td className="px-5 py-3 text-right font-semibold text-success">{formatPrice(r.subtotalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
