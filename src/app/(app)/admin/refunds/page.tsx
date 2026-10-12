import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { RotateCcw } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processRefund } from "@/server/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { card } from "@/components/dashboard/styles";
import { formatPrice, formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.ops.refunds.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminRefundsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const q = str(sp.q)?.trim();

  const where: Prisma.RefundWhereInput = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { reason: { contains: q, mode: "insensitive" } },
      { reservation: { is: { OR: [{ reference: { contains: q, mode: "insensitive" } }, { guestName: { contains: q, mode: "insensitive" } }] } } },
    ];
  }

  const [refunds, { locale, dict }] = await Promise.all([
    prisma.refund.findMany({
      where,
      include: { reservation: { select: { reference: true, id: true, guestName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getI18n(),
  ]);
  const t = dict.dashAdmin.ops.refunds;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t.title} description={t.subtitle} />

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: t.searchPlaceholder },
          { type: "select", name: "status", label: t.allStatuses, options: [{ value: "PENDING", label: t.pending }, { value: "PAID", label: t.processed }] },
        ]}
      />

      {refunds.length === 0 ? (
        <EmptyState icon={RotateCcw} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <div className="space-y-3">
          {refunds.map((r) => (
            <div key={r.id} className={`${card} flex flex-wrap items-center justify-between gap-4 p-5`}>
              <div className="min-w-0">
                <Link href={localePath(`/admin/reservations/${r.reservation.id}`, locale)} className="font-semibold text-terracotta hover:underline">
                  {r.reservation.reference}
                </Link>
                <p className="mt-0.5 text-sm text-muted">
                  {[r.reservation.guestName, r.reason, formatDate(r.createdAt, locale)].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-xl text-foreground">{formatPrice(r.amount)}</span>
                <Badge tone={r.status === "PAID" ? "success" : "warning"}>{r.status === "PAID" ? t.processed : t.pending}</Badge>
                {r.status !== "PAID" && (
                  <AdminActions actions={[{ label: t.process, fn: processRefund.bind(null, r.id), variant: "primary", confirm: t.confirmProcess }]} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
