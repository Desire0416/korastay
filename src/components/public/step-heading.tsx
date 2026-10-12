import { cn } from "@/lib/utils";

// Titre d'etape des tunnels de reservation : numero dans une arche + titre serif.
export function StepHeading({
  step,
  title,
  className,
}: {
  step: number;
  title: string;
  className?: string;
}) {
  return (
    <h2 className={cn("mb-5 flex items-center gap-3.5", className)}>
      <span className="flex h-10 w-9 shrink-0 items-center justify-center rounded-arch-sm border border-terracotta/35 font-display text-base italic text-terracotta">
        {String(step).padStart(2, "0")}
      </span>
      <span className="font-display text-[1.45rem] font-normal leading-tight text-foreground">{title}</span>
    </h2>
  );
}
