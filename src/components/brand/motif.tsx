import { cn } from "@/lib/utils";

// ============================================================
// Elements graphiques afro-contemporains de la v2 (cf. globals.css).
// Purement decoratifs (aria-hidden). La couleur vient de currentColor :
// on regle teinte + opacite avec text-* (ex. "text-terracotta/15").
// ============================================================

export type MotifVariant = "bogolan" | "kente" | "chevron" | "dots";

// Noms de classes litteraux : Tailwind ne detecte pas les gabarits.
const VARIANT_CLASS: Record<MotifVariant, string> = {
  bogolan: "motif-bogolan",
  kente: "motif-kente",
  chevron: "motif-chevron",
  dots: "motif-dots",
};

const FADE_CLASS = {
  bottom: "mask-fade-b",
  top: "mask-fade-t",
  x: "mask-fade-x",
  radial: "mask-radial",
} as const;

/** Trame de fond en filigrane, remplit son parent (qui doit etre `relative`). */
export function Motif({
  variant = "bogolan",
  fade,
  className,
}: {
  variant?: MotifVariant;
  fade?: keyof typeof FADE_CLASS;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", fade && FADE_CLASS[fade], className)}
    >
      <div className={cn("motif", VARIANT_CLASS[variant])} />
    </div>
  );
}

/** Frise horizontale : "dents de scie" (triangles) ou losanges. */
export function MotifBand({
  variant = "triangles",
  className,
}: {
  variant?: "triangles" | "diamonds";
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-full",
        variant === "triangles" ? "motif-band h-2.5" : "motif-diamonds h-3",
        className
      )}
    />
  );
}

/** Petit ornement d'eyebrow : trait + losange, oriente vers le texte. */
export function Ornament({
  side = "left",
  className,
}: {
  /** "left" : place AVANT le texte (trait puis losange) ; "right" : apres. */
  side?: "left" | "right";
  className?: string;
}) {
  const line = <span className="h-px w-7 bg-current opacity-45" />;
  const diamond = (
    <svg viewBox="0 0 10 10" className="h-[7px] w-[7px] shrink-0" aria-hidden="true">
      <path d="M5 0 10 5 5 10 0 5Z" fill="currentColor" />
    </svg>
  );
  return (
    <span aria-hidden="true" className={cn("inline-flex items-center gap-1.5", className)}>
      {side === "left" ? <>{line}{diamond}</> : <>{diamond}{line}</>}
    </span>
  );
}
