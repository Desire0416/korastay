import { Motif, Ornament } from "@/components/brand/motif";
import { cn } from "@/lib/utils";

// En-tete editorial des pages catalogue (logements, packs, activites,
// destinations, blog) : fond creme + trame bogolan fondue, eyebrow orne,
// titre serif avec accent italique. `children` accueille puces / filtres.
export function PageHero({
  eyebrow,
  title,
  accent,
  description,
  children,
  aside,
  className,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Contenu place a droite du titre sur desktop (ex. compteur, CTA). */
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grain relative overflow-hidden border-b border-border/70", className)}>
      <Motif variant="bogolan" fade="bottom" className="text-sand-500/[0.14]" />
      <div aria-hidden="true" className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-terracotta/10 blur-3xl" />
      <div className="container-page relative pb-8 pt-8 md:pb-12 md:pt-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            {eyebrow && (
              <p className="eyebrow flex items-center gap-3 text-[10.5px] text-terracotta md:text-xs">
                <Ornament side="left" />
                {eyebrow}
              </p>
            )}
            <h1 className="mt-4 text-balance font-display text-[2.3rem] font-normal leading-[1.04] tracking-[-0.02em] text-foreground md:text-display-md lg:text-display-lg">
              {title} {accent && <em className="italic text-terracotta">{accent}</em>}
            </h1>
            {description && (
              <div className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted md:text-base">
                {description}
              </div>
            )}
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
        {children && <div className="mt-7 md:mt-9">{children}</div>}
      </div>
    </section>
  );
}
