import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMockPayments } from "@/lib/payments";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { paymentStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";
import { AlertCircle, CreditCard } from "lucide-react";

export const metadata = { title: "Paiements - Admin" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const METHOD_LABELS: Record<string, string> = {
  ORANGE_MONEY: "Orange Money", WAVE: "Wave", MTN_MOMO: "MTN MoMo", CARD: "Carte bancaire",
  BANK_TRANSFER: "Virement", CASH: "Especes", MANUAL: "Manuel", MOCK: "Demo",
};

export default async function AdminPaymentsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const method = str(sp.method);
  const q = str(sp.q)?.trim();

  const where: Prisma.PaymentWhereInput = {};
  if (status) where.status = status;
  if (method) where.method = method;
  if (q) {
    where.reservation = { is: { OR: [{ reference: { contains: q, mode: "insensitive" } }, { guestName: { contains: q, mode: "insensitive" } }] } };
  }

  const payments = await prisma.payment.findMany({
    where,
    include: { reservation: { select: { reference: true, id: true, guestName: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Paiements" description="Transactions de la plateforme." />

      {isMockPayments() && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-700">
          <AlertCircle className="h-4 w-4" />
          <span><strong>Mode demonstration :</strong> les paiements sont simules (provider mock). Aucune transaction reelle.</span>
        </div>
      )}

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: "Reference, client..." },
          { type: "select", name: "status", label: "Tous les statuts", options: toFilterOptions(paymentStatusMeta) },
          { type: "select", name: "method", label: "Tous les moyens", options: Object.entries(METHOD_LABELS).map(([value, label]) => ({ value, label })) },
        ]}
      />

      {payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="Aucun paiement" description="Aucun resultat pour ces criteres." />
      ) : (
      <>
      {/* Mobile : liste de cartes */}
      <div className="space-y-2.5 md:hidden">
        {payments.map((p) => (
          <Link key={p.id} href={`/admin/reservations/${p.reservation.id}`} className="block rounded-2xl border border-border bg-surface p-3.5 shadow-soft active:bg-surface-soft">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-semibold text-brand-600">{p.reservation.reference}</span>
              <StatusBadge status={p.status} map={paymentStatusMeta} size="sm" />
            </div>
            <div className="mt-1 flex items-center justify-between gap-2 text-[12px] text-muted">
              <span className="truncate">{METHOD_LABELS[p.method] ?? p.method} · {formatDate(p.createdAt)}</span>
              <span className="shrink-0 text-[14px] font-bold text-foreground">{formatPrice(p.amount)}</span>
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
                <th className="px-5 py-3 font-semibold">Reservation</th>
                <th className="px-5 py-3 font-semibold">Methode</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 text-right font-semibold">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-surface-soft/40">
                  <td className="px-5 py-3"><Link href={`/admin/reservations/${p.reservation.id}`} className="font-semibold text-brand-600">{p.reservation.reference}</Link></td>
                  <td className="px-5 py-3 text-foreground">{p.method}</td>
                  <td className="px-5 py-3 text-muted">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} map={paymentStatusMeta} size="sm" /></td>
                  <td className="px-5 py-3 text-right font-semibold text-foreground">{formatPrice(p.amount)}</td>
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
