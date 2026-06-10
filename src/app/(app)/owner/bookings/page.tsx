import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getOwnerBookings } from "@/lib/owner-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { reservationStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatPrice, formatDateRange } from "@/lib/utils";

export const metadata = { title: "Reservations recues" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function OwnerBookingsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const q = str(sp.q)?.trim().toLowerCase();

  const all = await getOwnerBookings(user.id);
  const bookings = all.filter(
    (r) =>
      (!status || r.status === status) &&
      (!q ||
        r.reference.toLowerCase().includes(q) ||
        (r.residence?.name ?? "").toLowerCase().includes(q) ||
        (r.guestName ?? "").toLowerCase().includes(q))
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Reservations recues" description="Toutes les reservations de vos residences." />

      {all.length > 0 && (
        <FilterBar
          fields={[
            { type: "search", name: "q", placeholder: "Reference, residence, voyageur..." },
            { type: "select", name: "status", label: "Tous les statuts", options: toFilterOptions(reservationStatusMeta) },
          ]}
        />
      )}

      {bookings.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="Aucune reservation" description={all.length === 0 ? "Les reservations de vos residences apparaitront ici." : "Aucun resultat pour ces criteres."} />
      ) : (
      <>
        {/* Mobile : liste de cartes */}
        <div className="space-y-2.5 md:hidden">
          {bookings.map((r) => (
            <Link key={r.id} href={`/owner/bookings/${r.id}`} className="block rounded-2xl border border-border bg-surface p-3.5 shadow-soft active:bg-surface-soft">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-brand-600">{r.reference}</span>
                <StatusBadge status={r.status} map={reservationStatusMeta} size="sm" />
              </div>
              <p className="mt-1 truncate text-[14px] font-medium text-foreground">{r.residence?.name}</p>
              <div className="mt-1 flex items-center justify-between gap-2 text-[12px] text-muted">
                <span className="truncate">{r.guestName} · {formatDateRange(r.startDate, r.endDate)}</span>
                <span className="shrink-0 font-bold text-foreground">{formatPrice(r.totalAmount)}</span>
              </div>
            </Link>
          ))}
        </div>
        {/* Desktop : tableau */}
        <div className="hidden overflow-hidden rounded-3xl border border-border bg-surface shadow-soft md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border bg-surface-soft/50 text-left text-xs uppercase text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Reference</th>
                  <th className="px-5 py-3 font-semibold">Residence</th>
                  <th className="px-5 py-3 font-semibold">Voyageur</th>
                  <th className="px-5 py-3 font-semibold">Dates</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                  <th className="px-5 py-3 text-right font-semibold">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-soft/40">
                    <td className="px-5 py-3"><Link href={`/owner/bookings/${r.id}`} className="font-semibold text-brand-600">{r.reference}</Link></td>
                    <td className="px-5 py-3 text-foreground">{r.residence?.name}</td>
                    <td className="px-5 py-3 text-muted">{r.guestName}</td>
                    <td className="px-5 py-3 text-muted">{formatDateRange(r.startDate, r.endDate)}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} map={reservationStatusMeta} size="sm" /></td>
                    <td className="px-5 py-3 text-right font-semibold text-foreground">{formatPrice(r.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
      )}
    </div>
  );
}
