import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { reservationStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatPrice, formatDateShort } from "@/lib/utils";
import { CalendarCheck } from "lucide-react";

export const metadata = { title: "Reservations - Admin" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const RESA_TYPE_LABELS: Record<string, string> = {
  RESIDENCE: "Residence",
  PACK: "Pack Decouverte",
  CUSTOM_PACK: "Pack sur mesure",
  BUSINESS: "Business",
};

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

  const reservations = await prisma.reservation.findMany({
    where,
    include: {
      traveler: { select: { firstName: true, lastName: true } },
      residence: { select: { name: true } },
      pack: { select: { name: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Reservations" description="Suivi de toutes les reservations." />

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: "Reference, voyageur, residence..." },
          { type: "select", name: "status", label: "Tous les statuts", options: toFilterOptions(reservationStatusMeta) },
          { type: "select", name: "type", label: "Tous les types", options: Object.entries(RESA_TYPE_LABELS).map(([value, label]) => ({ value, label })) },
        ]}
      />

      {reservations.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="Aucune reservation" description="Aucun resultat pour ces criteres." />
      ) : (
      <>
      {/* Mobile : liste de cartes */}
      <div className="space-y-2.5 md:hidden">
        {reservations.map((r) => (
          <Link key={r.id} href={`/admin/reservations/${r.id}`} className="block rounded-2xl border border-border bg-surface p-3.5 shadow-soft active:bg-surface-soft">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-semibold text-brand-600">{r.reference}</span>
              <StatusBadge status={r.status} map={reservationStatusMeta} size="sm" />
            </div>
            <p className="mt-1 truncate text-[14px] font-medium text-foreground">{r.residence?.name ?? r.pack?.name}</p>
            <div className="mt-1 flex items-center justify-between gap-2 text-[12px] text-muted">
              <span className="truncate">{r.traveler.firstName} {r.traveler.lastName} · {formatDateShort(r.startDate)}</span>
              <span className="shrink-0 font-bold text-foreground">{formatPrice(r.totalAmount)}</span>
            </div>
          </Link>
        ))}
      </div>
      {/* Desktop : tableau */}
      <div className="hidden overflow-hidden rounded-3xl border border-border bg-surface shadow-soft md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="border-b border-border bg-surface-soft/50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Reference</th>
                <th className="px-5 py-3 font-semibold">Objet</th>
                <th className="px-5 py-3 font-semibold">Voyageur</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 text-right font-semibold">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-surface-soft/40">
                  <td className="px-5 py-3"><Link href={`/admin/reservations/${r.id}`} className="font-semibold text-brand-600">{r.reference}</Link></td>
                  <td className="px-5 py-3 text-foreground">{r.residence?.name ?? r.pack?.name}</td>
                  <td className="px-5 py-3 text-muted">{r.traveler.firstName} {r.traveler.lastName}</td>
                  <td className="px-5 py-3 text-muted">{formatDateShort(r.startDate)}</td>
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
