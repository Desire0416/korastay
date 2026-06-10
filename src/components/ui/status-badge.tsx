import { Badge } from "./badge";
import { metaFor, type BadgeTone } from "@/lib/enums";

type LabelMap = Record<string, { label: string; tone: BadgeTone }>;

export function StatusBadge({
  status,
  map,
  size = "md",
}: {
  status?: string | null;
  map: LabelMap;
  size?: "sm" | "md" | "lg";
}) {
  const meta = metaFor(map, status);
  return (
    <Badge tone={meta.tone} size={size}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {meta.label}
    </Badge>
  );
}
