import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Ornament } from "@/components/brand/motif";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  /** Fin de titre mise en valeur (italique terracotta / or sur fond sombre). */
  accent?: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
  align?: "left" | "center";
  /** "light" : textes clairs pour sections sur fond sombre. */
  tone?: "default" | "light";
  className?: string;
}

// En-tete de section editorial v2 : eyebrow orne d'un losange, grand titre
// serif (Fraunces SOFT), lien "voir tout" en pastille fleche.
export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  href,
  hrefLabel = "Voir tout",
  align = "left",
  tone = "default",
  className,
}: SectionHeadingProps) {
  const light = tone === "light";
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-5 sm:mb-12",
        centered && "flex-col items-center text-center",
        className
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {eyebrow && (
          <p
            className={cn(
              "eyebrow mb-4 flex items-center gap-3",
              light ? "text-gold-300" : "text-terracotta",
              centered && "justify-center"
            )}
          >
            <Ornament side="left" />
            {eyebrow}
            {centered && <Ornament side="right" />}
          </p>
        )}
        <h2
          className={cn(
            "text-balance font-display text-[2rem] font-normal leading-[1.08] tracking-[-0.02em] sm:text-[2.5rem] lg:text-[2.75rem]",
            light ? "text-white" : "text-foreground"
          )}
        >
          {title}
          {accent && (
            <>
              {" "}
              <em className={cn("italic", light ? "text-gold-300" : "text-terracotta")}>{accent}</em>
            </>
          )}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-4 max-w-xl text-pretty text-[15.5px] leading-relaxed",
              light ? "text-white/70" : "text-muted",
              centered && "mx-auto"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-3 text-sm font-semibold",
            light ? "text-white" : "text-ink"
          )}
        >
          <span
            className={cn(
              "border-b pb-0.5 transition-colors",
              light ? "border-white/30 group-hover:border-white" : "border-ink/25 group-hover:border-ink"
            )}
          >
            {hrefLabel}
          </span>
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 group-hover:translate-x-0.5",
              light
                ? "border-white/30 group-hover:border-gold-400 group-hover:bg-gold-400 group-hover:text-ink"
                : "border-ink/15 group-hover:border-ink group-hover:bg-ink group-hover:text-white"
            )}
          >
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      )}
    </div>
  );
}
