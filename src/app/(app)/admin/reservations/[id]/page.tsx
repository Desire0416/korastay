import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CalendarDays, Users, Mail, User, Home, Banknote, ShieldQuestion } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminSetReservationStatus } from "@/server/actions/admin";
import { validatePendingPayment } from "@/server/actions/payments-admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { ApproveReservationButtons } from "@/components/dashboard/approve-reservation-buttons";
import { ManualPaymentForm } from "@/components/dashboard/manual-payment-form";
import { CautionControls } from "@/components/dashboard/caution-controls";
import { StatusBadge } from "@/components/ui/status-badge";
import { reservationStatusMeta, paymentStatusMeta, payoutStatusMeta, paymentMethodMeta } from "@/lib/enums";
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
      activity: { select: { name: true } },
      payments: { orderBy: { createdAt: "desc" } },
      payouts: { include: { owner: { select: { firstName: true, lastName: true } } }, orderBy: { trigger: "asc" } },
      refunds: true,
    },
  });
  if (!reservation) notFound();

  const pendingPayment = reservation.payments.find((p) => p.status === "PENDING");
  const canRecordPayment = ["PENDING_PAYMENT", "PARTIALLY_PAID"].includes(reservation.status);

  const actions = [];
  if (reservation.status === "CONFIRMED") actions.push({ label: "Marquer arrivee (check-in)", fn: adminSetReservationStatus.bind(null, id, "CHECKED_IN"), variant: "primary" as const });
  if (["CONFIRMED", "CHECKED_IN"].includes(reservation.status)) actions.push({ label: "Marquer terminee", fn: adminSetReservationStatus.bind(null, id, "COMPLETED"), variant: "outline" as const });
  if (["CONFIRMED", "PENDING_PAYMENT", "CHECKED_IN"].includes(reservation.status)) actions.push({ label: "Annuler", fn: adminSetReservationStatus.bind(null, id, "CANCELLED"), variant: "danger" as const, confirm: "Annuler cette reservation ?" });
  if (reservation.status !== "DISPUTED") actions.push({ label: "Signaler un litige", fn: adminSetReservationStatus.bind(null, id, "DISPUTED"), variant: "outline" as const, confirm: "Signaler un litige ? Les reversements seront bloques." });

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
            Validez pour autoriser le voyageur a payer l&apos;acompte de <strong>{formatPrice(reservation.depositAmount)}</strong>, ou declinez la demande.
          </p>
          <ApproveReservationButtons reservationId={reservation.id} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <Card title="Sejour">
            <Line icon={Home} text={reservation.residence?.name ?? reservation.pack?.name ?? reservation.activity?.name ?? "-"} />
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
              <Row label={`Acompte (${reservation.paymentPolicy === "FULL" ? "100%" : "50%"})`} value={formatPrice(reservation.depositAmount)} />
              <Row label="Deja paye" value={formatPrice(reservation.amountPaid)} />
              <Row label="Solde restant" value={formatPrice(reservation.balanceDueAmount)} />
            </div>
            {reservation.payments.length > 0 && (
              <div className="mt-3 space-y-2">
                {reservation.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl bg-surface-soft px-3 py-2 text-sm">
                    <span className="text-muted">{paymentMethodMeta[p.method]?.label ?? p.method} · {formatPrice(p.amount)}</span>
                    <StatusBadge status={p.status} map={paymentStatusMeta} size="sm" />
                  </div>
                ))}
              </div>
            )}
            {reservation.refunds.map((rf) => (
              <div key={rf.id} className="mt-2 rounded-xl bg-sky-50 px-3 py-2 text-sm text-info">Remboursement {formatPrice(rf.amount)} - {rf.status}</div>
            ))}
          </Card>

          {/* Validation d'un paiement declare (virement) */}
          {pendingPayment && (
            <div className="rounded-3xl border border-gold-200 bg-gold-50/60 p-5 shadow-soft">
              <p className="mb-1 flex items-center gap-2 font-bold text-gold-800"><ShieldQuestion className="h-5 w-5" /> Paiement a verifier</p>
              <p className="mb-3 text-sm text-gold-800/80">
                Un paiement de <strong>{formatPrice(pendingPayment.amount)}</strong> ({paymentMethodMeta[pendingPayment.method]?.label ?? pendingPayment.method}) est en attente de verification.
              </p>
              <AdminActions actions={[{ label: "Valider ce paiement", icon: "CreditCard", fn: validatePendingPayment.bind(null, pendingPayment.id), variant: "primary" }]} />
            </div>
          )}

          {/* Enregistrement manuel d'un paiement recu hors API */}
          {canRecordPayment && (
            <Card title="Valider un paiement recu (hors API)">
              <ManualPaymentForm reservationId={reservation.id} defaultAmount={reservation.depositAmount > 0 ? reservation.depositAmount : reservation.totalAmount} />
            </Card>
          )}

          {/* Caution */}
          {reservation.cautionAmount > 0 && (
            <Card title="Caution (depot de garantie)">
              <CautionControls reservationId={reservation.id} amount={reservation.cautionAmount} status={reservation.cautionStatus} />
            </Card>
          )}

          {/* Reversements hote */}
          {reservation.payouts.length > 0 && (
            <Card title="Reversements proprietaire">
              <div className="space-y-2 text-sm">
                {reservation.payouts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl bg-surface-soft px-3 py-2">
                    <span className="flex items-center gap-2 text-muted"><Banknote className="h-4 w-4" /> {p.trigger === "CHECK_IN" ? "Apres arrivee" : "Apres depart"} ({p.percentage}%)</span>
                    <span className="flex items-center gap-2"><span className="font-semibold text-foreground">{formatPrice(p.amount)}</span><StatusBadge status={p.status} map={payoutStatusMeta} size="sm" /></span>
                  </div>
                ))}
                <Link href="/admin/payouts" className="block pt-1 text-xs font-semibold text-brand-600 hover:underline">Gerer les reversements →</Link>
              </div>
            </Card>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <h3 className="mb-3 font-bold text-foreground">Actions</h3>
            {actions.length > 0 ? <AdminActions actions={actions} size="sm" /> : <p className="text-sm text-muted">Aucune action disponible.</p>}
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
