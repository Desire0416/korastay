"use client";

import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { FavoriteButton } from "../favorite-button";
import { formatPrice } from "@/lib/utils";
import { qualityLevelMeta } from "@/lib/enums";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";
import type { ResidenceCardData } from "@/lib/queries";

// ============================================================
// Cartes compactes "app mobile" (style Airbnb mobile).
// Utilisees uniquement dans les vues mobiles (md:hidden).
// La version desktop conserve ResidenceCard / PackCard.
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
  const quality = residence.qualityLevel ? qualityLevelMeta[residence.qualityLevel] : null;

  return (
    <Link href={localePath(`/residences/${residence.slug}`, dict.locale)} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl">
        <SmartImage
          src={residence.images[0]?.url}
          alt={residence.name}
          seed={`${residence.slug}-0`}
          priority={priority}
          imgClassName="transition-transform duration-500 group-active:scale-[1.03]"
        />
        <div className="absolute right-2 top-2 z-10">
          <FavoriteButton residenceId={residence.id} initialFavorited={favorited} className="h-8 w-8" />
        </div>
        {residence.isVerified && (
          <span className="absolute left-2.5 top-2.5 z-10 max-w-[100px] rounded-full bg-white/95 px-2.5 py-1 text-left text-[11px] font-semibold leading-tight text-ink shadow-soft">
            {dict.card.travelerFavorite}
          </span>
        )}
      </div>

      <div className="mt-2">
        <div className="flex items-start justify-between gap-1.5">
          <p className="truncate text-[14px] font-semibold text-foreground">{residence.name}</p>
          {residence.ratingCount > 0 && (
            <span className="flex shrink-0 items-center gap-0.5 text-[13px] font-medium text-foreground">
              <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
              {residence.ratingAverage.toFixed(1)}
            </span>
          )}
        </div>
        <p className="truncate text-[13px] text-muted">
          {quality ? `${quality.label} · ` : ""}
          {residence.city}
        </p>
        <p className="mt-0.5 text-[14px] text-foreground">
          <span className="font-semibold">{formatPrice(residence.pricePerNight)}</span>
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
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
        <SmartImage
          src={pack.images[0]?.url}
          alt={pack.images[0]?.altText ?? pack.name}
          seed={`pack-${pack.slug}`}
          imgClassName="transition-transform duration-500 group-active:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
        <div className="absolute right-2 top-2 z-10">
          <FavoriteButton packId={pack.id} initialFavorited={favorited} className="h-8 w-8" />
        </div>
        <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-ink shadow-soft">
          <Clock className="h-2.5 w-2.5" /> {pack.durationDays}{dict.card.dayShort}/{pack.durationNights}{dict.card.nightShort}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
          {pack.destination && <p className="text-[11px] font-medium text-white/85">{pack.destination.name}</p>}
          <h3 className="truncate text-[14px] font-bold leading-tight">{pack.name}</h3>
          <p className="mt-0.5 text-[12px] text-white/90">
            <span className="font-bold">{formatPrice(pack.price)}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
