import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  trend?: { value: string; up: boolean };
  tone?: "brand" | "gold" | "info" | "success" | "danger";
  href?: string;
  className?: string;
}

// Pastille d'icone en arche, teintes de la charte v2.
const TONES = {
  brand: "bg-brand-500 text-white",
  gold: "bg-gold-400 text-ink-900",
  info: "bg-ink text-gold-300",
  success: "bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-200/70",
  danger: "bg-terracotta text-white",
};

// Composant serveur (recoit une icone Lucide, non serialisable vers le client).
export async function KpiCard({ label, value, icon: Icon, hint, trend, tone = "brand", href, className }: KpiCardProps) {
  const { locale } = await getI18n();
  const interactive = Boolean(href);

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow text-[10px] leading-snug text-muted">{label}</p>
        {Icon && (
          <span
            className={cn(
              "flex h-10 w-9 shrink-0 items-center justify-center rounded-arch-sm transition-transform md:h-11 md:w-10",
              TONES[tone],
              interactive && "group-hover:-translate-y-0.5"
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-3 font-display leading-none tracking-[-0.02em] text-foreground md:mt-4",
          String(value).length > 9 ? "text-[1.35rem] sm:text-[1.6rem] lg:text-[1.75rem]" : "text-[1.9rem] md:text-[2.25rem]"
        )}
      >
        {value}
      </p>
      <div className="mt-2 flex min-h-[1rem] items-center gap-2">
        {trend && (
          <span className={cn("flex items-center gap-0.5 text-xs font-semibold", trend.up ? "text-success" : "text-danger")}>
            {trend.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {trend.value}
          </span>
        )}
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      {interactive && (
        <ArrowUpRight className="pointer-events-none absolute bottom-4 right-4 h-4 w-4 text-terracotta opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </>
  );

  const base = "relative rounded-[1.5rem] border border-border/80 bg-surface p-4 shadow-soft md:p-5";

  if (href) {
    return (
      <Link
        href={localePath(href, locale)}
        className={cn(
          base,
          "group block transition-all hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
          className
        )}
      >
        {content}
      </Link>
    );
  }

  return <div className={cn(base, className)}>{content}</div>;
}
