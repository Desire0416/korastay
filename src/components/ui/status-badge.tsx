"use client";

import { Badge } from "./badge";
import { metaFor, type BadgeTone } from "@/lib/enums";
import { useI18n } from "@/components/i18n/provider";
import { statusText } from "@/lib/dictionaries/enums";

type LabelMap = Record<string, { label: string; tone: BadgeTone }>;

// Badge de statut : libelle FR des *Meta traduit dans la locale courante.
export function StatusBadge({
  status,
  map,
  size = "md",
}: {
  status?: string | null;
  map: LabelMap;
  size?: "sm" | "md" | "lg";
}) {
  const dict = useI18n();
  const meta = metaFor(map, status);
  return (
    <Badge tone={meta.tone} size={size}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {statusText(dict, meta.label)}
    </Badge>
  );
}
