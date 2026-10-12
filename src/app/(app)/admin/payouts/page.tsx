import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Banknote, Hourglass, BadgeCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { releasePayout, blockPayout } from "@/server/actions/payments-admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { table, card } from "@/components/dashboard/styles";
import { payoutStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.ops.payouts.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminPayoutsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const status = str(sp.status);

  const where: Prisma.PayoutWhereInput = {};
  if (status) where.status = status;

  const [payouts, scheduled, released, { locale, dict }] = await Promise.all([
    prisma.payout.findMany({
      where,
      include: {
        owner: { select: { firstName: true, lastName: true, payoutTier: true } },
        reservation: { select: { id: true, reference: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.payout.aggregate({ where: { status: "SCHEDULED" }, _sum: { amount: true } }),
    prisma.payout.aggregate({ where: { status: "RELEASED" }, _sum: { amount: true } }),
    getI18n(),
  ]);
  const t = dict.dashAdmin.ops.payouts;
  const th = dict.dashAdmin.ops.table;
  const r = dict.dashAdmin.ops.reservation;
  const triggerLabel = (trigger: string) => (trigger === "CHECK_IN" ? r.afterCheckIn : r.afterCheckOut);

  function rowActions(p: (typeof payouts)[number]) {
    if (p.status !== "SCHEDULED") return null;
    const blocked = p.reservation.status === "DISPUTED";
    return (
      <AdminActions
        actions={[
          ...(blocked
            ? []
            : [{ label: t.release, icon: "Banknote", fn: releasePayout.bind(null, p.id), variant: "primary" as const, confirm: t.confirmRelease.replace("{amount}", formatPrice(p.amount)) }]),
          { label: t.block, fn: blockPayout.bind(null, p.id), variant: "ghost" as const },
        ]}
      />
    );
  }

  const ownerName = (p: (typeof payouts)[number]) => (
    <>
      {p.owner.firstName} {p.owner.lastName}
      {p.owner.payoutTier === "RELIABLE" && <BadgeCheck className="ml-1 inline h-3.5 w-3.5 text-brand-600" aria-label={t.reliable} />}
    </>
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t.title} description={t.subtitle} />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4">
        <KpiCard label={t.toRelease} value={formatPrice(scheduled._sum.amount ?? 0)} icon={Hourglass} tone="gold" href="/admin/payouts?status=SCHEDULED" />
        <KpiCard label={t.released} value={formatPrice(released._sum.amount ?? 0)} icon={Banknote} tone="brand" href="/admin/payouts?status=RELEASED" />
      </div>

      <FilterBar fields={[{ type: "select", name: "status", label: t.allStatuses, options: toFilterOptions(payoutStatusMeta) }]} />

      {payouts.length === 0 ? (
        <EmptyState icon={Banknote} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <>
          {/* Mobile */}
          <div className="space-y-2.5 md:hidden">
            {payouts.map((p) => (
              <div key={p.id} className={`${card} p-4`}>
                <div className="flex items-center justify-between gap-2">
                  <Link href={localePath(`/admin/reservations/${p.reservation.id}`, locale)} className="text-[13px] font-semibold text-terracotta">
                    {p.reservation.reference}
                  </Link>
                  <StatusBadge status={p.status} map={payoutStatusMeta} size="sm" />
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2 text-[12.5px] text-muted">
                  <span>
                    {ownerName(p)} · {triggerLabel(p.trigger)} ({p.percentage} %)
                  </span>
                  <span className="text-[14px] font-bold text-foreground">{formatPrice(p.amount)}</span>
                </div>
                <div className="mt-3">{rowActions(p)}</div>
              </div>
            ))}
          </div>
          {/* Desktop */}
          <div className={`${table.wrap} hidden md:block`}>
            <div className="overflow-x-auto">
              <table className={`${table.table} min-w-[720px]`}>
                <thead className={table.head}>
                  <tr>
                    <th className={table.th}>{th.booking}</th>
                    <th className={table.th}>{th.host}</th>
                    <th className={table.th}>{th.trigger}</th>
                    <th className={table.th}>{th.status}</th>
                    <th className={`${table.th} text-right`}>{th.amount}</th>
                    <th className={`${table.th} text-right`}>{th.action}</th>
                  </tr>
                </thead>
                <tbody className={table.body}>
                  {payouts.map((p) => (
                    <tr key={p.id} className={table.row}>
                      <td className={table.td}>
                        <Link href={localePath(`/admin/reservations/${p.reservation.id}`, locale)} className={table.link}>{p.reservation.reference}</Link>
                      </td>
                      <td className={`${table.td} text-foreground`}>{ownerName(p)}</td>
                      <td className={`${table.td} text-muted`}>{triggerLabel(p.trigger)} ({p.percentage} %)</td>
                      <td className={table.td}><StatusBadge status={p.status} map={payoutStatusMeta} size="sm" /></td>
                      <td className={`${table.td} text-right font-semibold text-foreground`}>{formatPrice(p.amount)}</td>
                      <td className={`${table.td} text-right`}>
                        <div className="flex justify-end">{rowActions(p)}</div>
                      </td>
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
