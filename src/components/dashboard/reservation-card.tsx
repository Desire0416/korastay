import Link from "next/link";
import { CalendarDays, Users, MapPin, ArrowRight, Package } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { StatusBadge } from "@/components/ui/status-badge";
import { reservationStatusMeta } from "@/lib/enums";
import { formatPrice, formatDateRange } from "@/lib/utils";

interface ReservationCardData {
  id: string;
  reference: string;
  type: string;
  status: string;
  startDate: Date;
  endDate: Date;
  adults: number;
  children: number;
  totalAmount: number;
  residence?: { name: string; city: string; slug: string; images: { url: string }[] } | null;
  pack?: { name: string; slug: string; destination?: { name: string } | null; images: { url: string }[] } | null;
}

export function ReservationCard({ reservation }: { reservation: ReservationCardData }) {
  const isPack = reservation.type === "PACK";
  const title = reservation.residence?.name ?? reservation.pack?.name ?? "Reservation";
  const location = reservation.residence?.city ?? reservation.pack?.destination?.name ?? "";
  const image = reservation.residence?.images[0]?.url ?? reservation.pack?.images[0]?.url;
  const seed = reservation.residence?.slug ?? reservation.pack?.slug ?? reservation.id;

  return (
    <Link
      href={`/account/bookings/${reservation.id}`}
      className="group flex gap-4 rounded-3xl border border-border bg-surface p-3 shadow-soft transition-shadow hover:shadow-card sm:p-4"
    >
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-32">
        <SmartImage src={image} alt={title} seed={`${seed}-0`} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs text-muted">
              {isPack ? <Package className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
              {isPack ? "Pack Decouverte" : location}
            </p>
            <h3 className="line-clamp-1 font-bold text-foreground">{title}</h3>
          </div>
          <StatusBadge status={reservation.status} map={reservationStatusMeta} size="sm" />
        </div>

        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDateRange(reservation.startDate, reservation.endDate)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {reservation.adults + reservation.children} voyageur{reservation.adults + reservation.children > 1 ? "s" : ""}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="text-sm">
            <span className="font-extrabold text-foreground">{formatPrice(reservation.totalAmount)}</span>
            <span className="ml-1 text-xs text-muted">- {reservation.reference}</span>
          </p>
          <ArrowRight className="h-4 w-4 text-brand-500 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
