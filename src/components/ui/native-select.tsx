import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NativeSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** "md" = hauteur des champs de formulaire (48px), "sm" = formulaires compacts. */
  size?: "sm" | "md";
}

// Select natif aligne sur Input (bordure encre, focus terracotta), avec
// chevron dessine : fonctionne dans les formulaires d'actions serveur.
export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, size = "md", children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "w-full appearance-none rounded-xl border border-ink/15 bg-white pl-4 pr-10 text-foreground shadow-inner-soft transition-colors",
          "hover:border-ink/30 focus-visible:border-terracotta focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-terracotta/10",
          "disabled:cursor-not-allowed disabled:opacity-60",
          size === "md" ? "h-12 text-[15px]" : "h-10 text-sm",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  )
);
NativeSelect.displayName = "NativeSelect";
