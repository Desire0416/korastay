import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

// Etat vide v2 : cadre pointille sable, icone dans une arche, titre serif.
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-dashed border-sand-400/70 bg-sand-50/70 px-6 py-14 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-5 flex h-16 w-14 items-center justify-center rounded-arch-sm bg-surface text-terracotta shadow-soft ring-1 ring-sand-300/60">
          <Icon className="h-6 w-6" strokeWidth={1.6} />
        </div>
      )}
      <h3 className="font-display text-xl text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
