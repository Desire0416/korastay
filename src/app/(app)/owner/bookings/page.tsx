import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getOwnerBookings } from "@/lib/owner-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { table, mobileItem } from "@/components/dashboard/styles";
import { reservationStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatPrice, formatDateRange } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashOwner.bookings.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function OwnerBookingsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const q = str(sp.q)?.trim().toLowerCase();

  const [all, { locale, dict }] = await Promise.all([getOwnerBookings(user.id), getI18n()]);
  const t = dict.dashOwner.bookings;
  const th = dict.dashOwner.table;
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
      <PageHeader title={t.title} description={t.subtitle} />

      {all.length > 0 && (
        <FilterBar
          fields={[
            { type: "search", name: "q", placeholder: t.searchPlaceholder },
            { type: "select", name: "status", label: t.allStatuses, options: toFilterOptions(reservationStatusMeta) },
          ]}
        />
      )}

      {bookings.length === 0 ? (
        <EmptyState icon={CalendarCheck} title={t.emptyTitle} description={all.length === 0 ? t.emptyText : t.noResultText} />
      ) : (
        <>
          {/* Mobile : liste de cartes */}
          <div className="space-y-2.5 md:hidden">
            {bookings.map((r) => (
              <Link key={r.id} href={localePath(`/owner/bookings/${r.id}`, locale)} className={mobileItem}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-terracotta">{r.reference}</span>
                  <StatusBadge status={r.status} map={reservationStatusMeta} size="sm" />
                </div>
                <p className="mt-1.5 truncate font-display text-[17px] text-foreground">{r.residence?.name}</p>
                <div className="mt-1 flex items-center justify-between gap-2 text-[12.5px] text-muted">
                  <span className="truncate">{r.guestName} · {formatDateRange(r.startDate, r.endDate, locale)}</span>
                  <span className="shrink-0 font-bold text-foreground">{formatPrice(r.totalAmount)}</span>
                </div>
              </Link>
            ))}
          </div>
          {/* Desktop : tableau */}
          <div className={`${table.wrap} hidden md:block`}>
            <div className="overflow-x-auto">
              <table className={`${table.table} min-w-[640px]`}>
                <thead className={table.head}>
                  <tr>
                    <th className={table.th}>{th.reference}</th>
                    <th className={table.th}>{th.residence}</th>
                    <th className={table.th}>{th.traveler}</th>
                    <th className={table.th}>{th.dates}</th>
                    <th className={table.th}>{th.status}</th>
                    <th className={`${table.th} text-right`}>{th.amount}</th>
                  </tr>
                </thead>
                <tbody className={table.body}>
                  {bookings.map((r) => (
                    <tr key={r.id} className={table.row}>
                      <td className={table.td}>
                        <Link href={localePath(`/owner/bookings/${r.id}`, locale)} className={table.link}>{r.reference}</Link>
                      </td>
                      <td className={`${table.td} text-foreground`}>{r.residence?.name}</td>
                      <td className={`${table.td} text-muted`}>{r.guestName}</td>
                      <td className={`${table.td} text-muted`}>{formatDateRange(r.startDate, r.endDate, locale)}</td>
                      <td className={table.td}><StatusBadge status={r.status} map={reservationStatusMeta} size="sm" /></td>
                      <td className={`${table.td} text-right font-semibold text-foreground`}>{formatPrice(r.totalAmount)}</td>
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
