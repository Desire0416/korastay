"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { MapPinned, X } from "lucide-react";
import type { MapResidence } from "./residences-map-inner";

// Leaflet accede a `window` -> chargement client uniquement (pas de SSR).
const MapInner = dynamic(() => import("./residences-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted">
      Chargement de la carte…
    </div>
  ),
});

export function ResidencesMap({ residences }: { residences: MapResidence[] }) {
  const [show, setShow] = React.useState(false);
  if (residences.length === 0) return null;

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground shadow-soft transition-colors hover:border-brand-300"
        aria-expanded={show}
      >
        {show ? (
          <><X className="h-4 w-4" /> Masquer la carte</>
        ) : (
          <><MapPinned className="h-4 w-4 text-brand-600" /> Afficher la carte ({residences.length})</>
        )}
      </button>
      {show && (
        <div className="mt-3 h-[60vh] overflow-hidden rounded-3xl border border-border shadow-soft">
          <MapInner residences={residences} />
        </div>
      )}
    </div>
  );
}
