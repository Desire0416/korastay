import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-500 text-white shadow-soft hover:bg-brand-600 hover:shadow-card",
        accent:
          "bg-gold-500 text-brand-900 shadow-soft hover:bg-gold-600 hover:text-white",
        dark: "bg-ink text-white hover:bg-brand-900",
        outline:
          "border border-border bg-surface text-foreground hover:border-brand-300 hover:bg-brand-50/50",
        soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
        ghost: "text-foreground hover:bg-surface-soft",
        danger: "bg-danger text-white hover:bg-danger/90",
        link: "text-brand-600 underline-offset-4 hover:underline p-0 h-auto",
        white:
          "bg-white text-foreground shadow-soft hover:shadow-card border border-border/60",
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
