import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

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

const TONES = {
  brand: "bg-brand-50 text-brand-600",
  gold: "bg-gold-50 text-gold-600",
  info: "bg-sky-50 text-info",
  success: "bg-emerald-50 text-success",
  danger: "bg-red-50 text-danger",
};

export function KpiCard({ label, value, icon: Icon, hint, trend, tone = "brand", href, className }: KpiCardProps) {
  const interactive = Boolean(href);

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-muted md:text-sm">{label}</p>
        {Icon && (
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-transform md:h-10 md:w-10 md:rounded-2xl", TONES[tone], interactive && "group-hover:scale-105")}>
            <Icon className="h-[18px] w-[18px] md:h-5 md:w-5" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-[26px] font-semibold leading-none tracking-tight text-foreground md:mt-3 md:text-3xl md:leading-tight">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {trend && (
          <span className={cn("flex items-center gap-0.5 text-xs font-semibold", trend.up ? "text-success" : "text-danger")}>
            {trend.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {trend.value}
          </span>
        )}
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      {interactive && (
        <ArrowUpRight className="pointer-events-none absolute right-4 top-4 h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </>
  );

  const base = "relative rounded-3xl border border-border bg-surface p-4 shadow-soft md:p-5";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "group block transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
          className
        )}
      >
        {content}
      </Link>
    );
  }

  return <div className={cn(base, className)}>{content}</div>;
}
