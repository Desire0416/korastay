"use client";

import Link from "next/link";
import { CalendarDays, Users, MapPin, ArrowUpRight, Package } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { StatusBadge } from "@/components/ui/status-badge";
import { reservationStatusMeta } from "@/lib/enums";
import { formatPrice, formatDateRange } from "@/lib/utils";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";

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

// Carte reservation (espace voyageur) v2 : vignette en arche, statut, prix serif.
export function ReservationCard({ reservation }: { reservation: ReservationCardData }) {
  const dict = useI18n();
  const t = dict.dashAccount;
  const isPack = reservation.type === "PACK";
  const title = reservation.residence?.name ?? reservation.pack?.name ?? t.card.booking;
  const location = reservation.residence?.city ?? reservation.pack?.destination?.name ?? "";
  const image = reservation.residence?.images[0]?.url ?? reservation.pack?.images[0]?.url;
  const seed = reservation.residence?.slug ?? reservation.pack?.slug ?? reservation.id;
  const guests = reservation.adults + reservation.children;

  return (
    <Link
      href={localePath(`/account/bookings/${reservation.id}`, dict.locale)}
      className="group flex gap-4 rounded-[1.5rem] border border-border/80 bg-surface p-3 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card sm:p-4"
    >
      <div className="h-28 w-24 shrink-0 overflow-hidden rounded-arch-sm sm:h-32 sm:w-28">
        <SmartImage src={image} alt={title} seed={`${seed}-0`} sizes="112px" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="eyebrow flex items-center gap-1.5 text-[9.5px] text-terracotta">
              {isPack ? <Package className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
              {isPack ? t.card.pack : location}
            </p>
            <h3 className="mt-1 line-clamp-1 font-display text-lg leading-snug text-foreground">{title}</h3>
          </div>
          <StatusBadge status={reservation.status} map={reservationStatusMeta} size="sm" />
        </div>

        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDateRange(reservation.startDate, reservation.endDate, dict.locale)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {dict.dash.common.guests.replace("{n}", String(guests))}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="text-sm">
            <span className="font-bold text-foreground">{formatPrice(reservation.totalAmount)}</span>
            <span className="ml-1.5 text-xs text-muted">· {reservation.reference}</span>
          </p>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 text-ink transition-all group-hover:border-brand-500 group-hover:bg-brand-500 group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
