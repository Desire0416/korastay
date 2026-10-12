import { Wallet, TrendingUp, Receipt } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getOwnerRevenue } from "@/lib/owner-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { table, sectionTitle } from "@/components/dashboard/styles";
import { formatPrice, formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashOwner.revenues.metaTitle };
}

export default async function OwnerRevenuesPage() {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const [{ reservations, total }, { locale, dict }] = await Promise.all([getOwnerRevenue(user.id), getI18n()]);
  const t = dict.dashOwner.revenues;
  const th = dict.dashOwner.table;
  const avg = reservations.length ? Math.round(total / reservations.length) : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t.title} description={t.subtitle} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <KpiCard label={t.total} value={formatPrice(total)} icon={Wallet} tone="brand" />
        <KpiCard label={t.bookings} value={reservations.length} icon={TrendingUp} tone="info" />
        <KpiCard label={t.average} value={formatPrice(avg)} icon={Receipt} tone="gold" />
      </div>

      <h2 className={`${sectionTitle} mb-4 mt-10`}>{t.detail}</h2>
      {reservations.length === 0 ? (
        <EmptyState icon={Wallet} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead className={table.head}>
              <tr>
                <th className={table.th}>{th.reference}</th>
                <th className={`${table.th} hidden sm:table-cell`}>{th.residence}</th>
                <th className={`${table.th} hidden md:table-cell`}>{th.date}</th>
                <th className={`${table.th} text-right`}>{th.yourShare}</th>
              </tr>
            </thead>
            <tbody className={table.body}>
              {reservations.map((r) => (
                <tr key={r.id} className={table.row}>
                  <td className={`${table.td} font-semibold text-foreground`}>{r.reference}</td>
                  <td className={`${table.td} hidden text-muted sm:table-cell`}>{r.residence?.name}</td>
                  <td className={`${table.td} hidden text-muted md:table-cell`}>{r.confirmedAt ? formatDate(r.confirmedAt, locale) : "-"}</td>
                  <td className={`${table.td} text-right font-semibold text-brand-700`}>{formatPrice(r.subtotalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
