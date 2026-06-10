import { cn } from "@/lib/utils";

// Active les images distantes (ex: Picsum/Cloudinary) si la variable est "true".
// Par defaut : illustrations locales (instantanees, sans reseau, fiables).
const USE_REMOTE = process.env.NEXT_PUBLIC_USE_REMOTE_IMAGES === "true";

const PALETTES: { from: string; to: string; accent: string }[] = [
  { from: "#0F6B4F", to: "#0A4836", accent: "#F2A23A" },
  { from: "#12343B", to: "#0F6B4F", accent: "#F4AE45" },
  { from: "#0C5A42", to: "#12343B", accent: "#F2A23A" },
  { from: "#1d5b54", to: "#0F6B4F", accent: "#FBD897" },
  { from: "#0F6B4F", to: "#155049", accent: "#F2A23A" },
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// 4 scenes illustrees evocatrices, choisies de maniere deterministe.
function Scene({ variant, p }: { variant: number; p: (typeof PALETTES)[number] }) {
  const sun = (
    <circle cx="78" cy="24" r="11" fill={p.accent} opacity="0.92" />
  );
  switch (variant) {
    case 0: // collines + soleil
      return (
        <>
          {sun}
          <path d="M0 78 Q25 60 50 72 T100 66 V100 H0 Z" fill="#ffffff" opacity="0.10" />
          <path d="M0 86 Q30 70 55 82 T100 78 V100 H0 Z" fill="#ffffff" opacity="0.14" />
          <path d="M0 94 Q35 84 60 92 T100 90 V100 H0 Z" fill="#ffffff" opacity="0.18" />
        </>
      );
    case 1: // ville / skyline
      return (
        <>
          {sun}
          <g fill="#ffffff" opacity="0.14">
            <rect x="10" y="58" width="12" height="42" rx="2" />
            <rect x="26" y="48" width="14" height="52" rx="2" />
            <rect x="44" y="64" width="11" height="36" rx="2" />
            <rect x="59" y="42" width="15" height="58" rx="2" />
            <rect x="78" y="56" width="13" height="44" rx="2" />
          </g>
          <rect x="0" y="92" width="100" height="8" fill="#ffffff" opacity="0.16" />
        </>
      );
    case 2: // cote / vagues
      return (
        <>
          {sun}
          <path d="M0 70 Q25 64 50 70 T100 70 V100 H0 Z" fill="#ffffff" opacity="0.10" />
          <path d="M0 80 Q20 74 40 80 T80 80 T120 80 V100 H0 Z" fill="#ffffff" opacity="0.16" />
          <path d="M0 90 Q15 85 30 90 T60 90 T90 90 T120 90 V100 H0 Z" fill="#ffffff" opacity="0.22" />
        </>
      );
    default: // interieur / fenetre
      return (
        <>
          <rect x="20" y="22" width="40" height="34" rx="3" fill="#ffffff" opacity="0.16" />
          <line x1="40" y1="22" x2="40" y2="56" stroke={p.from} strokeWidth="2" opacity="0.5" />
          <line x1="20" y1="39" x2="60" y2="39" stroke={p.from} strokeWidth="2" opacity="0.5" />
          <circle cx="78" cy="40" r="6" fill={p.accent} opacity="0.85" />
          <rect x="0" y="78" width="100" height="22" fill="#ffffff" opacity="0.12" />
        </>
      );
  }
}

interface SmartImageProps {
  src?: string | null;
  alt: string;
  seed?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}

export function SmartImage({
  src,
  alt,
  seed,
  className,
  imgClassName,
  priority,
}: SmartImageProps) {
  const key = seed ?? src ?? alt;
  const h = hash(key);
  const p = PALETTES[h % PALETTES.length];
  const variant = Math.floor(h / 7) % 4;
  const gradId = `g${h % 100000}`;
  // Les images locales (uploads) s'affichent toujours ; les images distantes
  // (http) sont affichees seulement si NEXT_PUBLIC_USE_REMOTE_IMAGES=true.
  const isLocal = !!src && src.startsWith("/");
  const showImg = !!src && (isLocal || USE_REMOTE);

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-surface-soft", className)}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={p.from} />
            <stop offset="100%" stopColor={p.to} />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#${gradId})`} />
        <Scene variant={variant} p={p} />
      </svg>

      {showImg && (
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
