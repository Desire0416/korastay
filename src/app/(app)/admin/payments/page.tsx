import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { AlertCircle, CreditCard } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMockPayments } from "@/lib/payments";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { table, mobileItem } from "@/components/dashboard/styles";
import { paymentStatusMeta, paymentMethodMeta, toFilterOptions } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.ops.payments.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const METHODS = ["WAVE", "ORANGE_MONEY", "MTN_MOMO", "MOOV_MONEY", "CARD", "BANK_TRANSFER", "CASH", "MANUAL", "MOCK"];

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

  const [payments, { locale, dict }] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: { reservation: { select: { reference: true, id: true, guestName: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    getI18n(),
  ]);
  const t = dict.dashAdmin.ops.payments;
  const th = dict.dashAdmin.ops.table;
  const methodLabel = (m: string) => dict.enums.paymentMethod[m]?.label ?? paymentMethodMeta[m]?.label ?? m;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t.title} description={t.subtitle} />

      {isMockPayments() && (
        <div className="mb-5 flex items-center gap-2.5 rounded-[1.25rem] bg-gold-50 px-4 py-3 text-sm text-gold-900 ring-1 ring-inset ring-gold-200/70">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            <strong>{t.mockTitle}</strong> {t.mockText}
          </span>
        </div>
      )}

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: t.searchPlaceholder },
          { type: "select", name: "status", label: t.allStatuses, options: toFilterOptions(paymentStatusMeta) },
          { type: "select", name: "method", label: t.allMethods, options: METHODS.map((value) => ({ value, label: methodLabel(value) })) },
        ]}
      />

      {payments.length === 0 ? (
        <EmptyState icon={CreditCard} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <>
          {/* Mobile : liste de cartes */}
          <div className="space-y-2.5 md:hidden">
            {payments.map((p) => (
              <Link key={p.id} href={localePath(`/admin/reservations/${p.reservation.id}`, locale)} className={mobileItem}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-terracotta">{p.reservation.reference}</span>
                  <StatusBadge status={p.status} map={paymentStatusMeta} size="sm" />
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2 text-[12.5px] text-muted">
                  <span className="truncate">{methodLabel(p.method)} · {formatDate(p.createdAt, locale)}</span>
                  <span className="shrink-0 text-[14px] font-bold text-foreground">{formatPrice(p.amount)}</span>
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
                    <th className={table.th}>{th.booking}</th>
                    <th className={table.th}>{th.method}</th>
                    <th className={table.th}>{th.date}</th>
                    <th className={table.th}>{th.status}</th>
                    <th className={`${table.th} text-right`}>{th.amount}</th>
                  </tr>
                </thead>
                <tbody className={table.body}>
                  {payments.map((p) => (
                    <tr key={p.id} className={table.row}>
                      <td className={table.td}>
                        <Link href={localePath(`/admin/reservations/${p.reservation.id}`, locale)} className={table.link}>{p.reservation.reference}</Link>
                      </td>
                      <td className={`${table.td} text-foreground`}>{methodLabel(p.method)}</td>
                      <td className={`${table.td} text-muted`}>{formatDate(p.createdAt, locale)}</td>
                      <td className={table.td}><StatusBadge status={p.status} map={paymentStatusMeta} size="sm" /></td>
                      <td className={`${table.td} text-right font-semibold text-foreground`}>{formatPrice(p.amount)}</td>
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
