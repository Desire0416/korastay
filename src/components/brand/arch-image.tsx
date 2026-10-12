import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";

// Cadre photo en arche soudano-sahelienne (signature v2), avec un
// contour d'arche decale optionnel en filigrane derriere l'image.
export function ArchImage({
  src,
  alt,
  seed,
  className,
  imgClassName,
  priority,
  sizes,
  outline = false,
  outlineClassName,
  small = false,
}: {
  src?: string | null;
  alt: string;
  seed?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  /** Dessine une seconde arche (contour) decalee derriere l'image. */
  outline?: boolean;
  outlineClassName?: string;
  /** Rayon de base plus serre (petits formats). */
  small?: boolean;
}) {
  const radius = small ? "rounded-arch-sm" : "rounded-arch";
  return (
    <div className={cn("relative", className)}>
      {outline && (
        <div
          aria-hidden="true"
          className={cn(
            "absolute -inset-2.5 border border-terracotta/35 sm:-inset-3.5",
            radius,
            outlineClassName
          )}
        />
      )}
      <div className={cn("relative h-full w-full overflow-hidden", radius)}>
        <SmartImage
          src={src}
          alt={alt}
          seed={seed}
          priority={priority}
          sizes={sizes}
          imgClassName={imgClassName}
        />
      </div>
    </div>
  );
}
