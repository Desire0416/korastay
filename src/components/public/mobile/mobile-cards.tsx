"use client";

import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { FavoriteButton } from "../favorite-button";
import { formatPrice } from "@/lib/utils";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";
import { enumLabel } from "@/lib/dictionaries/enums";
import type { ResidenceCardData } from "@/lib/queries";

// ============================================================
// Cartes compactes "app mobile" v2. Utilisees dans les vues mobiles
// (md:hidden) ; le desktop utilise ResidenceCard / PackCard.
// ============================================================

export function MobileResidenceCard({
  residence,
  favorited,
  priority,
}: {
  residence: ResidenceCardData;
  favorited?: boolean;
  priority?: boolean;
}) {
  const dict = useI18n();
  const quality = enumLabel(dict.enums.quality, residence.qualityLevel);

  return (
    <Link href={localePath(`/residences/${residence.slug}`, dict.locale)} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem]">
        <SmartImage
          src={residence.images[0]?.url}
          alt={residence.name}
          seed={`${residence.slug}-0`}
          priority={priority}
          sizes="60vw"
          imgClassName="transition-transform duration-500 group-active:scale-[1.03]"
        />
        <div className="absolute right-2 top-2 z-10">
          <FavoriteButton residenceId={residence.id} initialFavorited={favorited} className="h-8 w-8" />
        </div>
        {residence.isVerified && (
          <span className="absolute left-2.5 top-2.5 z-10 max-w-[110px] rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-bold leading-tight text-brand-700 shadow-soft">
            {dict.card.travelerFavorite}
          </span>
        )}
      </div>

      <div className="mt-2.5">
        <p className="eyebrow truncate text-[9.5px] text-terracotta">
          {quality ? `${quality} · ` : ""}
          {residence.city}
        </p>
        <div className="mt-0.5 flex items-start justify-between gap-1.5">
          <p className="truncate font-display text-[16px] leading-snug text-foreground">{residence.name}</p>
          {residence.ratingCount > 0 && (
            <span className="mt-0.5 flex shrink-0 items-center gap-0.5 text-[12.5px] font-semibold text-foreground">
              <Star className="h-3 w-3 fill-gold-500 text-gold-500" />
              {residence.ratingAverage.toFixed(1)}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[13.5px] text-foreground">
          <span className="font-bold">{formatPrice(residence.pricePerNight)}</span>
          <span className="text-muted"> {dict.card.perNight}</span>
        </p>
      </div>
    </Link>
  );
}

export function MobilePackCard({
  pack,
  favorited,
}: {
  pack: {
    id: string;
    slug: string;
    name: string;
    price: number;
    durationDays: number;
    durationNights: number;
    destination?: { name: string } | null;
    images: { url: string; altText?: string | null }[];
  };
  favorited?: boolean;
}) {
  const dict = useI18n();
  return (
    <Link href={localePath(`/packs/${pack.slug}`, dict.locale)} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem]">
        <SmartImage
          src={pack.images[0]?.url}
          alt={pack.images[0]?.altText ?? pack.name}
          seed={`pack-${pack.slug}`}
          sizes="50vw"
          imgClassName="transition-transform duration-500 group-active:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/10 to-transparent" />
        <div className="absolute right-2 top-2 z-10">
          <FavoriteButton packId={pack.id} initialFavorited={favorited} className="h-8 w-8" />
        </div>
        <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-ink shadow-soft">
          <Clock className="h-2.5 w-2.5 text-terracotta" /> {pack.durationDays}
          {dict.card.dayShort}/{pack.durationNights}
          {dict.card.nightShort}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
          {pack.destination && (
            <p className="eyebrow truncate text-[9px] text-gold-300">{pack.destination.name}</p>
          )}
          <h3 className="mt-0.5 line-clamp-2 font-display text-[15px] leading-tight">{pack.name}</h3>
          <p className="mt-1 text-[12.5px] font-bold text-white">{formatPrice(pack.price)}</p>
        </div>
      </div>
    </Link>
  );
}
