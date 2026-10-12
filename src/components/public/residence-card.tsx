"use client";

import Link from "next/link";
import { Star, ArrowUpRight } from "lucide-react";
import { CardImageCarousel } from "./card-image-carousel";
import { FavoriteButton } from "./favorite-button";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatPrice } from "@/lib/utils";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";
import { enumLabel } from "@/lib/dictionaries/enums";
import type { ResidenceCardData } from "@/lib/queries";

interface ResidenceCardProps {
  residence: ResidenceCardData;
  favorited?: boolean;
  priority?: boolean;
}

// Carte logement v2 : photo arrondie, sur-titre terracotta (gamme + ville),
// nom en serif, prix sur un filet, fleche qui s'anime au survol.
export function ResidenceCard({ residence, favorited, priority }: ResidenceCardProps) {
  const dict = useI18n();
  const quality = enumLabel(dict.enums.quality, residence.qualityLevel);

  return (
    <Link href={localePath(`/residences/${residence.slug}`, dict.locale)} className="group block">
      <div className="relative">
        <CardImageCarousel
          images={residence.images}
          seedPrefix={residence.slug}
          priority={priority}
          aspectClass="aspect-[5/4]"
        />
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton residenceId={residence.id} initialFavorited={favorited} />
        </div>
        {residence.isVerified && (
          <div className="absolute left-3 top-3 z-10">
            <VerifiedBadge size="sm" label={dict.card.verified} />
          </div>
        )}
      </div>

      <div className="mt-4 px-0.5">
        <p className="eyebrow truncate text-[10.5px] text-terracotta">
          {quality ? `${quality} · ` : ""}
          {residence.city}
        </p>
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 font-display text-[1.25rem] leading-snug text-foreground">
            {residence.name}
          </h3>
          {residence.ratingCount > 0 && (
            <span className="mt-1 flex shrink-0 items-center gap-1 text-sm font-semibold text-foreground">
              <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
              {residence.ratingAverage.toFixed(1)}
            </span>
          )}
        </div>
        <p className="mt-1 truncate text-sm text-muted">
          {residence.district ? `${residence.district} · ` : ""}
          {residence.capacity} {dict.card.guestsUnit} · {residence.bedrooms} {dict.card.bedroomsUnit}
        </p>

        <div className="mt-3.5 flex items-center justify-between border-t border-border/80 pt-3.5">
          <p className="text-foreground">
            <span className="text-[15px] font-bold">{formatPrice(residence.pricePerNight)}</span>
            <span className="text-sm text-muted"> {dict.card.perNight}</span>
          </p>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 text-ink transition-all duration-300 group-hover:border-brand-500 group-hover:bg-brand-500 group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
