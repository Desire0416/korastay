import Link from "next/link";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";

interface DestinationCardProps {
  destination: {
    name: string;
    slug: string;
    region?: string | null;
    heroImageUrl?: string | null;
    _count?: { residences: number; packs: number };
  };
  size?: "sm" | "lg";
}

export function DestinationCard({ destination, size = "sm" }: DestinationCardProps) {
  const count = destination._count?.residences ?? 0;
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group relative block overflow-hidden rounded-3xl shadow-soft"
    >
      <div className={cn("relative", size === "lg" ? "aspect-[3/4]" : "aspect-[4/5]")}>
        <SmartImage
          src={destination.heroImageUrl}
          alt={destination.name}
          seed={`dest-${destination.slug}`}
          imgClassName="transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h3 className="text-lg font-bold leading-tight">{destination.name}</h3>
          {destination.region && (
            <p className="text-xs text-white/75">{destination.region}</p>
          )}
          {count > 0 && (
            <p className="mt-1 text-xs font-medium text-white/90">
              {count} résidence{count > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
