"use client";

import Link from "next/link";
import { Clock, MapPin, Star } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { cn, formatPrice } from "@/lib/utils";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";
import { enumLabel } from "@/lib/dictionaries/enums";
import type { ActivityCardData } from "@/lib/activity-queries";

// Carte activite v2 (accueil desktop + mobile, catalogue des activites).
export function ActivityCard({
  activity,
  tone = "default",
}: {
  activity: ActivityCardData;
  /** "dark" : textes clairs pour section sombre. */
  tone?: "default" | "dark";
}) {
  const dict = useI18n();
  const dark = tone === "dark";
  return (
    <Link href={localePath(`/activites/${activity.slug}`, dict.locale)} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
        <SmartImage
          src={activity.images[0]?.url}
          alt={activity.images[0]?.altText ?? activity.name}
          seed={`act-${activity.slug}`}
          sizes="(max-width: 768px) 50vw, 25vw"
          imgClassName="transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-ink shadow-soft">
          {enumLabel(dict.enums.activityCategory, activity.category)}
        </span>
      </div>
      <div className="mt-3 px-0.5">
        <h3 className={cn("line-clamp-1 font-display text-lg", dark ? "text-white" : "text-foreground")}>
          {activity.name}
        </h3>
        <p className={cn("mt-1 flex items-center gap-3 text-xs", dark ? "text-white/60" : "text-muted")}>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {activity.city}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {dict.card.hours.replace("{n}", String(activity.durationHours))}
          </span>
          {activity.ratingCount > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-gold-500 text-gold-500" /> {activity.ratingAverage.toFixed(1)}
            </span>
          )}
        </p>
        <p className={cn("mt-2 text-sm", dark ? "text-white" : "text-foreground")}>
          <span className="font-bold">{formatPrice(activity.pricePerPerson)}</span>
          <span className={dark ? "text-white/60" : "text-muted"}> {dict.card.perPerson}</span>
        </p>
      </div>
    </Link>
  );
}
