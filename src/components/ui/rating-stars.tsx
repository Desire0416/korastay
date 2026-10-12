"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/i18n/provider";

interface RatingStarsProps {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  /** true : une etoile + note chiffree (moyenne) ; false : cinq etoiles (avis individuel). */
  showValue?: boolean;
  className?: string;
}

export function RatingStars({ value, count, size = "md", showValue = true, className }: RatingStarsProps) {
  const locale = useLocale();
  const dim = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const text = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  if (!showValue) {
    const rounded = Math.round(value);
    return (
      <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value}/5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={cn(dim, i < rounded ? "fill-gold-500 text-gold-500" : "text-sand-300")} />
        ))}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1", text, className)}>
      <Star className={cn(dim, "fill-gold-500 text-gold-500")} />
      <span className="font-semibold text-foreground">
        {value > 0 ? value.toFixed(1) : locale === "en" ? "New" : "Nouveau"}
      </span>
      {typeof count === "number" && count > 0 && <span className="text-muted">({count})</span>}
    </span>
  );
}
