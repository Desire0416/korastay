"use client";

import Link from "next/link";
import { Clock, Users, MapPin, ArrowRight } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { FavoriteButton } from "./favorite-button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
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
}

export function PackCard({ pack, favorited }: PackCardProps) {
  const dict = useI18n();
  return (
    <Link
      href={localePath(`/packs/${pack.slug}`, dict.locale)}
      className="group relative block overflow-hidden rounded-3xl border border-border bg-surface shadow-soft transition-shadow hover:shadow-card-hover"
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        <SmartImage
          src={pack.images[0]?.url}
          alt={pack.images[0]?.altText ?? pack.name}
          seed={`pack-${pack.slug}`}
          imgClassName="transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <div className="absolute right-3 top-3">
          <FavoriteButton packId={pack.id} initialFavorited={favorited} />
        </div>
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge tone="gold" className="bg-white/95">
            <Clock className="h-3 w-3" />
            {pack.durationDays}{dict.card.dayShort} / {pack.durationNights}{dict.card.nightShort}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          {pack.destination && (
            <p className="flex items-center gap-1 text-xs font-medium text-white/80">
              <MapPin className="h-3.5 w-3.5" /> {pack.destination.name}
            </p>
          )}
          <h3 className="mt-0.5 text-lg font-bold leading-tight">{pack.name}</h3>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="flex items-center gap-1 text-xs text-muted">
            <Users className="h-3.5 w-3.5" /> {dict.card.fromPeople.replace("{n}", String(pack.basePersons))}
          </p>
          <p className="mt-0.5">
            <span className="text-base font-extrabold text-foreground">
              {formatPrice(pack.price)}
            </span>
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
