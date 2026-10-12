import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, CalendarDays, Users, Mail, User, Home, Banknote, ShieldQuestion, Receipt, UserRound, ShieldCheck, CheckCircle2,
  Clock, Settings2, type LucideIcon,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminSetReservationStatus } from "@/server/actions/admin";
import { validatePendingPayment } from "@/server/actions/payments-admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminActions, type AdminAction } from "@/components/dashboard/admin-actions";
import { ApproveReservationButtons } from "@/components/dashboard/approve-reservation-buttons";
import { ManualPaymentForm } from "@/components/dashboard/manual-payment-form";
import { CautionControls } from "@/components/dashboard/caution-controls";
import { StatusBadge } from "@/components/ui/status-badge";
import { card, cardTitle } from "@/components/dashboard/styles";
import { reservationStatusMeta, paymentStatusMeta, payoutStatusMeta, paymentMethodMeta } from "@/lib/enums";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.ops.reservations.metaTitle };
}

export default async function AdminReservationDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const { id } = await params;
  const [reservation, { locale, dict }] = await Promise.all([
    prisma.reservation.findUnique({
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
    }),
    getI18n(),
  ]);
  if (!reservation) notFound();
  const t = dict.dashAdmin.ops.reservation;
  const methodLabel = (m: string) => dict.enums.paymentMethod[m]?.label ?? paymentMethodMeta[m]?.label ?? m;

  const pendingPayment = reservation.payments.find((p) => p.status === "PENDING");
  let pendingProofUrl: string | null = null;
  if (pendingPayment?.metadata) {
    try {
      pendingProofUrl = JSON.parse(pendingPayment.metadata)?.proofUrl ?? null;
    } catch {
      /* metadata libre */
    }
  }
  const canRecordPayment = ["PENDING_PAYMENT", "PARTIALLY_PAID"].includes(reservation.status);

  const actions: AdminAction[] = [];
  if (reservation.status === "CONFIRMED") actions.push({ label: t.checkIn, fn: adminSetReservationStatus.bind(null, id, "CHECKED_IN"), variant: "primary" });
  if (["CONFIRMED", "CHECKED_IN"].includes(reservation.status)) actions.push({ label: t.complete, fn: adminSetReservationStatus.bind(null, id, "COMPLETED"), variant: "outline" });
  if (["CONFIRMED", "PENDING_PAYMENT", "CHECKED_IN"].includes(reservation.status)) actions.push({ label: t.cancel, fn: adminSetReservationStatus.bind(null, id, "CANCELLED"), variant: "danger", confirm: t.confirmCancel });
  if (reservation.status !== "DISPUTED") actions.push({ label: t.dispute, fn: adminSetReservationStatus.bind(null, id, "DISPUTED"), variant: "outline", confirm: t.confirmDispute });

  const [toVerifyBefore, toVerifyAfter] = t.toVerifyText.split("{amount}");

  return (
    <div className="mx-auto max-w-5xl">
      <Link href={localePath("/admin/reservations", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader
        eyebrow={reservation.residence?.name ?? reservation.pack?.name ?? reservation.activity?.name ?? undefined}
        title={reservation.reference}
        actions={<StatusBadge status={reservation.status} map={reservationStatusMeta} />}
      />

      {reservation.status === "PENDING_APPROVAL" && (
        <div className="mb-6 rounded-[1.5rem] bg-gold-50 p-5 shadow-soft ring-1 ring-inset ring-gold-200/70 sm:p-6">
          <p className="mb-1.5 flex items-center gap-2 font-display text-xl text-gold-900">
            <Clock className="h-5 w-5" /> {t.pendingTitle}
          </p>
          <p className="mb-4 text-sm leading-relaxed text-gold-900/80">{t.pendingText.replace("{amount}", formatPrice(reservation.depositAmount))}</p>
          <ApproveReservationButtons reservationId={reservation.id} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Section icon={Home} title={t.stay}>
              <div className="space-y-2">
                <Line icon={Home} text={reservation.residence?.name ?? reservation.pack?.name ?? reservation.activity?.name ?? "-"} />
                <Line icon={CalendarDays} text={`${formatDate(reservation.startDate, locale)} – ${formatDate(reservation.endDate, locale)}`} />
                <Line icon={Users} text={t.persons.replace("{n}", String(reservation.adults + reservation.children))} />
              </div>
            </Section>
            <Section icon={UserRound} title={t.traveler}>
              <div className="space-y-2">
                <Line icon={User} text={`${reservation.traveler.firstName} ${reservation.traveler.lastName}`} />
                <Line icon={Mail} text={reservation.traveler.email} />
              </div>
            </Section>
          </div>

          <Section icon={Receipt} title={t.payment}>
            <div className="space-y-2.5 text-sm">
              <Row label={t.subtotal} value={formatPrice(reservation.subtotalAmount)} />
              <Row label={t.serviceFee} value={formatPrice(reservation.serviceFeeAmount)} />
              {reservation.cleaningFeeAmount > 0 && <Row label={t.cleaning} value={formatPrice(reservation.cleaningFeeAmount)} />}
              <div className="flex items-baseline justify-between border-t border-border pt-3 font-bold text-foreground">
                <span>{t.total}</span>
                <span className="font-display text-2xl font-normal">{formatPrice(reservation.totalAmount)}</span>
              </div>
              <Row label={t.deposit.replace("{pct}", t.percent.replace("{n}", reservation.paymentPolicy === "FULL" ? "100" : "50"))} value={formatPrice(reservation.depositAmount)} />
              <Row label={t.alreadyPaid} value={formatPrice(reservation.amountPaid)} />
              <Row label={t.balance} value={formatPrice(reservation.balanceDueAmount)} />
            </div>
            {reservation.payments.length > 0 && (
              <div className="mt-4 space-y-2">
                {reservation.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-sand-50 px-3.5 py-2.5 text-sm ring-1 ring-inset ring-sand-200">
                    <span className="text-muted">
                      {methodLabel(p.method)} · <span className="font-semibold text-foreground">{formatPrice(p.amount)}</span>
                    </span>
                    <StatusBadge status={p.status} map={paymentStatusMeta} size="sm" />
                  </div>
                ))}
              </div>
            )}
            {reservation.refunds.map((rf) => (
              <div key={rf.id} className="mt-2 rounded-xl bg-ink/[0.04] px-3.5 py-2.5 text-sm text-ink ring-1 ring-inset ring-ink/10">
                {t.refund.replace("{amount}", formatPrice(rf.amount)).replace("{status}", rf.status === "PAID" ? dict.dashAdmin.ops.refunds.processed : dict.dashAdmin.ops.refunds.pending)}
              </div>
            ))}
          </Section>

          {/* Validation d'un paiement declare (virement, Mobile Money) */}
          {pendingPayment && (
            <div className="rounded-[1.5rem] bg-gold-50 p-5 shadow-soft ring-1 ring-inset ring-gold-200/70 sm:p-6">
              <p className="mb-1.5 flex items-center gap-2 font-display text-xl text-gold-900">
                <ShieldQuestion className="h-5 w-5" /> {t.toVerifyTitle}
              </p>
              <p className="mb-2 text-sm leading-relaxed text-gold-900/80">
                {toVerifyBefore}
                <strong>{formatPrice(pendingPayment.amount)}</strong>
                {toVerifyAfter.replace("{method}", methodLabel(pendingPayment.method))}
                {pendingPayment.providerReference && <> {t.declaredRef.replace("{ref}", pendingPayment.providerReference)}</>}
              </p>
              {pendingProofUrl && (
                <a href={pendingProofUrl} target="_blank" rel="noopener noreferrer" className="mb-3 inline-block text-sm font-semibold text-terracotta underline underline-offset-4">
                  {t.viewProof}
                </a>
              )}
              <p className="mb-4 text-xs text-gold-900/70">{t.verifyHint}</p>
              <AdminActions actions={[{ label: t.validatePayment, icon: "CreditCard", fn: validatePendingPayment.bind(null, pendingPayment.id), variant: "primary" }]} />
            </div>
          )}

          {/* Enregistrement manuel d'un paiement recu hors API */}
          {canRecordPayment && (
            <Section icon={CheckCircle2} title={t.recordTitle}>
              <ManualPaymentForm
                reservationId={reservation.id}
                defaultAmount={reservation.depositAmount > 0 ? reservation.depositAmount : reservation.totalAmount}
              />
            </Section>
          )}

          {/* Caution */}
          {reservation.cautionAmount > 0 && (
            <Section icon={ShieldCheck} title={t.cautionTitle}>
              <CautionControls reservationId={reservation.id} amount={reservation.cautionAmount} status={reservation.cautionStatus} />
            </Section>
          )}

          {/* Reversements hote */}
          {reservation.payouts.length > 0 && (
            <Section icon={Banknote} title={t.payoutsTitle}>
              <div className="space-y-2 text-sm">
                {reservation.payouts.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sand-50 px-3.5 py-2.5 ring-1 ring-inset ring-sand-200">
                    <span className="text-muted">
                      {p.trigger === "CHECK_IN" ? t.afterCheckIn : t.afterCheckOut} ({t.percent.replace("{n}", String(p.percentage))})
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{formatPrice(p.amount)}</span>
                      <StatusBadge status={p.status} map={payoutStatusMeta} size="sm" />
                    </span>
                  </div>
                ))}
                <Link href={localePath("/admin/payouts", locale)} className="block pt-1 text-xs font-semibold text-terracotta hover:underline">
                  {t.managePayouts}
                </Link>
              </div>
            </Section>
          )}
        </div>

        <aside>
          <div className={cn(card, "p-5 lg:sticky lg:top-24")}>
            <h2 className={cn(cardTitle, "mb-4")}>
              <Settings2 className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.actions}
            </h2>
            {actions.length > 0 ? <AdminActions actions={actions} size="sm" /> : <p className="text-sm text-muted">{t.noActions}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <section className={cn(card, "p-5 sm:p-6")}>
      <h2 className={cn(cardTitle, "mb-4")}>
        <Icon className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {title}
      </h2>
      {children}
    </section>
  );
}
function Line({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <p className="flex items-center gap-2 text-sm text-foreground">
      <Icon className="h-4 w-4 shrink-0 text-muted" /> <span className="min-w-0 break-words">{text}</span>
    </p>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-muted">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
