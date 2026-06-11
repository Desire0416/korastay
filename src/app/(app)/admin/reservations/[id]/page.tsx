import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CalendarDays, Users, Mail, User, Home } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminSetReservationStatus } from "@/server/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { ApproveReservationButtons } from "@/components/dashboard/approve-reservation-buttons";
import { StatusBadge } from "@/components/ui/status-badge";
import { reservationStatusMeta, paymentStatusMeta } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function AdminReservationDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      traveler: { select: { firstName: true, lastName: true, email: true } },
      residence: { select: { name: true, city: true, owner: { select: { firstName: true, lastName: true } } } },
      pack: { select: { name: true } },
      payments: { orderBy: { createdAt: "desc" } },
      refunds: true,
    },
  });
  if (!reservation) notFound();
  const payment = reservation.payments[0];

  const actions = [];
  if (reservation.status === "PENDING_PAYMENT") actions.push({ label: "Confirmer", fn: adminSetReservationStatus.bind(null, id, "CONFIRMED"), variant: "primary" as const });
  if (["CONFIRMED", "PENDING_PAYMENT"].includes(reservation.status)) actions.push({ label: "Annuler", fn: adminSetReservationStatus.bind(null, id, "CANCELLED"), variant: "danger" as const, confirm: "Annuler cette reservation ?" });
  if (reservation.status === "CONFIRMED") actions.push({ label: "Marquer terminee", fn: adminSetReservationStatus.bind(null, id, "COMPLETED"), variant: "outline" as const });
  if (reservation.status !== "DISPUTED") actions.push({ label: "Signaler un litige", fn: adminSetReservationStatus.bind(null, id, "DISPUTED"), variant: "outline" as const });

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/reservations" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Reservations
      </Link>
      <PageHeader title={reservation.reference} actions={<StatusBadge status={reservation.status} map={reservationStatusMeta} />} />

      {reservation.status === "PENDING_APPROVAL" && (
        <div className="mb-5 rounded-3xl border border-gold-200 bg-gold-50/60 p-5 shadow-soft">
          <p className="mb-1 font-bold text-gold-800">Demande en attente de validation</p>
          <p className="mb-4 text-sm text-gold-800/80">
            Validez pour autoriser le voyageur a payer l'acompte de <strong>{formatPrice(reservation.depositAmount)}</strong>, ou declinez la demande.
          </p>
          <ApproveReservationButtons reservationId={reservation.id} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <Card title="Sejour">
            <Line icon={Home} text={reservation.residence?.name ?? reservation.pack?.name ?? "-"} />
            <Line icon={CalendarDays} text={`${formatDate(reservation.startDate)} - ${formatDate(reservation.endDate)}`} />
            <Line icon={Users} text={`${reservation.adults + reservation.children} voyageur(s)`} />
          </Card>
          <Card title="Voyageur">
            <Line icon={User} text={`${reservation.traveler.firstName} ${reservation.traveler.lastName}`} />
            <Line icon={Mail} text={reservation.traveler.email} />
          </Card>
          <Card title="Paiement">
            <div className="space-y-2 text-sm">
              <Row label="Sous-total" value={formatPrice(reservation.subtotalAmount)} />
              <Row label="Frais de service" value={formatPrice(reservation.serviceFeeAmount)} />
              {reservation.cleaningFeeAmount > 0 && <Row label="Menage" value={formatPrice(reservation.cleaningFeeAmount)} />}
              <div className="flex justify-between border-t border-border pt-2 font-bold text-foreground"><span>Total</span><span>{formatPrice(reservation.totalAmount)}</span></div>
            </div>
            {payment && <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-soft px-3 py-2"><span className="text-sm text-muted">{payment.method}</span><StatusBadge status={payment.status} map={paymentStatusMeta} size="sm" /></div>}
            {reservation.refunds.map((rf) => (
              <div key={rf.id} className="mt-2 rounded-xl bg-sky-50 px-3 py-2 text-sm text-info">Remboursement {formatPrice(rf.amount)} - {rf.status}</div>
            ))}
          </Card>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <h3 className="mb-3 font-bold text-foreground">Actions</h3>
            <AdminActions actions={actions} size="sm" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft"><h3 className="mb-3 font-bold text-foreground">{title}</h3>{children}</div>;
}
function Line({ icon: Icon, text }: { icon: typeof Mail; text: string }) {
  return <p className="flex items-center gap-2 text-sm text-foreground"><Icon className="h-4 w-4 text-muted" /> {text}</p>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-muted"><span>{label}</span><span className="text-foreground">{value}</span></div>;
}
