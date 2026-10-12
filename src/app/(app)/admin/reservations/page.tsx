import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { CalendarCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { table, mobileItem } from "@/components/dashboard/styles";
import { reservationStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatPrice, formatDateShort } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.ops.reservations.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminReservationsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const type = str(sp.type);
  const q = str(sp.q)?.trim();

  const where: Prisma.ReservationWhereInput = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (q) {
    where.OR = [
      { reference: { contains: q, mode: "insensitive" } },
      { traveler: { is: { OR: [{ firstName: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } } },
      { residence: { is: { name: { contains: q, mode: "insensitive" } } } },
      { pack: { is: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [reservations, { locale, dict }] = await Promise.all([
    prisma.reservation.findMany({
      where,
      include: {
        traveler: { select: { firstName: true, lastName: true } },
        residence: { select: { name: true } },
        pack: { select: { name: true } },
        activity: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    getI18n(),
  ]);
  const t = dict.dashAdmin.ops.reservations;
  const th = dict.dashAdmin.ops.table;
  const itemName = (r: (typeof reservations)[number]) => r.residence?.name ?? r.pack?.name ?? r.activity?.name ?? "-";

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={t.title} description={t.subtitle} />

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: t.searchPlaceholder },
          { type: "select", name: "status", label: t.allStatuses, options: toFilterOptions(reservationStatusMeta) },
          { type: "select", name: "type", label: t.allTypes, options: Object.entries(t.types).map(([value, label]) => ({ value, label })) },
        ]}
      />

      {reservations.length === 0 ? (
        <EmptyState icon={CalendarCheck} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <>
          {/* Mobile : liste de cartes */}
          <div className="space-y-2.5 md:hidden">
            {reservations.map((r) => (
              <Link key={r.id} href={localePath(`/admin/reservations/${r.id}`, locale)} className={mobileItem}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-terracotta">{r.reference}</span>
                  <StatusBadge status={r.status} map={reservationStatusMeta} size="sm" />
                </div>
                <p className="mt-1.5 truncate font-display text-[17px] text-foreground">{itemName(r)}</p>
                <div className="mt-1 flex items-center justify-between gap-2 text-[12.5px] text-muted">
                  <span className="truncate">{r.traveler.firstName} {r.traveler.lastName} · {formatDateShort(r.startDate, locale)}</span>
                  <span className="shrink-0 font-bold text-foreground">{formatPrice(r.totalAmount)}</span>
                </div>
              </Link>
            ))}
          </div>
          {/* Desktop : tableau */}
          <div className={`${table.wrap} hidden md:block`}>
            <div className="overflow-x-auto">
              <table className={`${table.table} min-w-[700px]`}>
                <thead className={table.head}>
                  <tr>
                    <th className={table.th}>{th.reference}</th>
                    <th className={table.th}>{th.item}</th>
                    <th className={table.th}>{th.traveler}</th>
                    <th className={table.th}>{th.date}</th>
                    <th className={table.th}>{th.status}</th>
                    <th className={`${table.th} text-right`}>{th.amount}</th>
                  </tr>
                </thead>
                <tbody className={table.body}>
                  {reservations.map((r) => (
                    <tr key={r.id} className={table.row}>
                      <td className={table.td}>
                        <Link href={localePath(`/admin/reservations/${r.id}`, locale)} className={table.link}>{r.reference}</Link>
                      </td>
                      <td className={`${table.td} text-foreground`}>{itemName(r)}</td>
                      <td className={`${table.td} text-muted`}>{r.traveler.firstName} {r.traveler.lastName}</td>
                      <td className={`${table.td} text-muted`}>{formatDateShort(r.startDate, locale)}</td>
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
