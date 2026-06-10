import Link from "next/link";
import { Star, Users, BedDouble, MapPin } from "lucide-react";
import { CardImageCarousel } from "./card-image-carousel";
import { FavoriteButton } from "./favorite-button";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatPrice } from "@/lib/utils";
import { qualityLevelMeta } from "@/lib/enums";
import type { ResidenceCardData } from "@/lib/queries";

interface ResidenceCardProps {
  residence: ResidenceCardData;
  favorited?: boolean;
  priority?: boolean;
}

export function ResidenceCard({ residence, favorited, priority }: ResidenceCardProps) {
  const quality = residence.qualityLevel
    ? qualityLevelMeta[residence.qualityLevel]
    : null;

  return (
    <Link href={`/residences/${residence.slug}`} className="group block">
      <div className="relative">
        <CardImageCarousel
          images={residence.images}
          seedPrefix={residence.slug}
          priority={priority}
        />
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton residenceId={residence.id} initialFavorited={favorited} />
        </div>
        {residence.isVerified && (
          <div className="absolute left-3 top-3 z-10">
            <VerifiedBadge size="sm" />
          </div>
        )}
      </div>

      <div className="mt-3 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-bold text-foreground">{residence.name}</h3>
          {residence.ratingCount > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
              <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
              {residence.ratingAverage.toFixed(1)}
            </span>
          )}
        </div>

        <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
          <MapPin className="h-3.5 w-3.5" />
          {residence.district ? `${residence.district}, ` : ""}
          {residence.city}
        </p>

        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {residence.capacity} pers.
          </span>
          <span className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" /> {residence.bedrooms} ch.
          </span>
          {quality && (
            <span className="font-medium text-brand-600">{quality.label}</span>
          )}
        </div>

        <p className="mt-2 text-foreground">
          <span className="text-[15px] font-extrabold">
            {formatPrice(residence.pricePerNight)}
          </span>
          <span className="text-sm text-muted"> / nuit</span>
        </p>
      </div>
    </Link>
  );
}
