import { MapPin, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapEmbedProps {
  latitude: number;
  longitude: number;
  label?: string;
  /** Rayon approximatif en degres (0.02 ~ quartier, 0.08 ~ ville). */
  delta?: number;
  zoom?: number;
  className?: string;
  heightClass?: string;
}

/**
 * Carte interactive OpenStreetMap (iframe) — sans dependance ni cle API.
 * Pan/zoom dans l'iframe ; lien "voir en grand" en complement.
 */
export function MapEmbed({
  latitude,
  longitude,
  label,
  delta = 0.02,
  zoom = 14,
  className,
  heightClass = "h-64",
}: MapEmbedProps) {
  const minLon = (longitude - delta).toFixed(5);
  const minLat = (latitude - delta).toFixed(5);
  const maxLon = (longitude + delta).toFixed(5);
  const maxLat = (latitude + delta).toFixed(5);
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  const fullUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`;

  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-border bg-surface-soft", className)}>
      <iframe
        title={label ? `Carte - ${label}` : "Carte"}
        src={src}
        loading="lazy"
        className={cn("w-full", heightClass)}
        style={{ border: 0 }}
      />
      <div className="flex items-center justify-between gap-2 border-t border-border bg-surface px-4 py-2.5 text-sm">
        <span className="flex items-center gap-1.5 text-muted">
          <MapPin className="h-4 w-4 text-brand-600" />
          {label ?? "Localisation approximative"}
        </span>
        <a href={fullUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700">
          Voir en grand <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
