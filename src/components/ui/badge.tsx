import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { BadgeTone } from "@/lib/enums";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-sand-100 text-sand-800 ring-1 ring-inset ring-sand-300/50",
        brand: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200/60",
        gold: "bg-gold-50 text-gold-800 ring-1 ring-inset ring-gold-200/70",
        success: "bg-emerald-50 text-success ring-1 ring-inset ring-emerald-200/60",
        danger: "bg-red-50 text-danger ring-1 ring-inset ring-red-200/60",
        info: "bg-sky-50 text-info ring-1 ring-inset ring-sky-200/60",
        warning: "bg-gold-50 text-gold-800 ring-1 ring-inset ring-gold-200/70",
        terracotta: "bg-terracotta-50 text-terracotta-700 ring-1 ring-inset ring-terracotta-200/60",
        ink: "bg-ink text-white",
      },
      size: {
        sm: "px-2 py-0.5 text-2xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    Omit<VariantProps<typeof badgeVariants>, "tone"> {
  tone?: BadgeTone;
}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size, className }))} {...props} />
  );
}
