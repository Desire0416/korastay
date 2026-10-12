import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// v2 : boutons en pilule, reflet interne discret sur les aplats pleins,
// variantes terracotta et "outline-light" (sur fonds sombres).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-[-0.005em] transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(10,72,54,0.25)] hover:bg-brand-600 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_20px_-8px_rgba(10,72,54,0.55)]",
        accent:
          "bg-gold-500 text-ink-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_2px_rgba(146,82,20,0.25)] hover:bg-gold-400 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-8px_rgba(182,103,17,0.6)]",
        terracotta:
          "bg-terracotta-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(99,45,28,0.3)] hover:bg-terracotta-600",
        dark:
          "bg-ink text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-ink-800",
        outline:
          "border border-ink/15 bg-surface/60 text-foreground hover:border-ink/35 hover:bg-surface",
        "outline-light":
          "border border-white/35 bg-white/5 text-white backdrop-blur hover:border-white/70 hover:bg-white/10",
        soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
        ghost: "text-foreground hover:bg-surface-soft",
        danger: "bg-danger text-white hover:bg-danger/90",
        link: "text-brand-600 underline-offset-4 hover:underline p-0 h-auto",
        white:
          "bg-white text-ink shadow-soft hover:shadow-card border border-ink/5",
      },
      size: {
        sm: "h-9 rounded-full px-4 text-sm",
        md: "h-11 rounded-full px-5 text-sm",
        lg: "h-12 rounded-full px-7 text-[15px]",
        xl: "h-14 rounded-full px-8 text-base",
        icon: "h-10 w-10 rounded-full",
        "icon-sm": "h-8 w-8 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, children, disabled, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
