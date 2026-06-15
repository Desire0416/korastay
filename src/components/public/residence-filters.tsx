"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Check } from "lucide-react";
import {
  Drawer, DrawerContent, DrawerTrigger, DrawerClose, DrawerTitle,
} from "@/components/ui/drawer";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { cn, formatPrice } from "@/lib/utils";
import { STAY_TYPES, SORT_OPTIONS, AMENITIES } from "@/lib/constants";

interface ResidenceFiltersProps {
  destinations: { name: string; slug: string }[];
  total: number;
}

type Filters = {
  city: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  capacity: number;
  verified: boolean;
  amenities: string[];
  sort: string;
  checkin: string;
  checkout: string;
};

export function ResidenceFilters({ destinations, total }: ResidenceFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();

  const initial: Filters = {
    city: params.get("city") ?? "",
    type: params.get("type") ?? "any",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    capacity: Number(params.get("capacity") ?? params.get("guests") ?? 0),
    verified: params.get("verified") === "1",
    amenities: params.get("amenities")?.split(",").filter(Boolean) ?? [],
    sort: params.get("sort") ?? "featured",
    checkin: params.get("checkin") ?? "",
    checkout: params.get("checkout") ?? "",
  };

  const [draft, setDraft] = React.useState<Filters>(initial);

  function apply(next: Filters) {
    const sp = new URLSearchParams();
    if (next.city) sp.set("city", next.city);
    if (next.type !== "any") sp.set("type", next.type);
    if (next.minPrice) sp.set("minPrice", next.minPrice);
    if (next.maxPrice) sp.set("maxPrice", next.maxPrice);
    if (next.capacity > 0) sp.set("capacity", String(next.capacity));
    if (next.verified) sp.set("verified", "1");
    if (next.amenities.length) sp.set("amenities", next.amenities.join(","));
    if (next.sort !== "featured") sp.set("sort", next.sort);
    if (next.checkin && next.checkout) {
      sp.set("checkin", next.checkin);
      sp.set("checkout", next.checkout);
    }
    router.push(`/residences?${sp.toString()}`);
  }

  function toggleAmenity(slug: string) {
    setDraft((d) => ({
      ...d,
      amenities: d.amenities.includes(slug)
        ? d.amenities.filter((a) => a !== slug)
        : [...d.amenities, slug],
    }));
  }

  const activeCount =
    (initial.city ? 1 : 0) +
    (initial.type !== "any" ? 1 : 0) +
    (initial.minPrice || initial.maxPrice ? 1 : 0) +
    (initial.capacity > 0 ? 1 : 0) +
    (initial.verified ? 1 : 0) +
    initial.amenities.length;

  const filterBody = (
    <div className="space-y-6">
      {/* Dates (disponibilite) */}
      <div>
        <p className="mb-2 text-sm font-bold text-foreground">Dates du séjour</p>
        <div className="flex items-center gap-3">
          <label className="flex-1">
            <span className="mb-1 block text-2xs font-bold uppercase text-muted">Arrivée</span>
            <input
              type="date"
              value={draft.checkin}
              onChange={(e) => setDraft({ ...draft, checkin: e.target.value })}
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm focus-visible:border-brand-400 focus-visible:outline-none"
            />
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-2xs font-bold uppercase text-muted">Départ</span>
            <input
              type="date"
              value={draft.checkout}
              min={draft.checkin || undefined}
              onChange={(e) => setDraft({ ...draft, checkout: e.target.value })}
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm focus-visible:border-brand-400 focus-visible:outline-none"
            />
          </label>
        </div>
        {(draft.checkin || draft.checkout) && (
          <button
            type="button"
            onClick={() => setDraft({ ...draft, checkin: "", checkout: "" })}
            className="mt-1.5 text-xs font-semibold text-muted hover:text-foreground"
          >
            Effacer les dates
          </button>
        )}
      </div>

      {/* Ville */}
      <div>
        <p className="mb-2 text-sm font-bold text-foreground">Ville</p>
        <div className="flex flex-wrap gap-2">
          <Chip active={!draft.city} onClick={() => setDraft({ ...draft, city: "" })}>
            Toutes
          </Chip>
          {destinations.map((d) => (
            <Chip key={d.slug} active={draft.city === d.slug} onClick={() => setDraft({ ...draft, city: d.slug })}>
              {d.name}
            </Chip>
          ))}
        </div>
      </div>

      {/* Type */}
      <div>
        <p className="mb-2 text-sm font-bold text-foreground">Type de logement</p>
        <div className="flex flex-wrap gap-2">
          {STAY_TYPES.map((t) => (
            <Chip key={t.value} active={draft.type === t.value} onClick={() => setDraft({ ...draft, type: t.value })}>
              {t.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Prix */}
      <div>
        <p className="mb-2 text-sm font-bold text-foreground">Prix par nuit (F CFA)</p>
        <div className="flex items-center gap-3">
          <input
            type="number" inputMode="numeric" placeholder="Min" value={draft.minPrice}
            onChange={(e) => setDraft({ ...draft, minPrice: e.target.value })}
            className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm focus-visible:border-brand-400 focus-visible:outline-none"
          />
          <span className="text-muted">-</span>
          <input
            type="number" inputMode="numeric" placeholder="Max" value={draft.maxPrice}
            onChange={(e) => setDraft({ ...draft, maxPrice: e.target.value })}
            className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm focus-visible:border-brand-400 focus-visible:outline-none"
          />
        </div>
      </div>

      {/* Capacite */}
      <div className="border-t border-border pt-2">
        <Stepper label="Voyageurs" hint="Capacité minimum" value={draft.capacity} onChange={(v) => setDraft({ ...draft, capacity: v })} min={0} max={16} />
      </div>

      {/* Verifie */}
      <button
        type="button"
        onClick={() => setDraft({ ...draft, verified: !draft.verified })}
        className="flex w-full items-center justify-between border-t border-border pt-4"
      >
        <span className="text-sm font-bold text-foreground">Locations vérifiées uniquement</span>
        <span className={cn("relative h-6 w-11 rounded-full transition-colors", draft.verified ? "bg-brand-500" : "bg-border")}>
          <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", draft.verified ? "left-[22px]" : "left-0.5")} />
        </span>
      </button>

      {/* Equipements */}
      <div className="border-t border-border pt-4">
        <p className="mb-2 text-sm font-bold text-foreground">Équipements</p>
        <div className="grid grid-cols-2 gap-2">
          {AMENITIES.slice(0, 10).map((a) => (
            <button
              key={a.slug}
              type="button"
              onClick={() => toggleAmenity(a.slug)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                draft.amenities.includes(a.slug)
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-border hover:border-brand-300"
              )}
            >
              <span className={cn("flex h-4 w-4 items-center justify-center rounded border", draft.amenities.includes(a.slug) ? "border-brand-500 bg-brand-500 text-white" : "border-border")}>
                {draft.amenities.includes(a.slug) && <Check className="h-3 w-3" />}
              </span>
              {a.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Mobile : drawer filtres */}
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm" className="md:hidden">
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {activeCount > 0 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-2xs text-white">
                {activeCount}
              </span>
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="px-5 pb-6">
          <DrawerTitle className="px-1 pt-4 text-xl font-bold">Filtres</DrawerTitle>
          <div className="my-4 max-h-[60dvh] overflow-y-auto px-1">{filterBody}</div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { const reset = { city: "", type: "any", minPrice: "", maxPrice: "", capacity: 0, verified: false, amenities: [], sort: draft.sort, checkin: "", checkout: "" }; setDraft(reset); apply(reset); }}>
              Reinitialiser
            </Button>
            <DrawerClose asChild>
              <Button className="flex-1" onClick={() => apply(draft)}>Afficher {total} resultat{total > 1 ? "s" : ""}</Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Desktop : barre de filtres */}
      <div className="hidden flex-1 items-center gap-2 md:flex">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
              {activeCount > 0 && <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-2xs text-white">{activeCount}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="max-h-[70vh] w-[26rem] overflow-y-auto">
            {filterBody}
            <div className="mt-5 flex gap-3 border-t border-border pt-4">
              <Button variant="ghost" className="flex-1" onClick={() => { const reset = { city: "", type: "any", minPrice: "", maxPrice: "", capacity: 0, verified: false, amenities: [], sort: draft.sort, checkin: "", checkout: "" }; setDraft(reset); apply(reset); }}>Reinitialiser</Button>
              <Button className="flex-1" onClick={() => apply(draft)}>Appliquer</Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Toggle verifie rapide */}
        <Button
          variant={initial.verified ? "soft" : "outline"}
          size="sm"
          onClick={() => apply({ ...initial, verified: !initial.verified })}
        >
          <Check className="h-4 w-4" /> Vérifiées
        </Button>
      </div>

      {/* Tri */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Trier : {SORT_OPTIONS.find((s) => s.value === initial.sort)?.label}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-2">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => apply({ ...initial, sort: s.value })}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-surface-soft",
                initial.sort === s.value && "text-brand-700"
              )}
            >
              {s.label}
              {initial.sort === s.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border hover:border-brand-300"
      )}
    >
      {children}
    </button>
  );
}
