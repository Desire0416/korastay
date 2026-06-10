import { cn } from "@/lib/utils";

interface MonthlyBarsProps {
  data: { label: string; value: number }[];
  formatValue?: (v: number) => string;
  color?: string;
}

/** Petit graphique a barres (CSS, sans dependance). */
export function MonthlyBars({ data, formatValue, color = "bg-brand-500" }: MonthlyBarsProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-44 items-end justify-between gap-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-2xs font-semibold text-foreground">
            {d.value > 0 ? (formatValue ? formatValue(d.value) : d.value) : ""}
          </span>
          <div className="flex w-full flex-1 items-end">
            <div
              className={cn("w-full rounded-t-lg transition-all", color)}
              style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
            />
          </div>
          <span className="text-2xs text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
