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
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        {Icon && (
          <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl transition-transform", TONES[tone], interactive && "group-hover:scale-105")}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">{value}</p>
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

  const base = "relative rounded-3xl border border-border bg-surface p-5 shadow-soft";

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
