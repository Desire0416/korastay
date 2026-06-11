import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Banknote } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { releasePayout, blockPayout } from "@/server/actions/payments-admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { payoutStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Reversements - Admin" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const TRIGGER_LABELS: Record<string, string> = { CHECK_IN: "Apres arrivee", CHECK_OUT: "Apres depart" };

export default async function AdminPayoutsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const status = str(sp.status);

  const where: Prisma.PayoutWhereInput = {};
  if (status) where.status = status;

  const [payouts, scheduled, released] = await Promise.all([
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
  ]);

  function rowActions(p: (typeof payouts)[number]) {
    if (p.status !== "SCHEDULED") return null;
    const blocked = p.reservation.status === "DISPUTED";
    return (
      <AdminActions
        actions={[
          ...(blocked ? [] : [{ label: "Liberer", icon: "Banknote", fn: releasePayout.bind(null, p.id), variant: "primary" as const, confirm: `Liberer ${formatPrice(p.amount)} ?` }]),
          { label: "Bloquer", fn: blockPayout.bind(null, p.id), variant: "ghost" as const },
        ]}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Reversements proprietaires" description="Versements echelonnes selon la fiabilite de l'hote (70/30 ou 100%)." />

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <p className="text-xs uppercase text-muted">A liberer</p>
          <p className="mt-1 text-xl font-extrabold text-gold-700">{formatPrice(scheduled._sum.amount ?? 0)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <p className="text-xs uppercase text-muted">Deja verse</p>
          <p className="mt-1 text-xl font-extrabold text-success">{formatPrice(released._sum.amount ?? 0)}</p>
        </div>
      </div>

      <FilterBar fields={[{ type: "select", name: "status", label: "Tous les statuts", options: toFilterOptions(payoutStatusMeta) }]} />

      {payouts.length === 0 ? (
        <EmptyState icon={Banknote} title="Aucun reversement" description="Les reversements apparaissent ici apres confirmation d'une reservation residence." />
      ) : (
        <>
          {/* Mobile */}
          <div className="space-y-2.5 md:hidden">
            {payouts.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-surface p-3.5 shadow-soft">
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/admin/reservations/${p.reservation.id}`} className="text-[13px] font-semibold text-brand-600">{p.reservation.reference}</Link>
                  <StatusBadge status={p.status} map={payoutStatusMeta} size="sm" />
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-[12px] text-muted">
                  <span>{p.owner.firstName} {p.owner.lastName} · {TRIGGER_LABELS[p.trigger]} ({p.percentage}%)</span>
                  <span className="text-[14px] font-bold text-foreground">{formatPrice(p.amount)}</span>
                </div>
                <div className="mt-2">{rowActions(p)}</div>
              </div>
            ))}
          </div>
          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-3xl border border-border bg-surface shadow-soft md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b border-border bg-surface-soft/50 text-left text-xs uppercase text-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Reservation</th>
                    <th className="px-5 py-3 font-semibold">Hote</th>
                    <th className="px-5 py-3 font-semibold">Declencheur</th>
                    <th className="px-5 py-3 font-semibold">Statut</th>
                    <th className="px-5 py-3 text-right font-semibold">Montant</th>
                    <th className="px-5 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-soft/40">
                      <td className="px-5 py-3"><Link href={`/admin/reservations/${p.reservation.id}`} className="font-semibold text-brand-600">{p.reservation.reference}</Link></td>
                      <td className="px-5 py-3 text-foreground">{p.owner.firstName} {p.owner.lastName}{p.owner.payoutTier === "RELIABLE" ? " ✓" : ""}</td>
                      <td className="px-5 py-3 text-muted">{TRIGGER_LABELS[p.trigger]} ({p.percentage}%)</td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} map={payoutStatusMeta} size="sm" /></td>
                      <td className="px-5 py-3 text-right font-semibold text-foreground">{formatPrice(p.amount)}</td>
                      <td className="px-5 py-3 text-right">{rowActions(p)}</td>
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
