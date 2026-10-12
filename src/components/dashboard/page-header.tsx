import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Ornament } from "@/components/brand/motif";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Sur-titre optionnel (terracotta, orne d'un losange). */
  eyebrow?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  className?: string;
}

// En-tete de page des espaces connectes v2 : fil d'Ariane localise, titre
// serif, actions a droite.
export async function PageHeader({ title, description, eyebrow, breadcrumbs, actions, className }: PageHeaderProps) {
  const { locale } = await getI18n();
  return (
    <div className={cn("mb-6 md:mb-8", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-3 flex flex-wrap items-center gap-1 text-[13px] text-muted" aria-label="Breadcrumb">
          {breadcrumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {c.href ? (
                <Link href={localePath(c.href, locale)} className="hover:text-ink">{c.label}</Link>
              ) : (
                <span className="text-foreground">{c.label}</span>
              )}
              {i < breadcrumbs.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-sand-400" />}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="eyebrow mb-2 flex items-center gap-2.5 text-[10.5px] text-terracotta">
              <Ornament side="left" />
              {eyebrow}
            </p>
          )}
          <h1 className="text-balance font-display text-[1.9rem] font-normal leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[2.3rem]">
            {title}
          </h1>
          {description && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
