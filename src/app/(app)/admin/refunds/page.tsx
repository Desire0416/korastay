import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processRefund } from "@/server/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { RotateCcw } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Remboursements - Admin" };

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

  const refunds = await prisma.refund.findMany({
    where,
    include: { reservation: { select: { reference: true, id: true, guestName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Remboursements" description="Traitez les demandes de remboursement." />

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: "Référence, client, motif..." },
          { type: "select", name: "status", label: "Tous les statuts", options: [{ value: "PENDING", label: "En attente" }, { value: "PAID", label: "Traite" }] },
        ]}
      />

      {refunds.length === 0 ? (
        <EmptyState icon={RotateCcw} title="Aucun remboursement" description="Les demandes de remboursement apparaitront ici." />
      ) : (
        <div className="space-y-3">
          {refunds.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-surface p-5 shadow-soft">
              <div>
                <Link href={`/admin/reservations/${r.reservation.id}`} className="font-bold text-brand-600">{r.reservation.reference}</Link>
                <p className="text-sm text-muted">{r.reservation.guestName} - {r.reason} - {formatDate(r.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-foreground">{formatPrice(r.amount)}</span>
                <Badge tone={r.status === "PAID" ? "success" : "warning"}>{r.status === "PAID" ? "Traite" : "En attente"}</Badge>
                {r.status !== "PAID" && (
                  <AdminActions actions={[{ label: "Traiter", fn: processRefund.bind(null, r.id), variant: "primary", confirm: "Confirmer le traitement du remboursement ?" }]} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
