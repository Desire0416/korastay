"use client";

import Link from "next/link";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";

interface DestinationCardProps {
  destination: {
    name: string;
    slug: string;
    region?: string | null;
    heroImageUrl?: string | null;
    _count?: { residences: number; packs: number };
  };
  size?: "sm" | "lg";
  /** "arch" : photo en arche, legende sous l'image (accueil v2). */
  shape?: "card" | "arch";
}

export function DestinationCard({ destination, size = "sm", shape = "card" }: DestinationCardProps) {
  const dict = useI18n();
  const count = destination._count?.residences ?? 0;
  const countLabel = count > 0 ? `${count} ${count > 1 ? dict.card.homePlural : dict.card.homeSingular}` : null;
  const href = localePath(`/destinations/${destination.slug}`, dict.locale);

  if (shape === "arch") {
    return (
      <Link href={href} className="group block text-center">
        <div className="relative aspect-[3/4] overflow-hidden rounded-arch bg-sand-200 shadow-soft transition-shadow duration-300 group-hover:shadow-card-hover">
          <SmartImage
            src={destination.heroImageUrl}
            alt={destination.name}
            seed={`dest-${destination.slug}`}
            sizes="(max-width: 768px) 40vw, 16vw"
            imgClassName="transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 rounded-arch ring-1 ring-inset ring-black/5" />
        </div>
        <h3 className="mt-4 font-display text-[1.2rem] leading-tight text-foreground transition-colors group-hover:text-terracotta">
          {destination.name}
        </h3>
        {(countLabel || destination.region) && (
          <p className="mt-1 text-xs text-muted">{countLabel ?? destination.region}</p>
        )}
      </Link>
    );
  }

  return (
    <Link href={href} className="group relative block overflow-hidden rounded-[1.75rem] shadow-soft">
      <div className={cn("relative", size === "lg" ? "aspect-[3/4]" : "aspect-[4/5]")}>
        <SmartImage
          src={destination.heroImageUrl}
          alt={destination.name}
          seed={`dest-${destination.slug}`}
          imgClassName="transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h3 className="font-display text-xl leading-tight">{destination.name}</h3>
          {destination.region && <p className="mt-0.5 text-xs text-white/75">{destination.region}</p>}
          {countLabel && <p className="mt-1 text-xs font-medium text-gold-300">{countLabel}</p>}
        </div>
      </div>
    </Link>
  );
}
