"use client";

import Link from "next/link";
import { Clock, Users, MapPin, ArrowUpRight } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { FavoriteButton } from "./favorite-button";
import { formatPrice, cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";

interface PackCardProps {
  pack: {
    id: string;
    slug: string;
    name: string;
    subtitle?: string | null;
    price: number;
    durationDays: number;
    durationNights: number;
    basePersons: number;
    destination?: { name: string } | null;
    images: { url: string; altText?: string | null }[];
  };
  favorited?: boolean;
  /** "dark" : carte posee sur une section sombre (contour clair). */
  tone?: "default" | "dark";
}

// Carte pack v2 : grande photo verticale, infos superposees sur degrade
// indigo, duree en pastille, prix et fleche en pied.
export function PackCard({ pack, favorited, tone = "default" }: PackCardProps) {
  const dict = useI18n();
  return (
    <Link
      href={localePath(`/packs/${pack.slug}`, dict.locale)}
      className={cn(
        "group relative block overflow-hidden rounded-[1.75rem] transition-shadow duration-300",
        tone === "dark" ? "ring-1 ring-white/10 hover:ring-gold-300/40" : "shadow-soft hover:shadow-card-hover"
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <SmartImage
          src={pack.images[0]?.url}
          alt={pack.images[0]?.altText ?? pack.name}
          seed={`pack-${pack.slug}`}
          sizes="(max-width: 768px) 90vw, 33vw"
          imgClassName="transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/25 to-transparent" />
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton packId={pack.id} initialFavorited={favorited} />
        </div>
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-ink shadow-soft">
          <Clock className="h-3.5 w-3.5 text-terracotta" />
          {pack.durationDays}
          {dict.card.dayShort} / {pack.durationNights}
          {dict.card.nightShort}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          {pack.destination && (
            <p className="eyebrow flex items-center gap-1.5 text-[10.5px] text-gold-300">
              <MapPin className="h-3 w-3" /> {pack.destination.name}
            </p>
          )}
          <h3 className="mt-2 font-display text-[1.6rem] leading-[1.1]">{pack.name}</h3>
          <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/15 pt-4">
            <div>
              <p className="flex items-center gap-1.5 text-xs text-white/70">
                <Users className="h-3.5 w-3.5" />
                {dict.card.fromPeople.replace("{n}", String(pack.basePersons))}
              </p>
              <p className="mt-0.5 text-lg font-bold">{formatPrice(pack.price)}</p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-all duration-300 group-hover:bg-gold-400 group-hover:text-ink">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
