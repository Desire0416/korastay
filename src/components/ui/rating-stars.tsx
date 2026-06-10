import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export function RatingStars({
  value,
  count,
  size = "md",
  showValue = true,
  className,
}: RatingStarsProps) {
  const dim = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const text = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  return (
    <span className={cn("inline-flex items-center gap-1", text, className)}>
      <Star className={cn(dim, "fill-gold-500 text-gold-500")} />
      {showValue && (
        <span className="font-semibold text-foreground">
          {value > 0 ? value.toFixed(1) : "Nouveau"}
        </span>
      )}
      {typeof count === "number" && count > 0 && (
        <span className="text-muted">({count})</span>
      )}
    </span>
  );
}
