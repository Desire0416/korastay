import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CalendarDays, Users, Mail, Phone, Receipt } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { ContactButton } from "@/components/messaging/contact-button";
import { ApproveReservationButtons } from "@/components/dashboard/approve-reservation-buttons";
import { reservationStatusMeta, paymentStatusMeta } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function OwnerBookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const reservation = await prisma.reservation.findFirst({
    where: { id, residence: { ownerId: user.id } },
    include: { residence: { select: { name: true, city: true } }, payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!reservation) notFound();
  const payment = reservation.payments[0];

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/owner/bookings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Réservations
      </Link>
      <PageHeader
        title={reservation.reference}
        actions={<StatusBadge status={reservation.status} map={reservationStatusMeta} />}
      />

      {reservation.status === "PENDING_APPROVAL" && (
        <div className="mb-5 rounded-3xl border border-gold-200 bg-gold-50/60 p-5 shadow-soft">
          <p className="mb-1 font-bold text-gold-800">Demande a valider</p>
          <p className="mb-4 text-sm text-gold-800/80">
            Le voyageur attend votre validation. Il reglera ensuite un acompte de <strong>{formatPrice(reservation.depositAmount)}</strong>.
            Sans réponse a temps, la demande est annulée automatiquement.
          </p>
          <ApproveReservationButtons reservationId={reservation.id} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card title="Séjour">
          <Line icon={CalendarDays} text={`${formatDate(reservation.startDate)} - ${formatDate(reservation.endDate)}`} />
          <Line icon={Users} text={`${reservation.adults + reservation.children} voyageur(s) - ${reservation.nights} nuit(s)`} />
          <p className="mt-2 text-sm text-muted">{reservation.residence?.name} - {reservation.residence?.city}</p>
        </Card>
        <Card title="Voyageur">
          <p className="font-semibold text-foreground">{reservation.guestName}</p>
          <Line icon={Mail} text={reservation.guestEmail} />
          {reservation.guestPhone && <Line icon={Phone} text={reservation.guestPhone} />}
          <div className="mt-3">
            <ContactButton
              otherUserId={reservation.travelerId}
              reservationId={reservation.id}
              subject={`Réservation ${reservation.reference}`}
              basePath="/owner/messages"
              label="Contacter le voyageur"
              variant="primary"
              className="w-full"
            />
          </div>
        </Card>
        <Card title="Paiement" className="sm:col-span-2">
          <div className="space-y-2 text-sm">
            <Row label="Sous-total (votre part)" value={formatPrice(reservation.subtotalAmount)} />
            {reservation.cleaningFeeAmount > 0 && <Row label="Frais de ménage" value={formatPrice(reservation.cleaningFeeAmount)} />}
            <Row label="Frais de service KoraStay" value={formatPrice(reservation.serviceFeeAmount)} />
            <div className="flex justify-between border-t border-border pt-2 font-bold text-foreground">
              <span>Total payé par le voyageur</span><span>{formatPrice(reservation.totalAmount)}</span>
            </div>
          </div>
          {payment && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-soft px-3 py-2">
              <span className="text-sm text-muted">Statut paiement</span>
              <StatusBadge status={payment.status} map={paymentStatusMeta} size="sm" />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-border bg-surface p-5 shadow-soft ${className ?? ""}`}>
      <h3 className="mb-3 flex items-center gap-2 font-bold text-foreground"><Receipt className="h-4 w-4 text-brand-600" /> {title}</h3>
      {children}
    </div>
  );
}
function Line({ icon: Icon, text }: { icon: typeof Mail; text: string }) {
  return <p className="flex items-center gap-2 text-sm text-foreground"><Icon className="h-4 w-4 text-muted" /> {text}</p>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-muted"><span>{label}</span><span className="text-foreground">{value}</span></div>;
}
