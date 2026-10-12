import Image from "next/image";
import { cn } from "@/lib/utils";

// Active les images distantes (ex: Picsum/Cloudinary) si la variable est "true".
// Par defaut : illustrations locales (instantanees, sans reseau, fiables).
const USE_REMOTE = process.env.NEXT_PUBLIC_USE_REMOTE_IMAGES === "true";

// Hotes distants autorises par next.config (images.remotePatterns). Toute autre
// source distante retombe sur un <img> brut pour ne jamais planter a l'execution.
const ALLOWED_REMOTE_HOSTS = ["images.unsplash.com", "res.cloudinary.com", "picsum.photos"];

function isAllowlistedRemote(url: string): boolean {
  try {
    return ALLOWED_REMOTE_HOSTS.some((h) => new URL(url).hostname.endsWith(h));
  } catch {
    return false;
  }
}

// Fonds de repli v2 (chargement / photo absente) : degrades terre et
// indigo de la charte + trame bogolan, choisis de maniere deterministe.
const PALETTES: { from: string; to: string; motif: string }[] = [
  { from: "#0C5A42", to: "#0A4836", motif: "rgba(242, 162, 58, 0.22)" },
  { from: "#B9562F", to: "#7E3820", motif: "rgba(253, 234, 203, 0.20)" },
  { from: "#1C434B", to: "#091C20", motif: "rgba(242, 162, 58, 0.20)" },
  { from: "#D3BA8C", to: "#9F8254", motif: "rgba(63, 52, 38, 0.18)" },
  { from: "#DC8419", to: "#9C4626", motif: "rgba(253, 234, 203, 0.22)" },
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

interface SmartImageProps {
  src?: string | null;
  alt: string;
  seed?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** Indice de dimension pour next/image (srcset responsive). Cf. attribut sizes HTML. */
  sizes?: string;
}

// Valeur par defaut : carte dans une grille (100vw mobile -> 50vw tablette -> 25vw desktop).
const DEFAULT_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw";

export function SmartImage({
  src,
  alt,
  seed,
  className,
  imgClassName,
  priority,
  sizes = DEFAULT_SIZES,
}: SmartImageProps) {
  const key = seed ?? src ?? alt;
  const p = PALETTES[hash(key) % PALETTES.length];
  // Les uploads (chemin local /uploads ou Vercel Blob) s'affichent toujours ;
  // les autres images distantes (http) seulement si NEXT_PUBLIC_USE_REMOTE_IMAGES=true.
  const isLocal = !!src && src.startsWith("/");
  const isBlob = !!src && src.includes(".blob.vercel-storage.com");
  const showImg = !!src && (isLocal || isBlob || USE_REMOTE);
  // Optimisable par next/image seulement si l'hote est connu de next.config.
  const canOptimize = !!src && (isLocal || isBlob || isAllowlistedRemote(src));

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-sand-200", className)}>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundImage: `linear-gradient(140deg, ${p.from}, ${p.to})` }}
      >
        <div className="motif motif-bogolan" style={{ color: p.motif }} />
        {/* Arche en filigrane, au centre */}
        <div className="absolute left-1/2 top-1/2 h-[46%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-arch-sm border border-white/25" />
      </div>

      {showImg && canOptimize && (
        <Image
          src={src!}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", imgClassName)}
        />
      )}
      {showImg && !canOptimize && (
        // Repli : hote distant non allowliste (demo). Pas d'optimisation mais ne plante pas.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          className={cn("absolute inset-0 h-full w-full object-cover", imgClassName)}
        />
      )}
      <span className="sr-only">{alt}</span>
    </div>
  );
}
