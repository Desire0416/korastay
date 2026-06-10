"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, CalendarDays, Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Calendar, type DateRange } from "@/components/ui/calendar";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { cn, formatDateShort } from "@/lib/utils";
import { STAY_TYPES } from "@/lib/constants";

interface HeroSearchProps {
  destinations: { name: string; slug: string }[];
  variant?: "hero" | "compact";
  /** Declencheur mobile en pilule centree facon "Commencer ma recherche". */
  pill?: boolean;
}

export function HeroSearch({ destinations, variant = "hero", pill = false }: HeroSearchProps) {
  const router = useRouter();
  const [city, setCity] = React.useState<string>("");
  const [range, setRange] = React.useState<DateRange>({ start: null, end: null });
  const [adults, setAdults] = React.useState(2);
  const [children, setChildren] = React.useState(0);
  const [type, setType] = React.useState("any");

  const cityName = destinations.find((d) => d.slug === city)?.name;
  const guestsLabel = `${adults + children} voyageur${adults + children > 1 ? "s" : ""}`;
  const datesLabel =
    range.start && range.end
      ? `${formatDateShort(range.start)} - ${formatDateShort(range.end)}`
      : range.start
        ? `${formatDateShort(range.start)} - ...`
        : "Quand ?";

  function submit() {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (range.start) params.set("checkin", range.start.toISOString().slice(0, 10));
    if (range.end) params.set("checkout", range.end.toISOString().slice(0, 10));
    params.set("guests", String(adults + children));
    if (type !== "any") params.set("type", type);
    router.push(`/residences?${params.toString()}`);
  }

  // ---- Desktop -------------------------------------------------------------
  const desktop = (
    <div className="hidden w-full max-w-3xl items-stretch rounded-full border border-border bg-surface p-1.5 shadow-card md:flex">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex flex-1 flex-col items-start rounded-full px-5 py-2 text-left transition-colors hover:bg-surface-soft">
            <span className="text-2xs font-bold uppercase tracking-wide text-muted">Destination</span>
            <span className={cn("text-sm font-semibold", cityName ? "text-foreground" : "text-muted")}>
              {cityName ?? "Toutes les villes"}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="max-h-80 w-72 overflow-y-auto p-2">
          <button
            onClick={() => setCity("")}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-surface-soft"
          >
            <MapPin className="h-4 w-4 text-muted" /> Toutes les villes
          </button>
          {destinations.map((d) => (
            <button
              key={d.slug}
              onClick={() => setCity(d.slug)}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-surface-soft",
                city === d.slug && "bg-brand-50 text-brand-700"
              )}
            >
              <MapPin className="h-4 w-4 text-brand-500" /> {d.name}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      <span className="my-2 w-px bg-border" />

      <Popover>
        <PopoverTrigger asChild>
          <button className="flex flex-1 flex-col items-start rounded-full px-5 py-2 text-left transition-colors hover:bg-surface-soft">
            <span className="text-2xs font-bold uppercase tracking-wide text-muted">Dates</span>
            <span className={cn("text-sm font-semibold", range.start ? "text-foreground" : "text-muted")}>
              {datesLabel}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-auto">
          <Calendar value={range} onChange={setRange} numMonths={2} className="w-[36rem] max-w-[80vw]" />
        </PopoverContent>
      </Popover>

      <span className="my-2 w-px bg-border" />

      <Popover>
        <PopoverTrigger asChild>
          <button className="flex flex-1 flex-col items-start rounded-full px-5 py-2 text-left transition-colors hover:bg-surface-soft">
            <span className="text-2xs font-bold uppercase tracking-wide text-muted">Voyageurs</span>
            <span className="text-sm font-semibold text-foreground">{guestsLabel}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72">
          <Stepper label="Adultes" value={adults} onChange={setAdults} min={1} />
          <Stepper label="Enfants" hint="Moins de 12 ans" value={children} onChange={setChildren} />
        </PopoverContent>
      </Popover>

      <button
        onClick={submit}
        aria-label="Rechercher"
        className="ml-1 flex shrink-0 items-center gap-2 rounded-full bg-brand-500 px-6 font-semibold text-white shadow-soft transition-colors hover:bg-brand-600"
      >
        <Search className="h-5 w-5" />
        <span className="hidden lg:inline">Rechercher</span>
      </button>
    </div>
  );

  // ---- Mobile --------------------------------------------------------------
  const mobile = (
    <div className="w-full md:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          {pill ? (
            <button className="flex w-full items-center justify-center gap-2.5 rounded-full border border-border bg-surface px-5 py-3.5 text-center shadow-card active:scale-[0.99]">
              <Search className="h-[18px] w-[18px] text-foreground" />
              <span className="text-[15px] font-semibold text-foreground">
                {cityName ? (range.start ? `${cityName} · ${datesLabel}` : cityName) : "Commencer ma recherche"}
              </span>
            </button>
          ) : (
            <button className="flex w-full items-center gap-3 rounded-full border border-border bg-surface px-5 py-3.5 text-left shadow-card">
              <Search className="h-5 w-5 text-brand-500" />
              <span className="flex-1">
                <span className="block text-sm font-bold text-foreground">
                  {cityName ?? "Ou allez-vous ?"}
                </span>
                <span className="block text-xs text-muted">
                  {range.start ? datesLabel : "Dates - Voyageurs"}
                </span>
              </span>
            </button>
          )}
        </DrawerTrigger>
        <DrawerContent className="px-5 pb-8">
          <div className="overflow-y-auto px-1 pt-4">
            <h2 className="text-xl font-bold text-foreground">Rechercher un sejour</h2>

            <p className="mb-2 mt-5 text-sm font-bold text-foreground">Destination</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCity("")}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  !city ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border"
                )}
              >
                Toutes
              </button>
              {destinations.map((d) => (
                <button
                  key={d.slug}
                  onClick={() => setCity(d.slug)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    city === d.slug ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border"
                  )}
                >
                  {d.name}
                </button>
              ))}
            </div>

            <p className="mb-2 mt-6 text-sm font-bold text-foreground">Dates</p>
            <div className="rounded-3xl border border-border p-3">
              <Calendar value={range} onChange={setRange} numMonths={1} />
            </div>

            <p className="mb-1 mt-6 text-sm font-bold text-foreground">Voyageurs</p>
            <div className="divide-y divide-border rounded-3xl border border-border px-4">
              <Stepper label="Adultes" value={adults} onChange={setAdults} min={1} />
              <Stepper label="Enfants" hint="Moins de 12 ans" value={children} onChange={setChildren} />
            </div>
          </div>

          <DrawerClose asChild>
            <Button onClick={submit} size="lg" className="mt-5 w-full">
              <Search className="h-5 w-5" />
              Rechercher
            </Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    </div>
  );

  return (
    <div className={cn("w-full", variant === "hero" && "flex flex-col items-center")}>
      {desktop}
      {mobile}
      {variant === "hero" && (
        <div className="mt-4 hidden flex-wrap items-center justify-center gap-2 md:flex">
          {STAY_TYPES.filter((t) => t.value !== "any").map((t) => (
            <button
              key={t.value}
              onClick={() => setType(type === t.value ? "any" : t.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                type === t.value
                  ? "border-white bg-white text-brand-700"
                  : "border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
