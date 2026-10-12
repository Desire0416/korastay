import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CalendarDays, Users, Mail, Phone, Receipt, UserRound, Home, Clock, type LucideIcon } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { ContactButton } from "@/components/messaging/contact-button";
import { ApproveReservationButtons } from "@/components/dashboard/approve-reservation-buttons";
import { card, cardTitle } from "@/components/dashboard/styles";
import { reservationStatusMeta, paymentStatusMeta } from "@/lib/enums";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashOwner.bookings.metaTitle };
}

export default async function OwnerBookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const [reservation, { locale, dict }] = await Promise.all([
    prisma.reservation.findFirst({
      where: { id, residence: { ownerId: user.id } },
      include: { residence: { select: { name: true, city: true } }, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    getI18n(),
  ]);
  if (!reservation) notFound();
  const t = dict.dashOwner.booking;
  const payment = reservation.payments[0];
  const guests = reservation.adults + reservation.children;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={localePath("/owner/bookings", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader
        eyebrow={reservation.residence?.name}
        title={reservation.reference}
        actions={<StatusBadge status={reservation.status} map={reservationStatusMeta} />}
      />

      {reservation.status === "PENDING_APPROVAL" && (
        <div className="mb-6 rounded-[1.5rem] bg-gold-50 p-5 shadow-soft ring-1 ring-inset ring-gold-200/70 sm:p-6">
          <p className="mb-1.5 flex items-center gap-2 font-display text-xl text-gold-900">
            <Clock className="h-5 w-5" /> {t.toApproveTitle}
          </p>
          <p className="mb-4 text-sm leading-relaxed text-gold-900/80">
            {t.toApproveText.replace("{amount}", formatPrice(reservation.depositAmount))}
          </p>
          <ApproveReservationButtons reservationId={reservation.id} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Section icon={Home} title={t.stay}>
          <Line icon={CalendarDays} text={`${formatDate(reservation.startDate, locale)} – ${formatDate(reservation.endDate, locale)}`} />
          <Line
            icon={Users}
            text={`${t.persons.replace("{n}", String(guests))} · ${dict.dash.common.nights.replace("{n}", String(reservation.nights))}`}
          />
          <p className="mt-3 text-sm text-muted">
            {reservation.residence?.name}
            {reservation.residence?.city ? ` · ${reservation.residence.city}` : ""}
          </p>
        </Section>

        <Section icon={UserRound} title={t.traveler}>
          <p className="font-semibold text-foreground">{reservation.guestName}</p>
          <div className="mt-1.5 space-y-1.5">
            <Line icon={Mail} text={reservation.guestEmail} />
            {reservation.guestPhone && <Line icon={Phone} text={reservation.guestPhone} />}
          </div>
          <div className="mt-4">
            <ContactButton
              otherUserId={reservation.travelerId}
              reservationId={reservation.id}
              subject={t.subject.replace("{ref}", reservation.reference)}
              basePath="/owner/messages"
              label={t.contact}
              variant="primary"
              className="w-full"
            />
          </div>
        </Section>

        <Section icon={Receipt} title={t.payment} className="sm:col-span-2">
          <div className="space-y-2.5 text-sm">
            <Row label={t.subtotal} value={formatPrice(reservation.subtotalAmount)} />
            {reservation.cleaningFeeAmount > 0 && <Row label={t.cleaningFee} value={formatPrice(reservation.cleaningFeeAmount)} />}
            <Row label={t.serviceFee} value={formatPrice(reservation.serviceFeeAmount)} />
            <div className="flex items-baseline justify-between border-t border-border pt-3 font-bold text-foreground">
              <span>{t.totalPaid}</span>
              <span className="font-display text-2xl font-normal">{formatPrice(reservation.totalAmount)}</span>
            </div>
          </div>
          {payment && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-sand-50 px-3.5 py-2.5 ring-1 ring-inset ring-sand-200">
              <span className="text-sm text-muted">{t.paymentStatus}</span>
              <StatusBadge status={payment.status} map={paymentStatusMeta} size="sm" />
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children, className }: { icon: LucideIcon; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn(card, "p-5 sm:p-6", className)}>
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
