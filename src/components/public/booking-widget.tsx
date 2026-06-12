"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Star, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose, DrawerTitle } from "@/components/ui/drawer";
import { Calendar, type DateRange } from "@/components/ui/calendar";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDateShort, cn } from "@/lib/utils";
import { computeResidencePrice } from "@/lib/pricing";

interface BookingWidgetProps {
  residenceId: string;
  slug: string;
  pricePerNight: number;
  cleaningFee: number;
  maxCapacity: number;
  ratingAverage: number;
  ratingCount: number;
  disabledRanges: { startDate: string; endDate: string }[];
}

export function BookingWidget(props: BookingWidgetProps) {
  const router = useRouter();
  const [range, setRange] = React.useState<DateRange>({ start: null, end: null });
  const [adults, setAdults] = React.useState(2);
  const [children, setChildren] = React.useState(0);
  const [cleaning, setCleaning] = React.useState(false);

  const hasRange = range.start && range.end;
  const price = hasRange
    ? computeResidencePrice({
        pricePerNight: props.pricePerNight,
        cleaningFee: cleaning ? props.cleaningFee : 0,
        startDate: range.start!,
        endDate: range.end!,
      })
    : null;

  function reserve() {
    if (!hasRange) return;
    const params = new URLSearchParams({
      checkin: range.start!.toISOString().slice(0, 10),
      checkout: range.end!.toISOString().slice(0, 10),
      adults: String(adults),
      children: String(children),
      cleaning: cleaning ? "1" : "0",
    });
    router.push(`/residences/${props.slug}/reserver?${params.toString()}`);
  }

  const cleaningToggle = props.cleaningFee > 0 && (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3 text-sm">
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={cleaning}
          onChange={(e) => setCleaning(e.target.checked)}
          className="h-5 w-5 rounded border-border text-brand-500 focus:ring-brand-400"
        />
        <span className="font-medium text-foreground">Ajouter le ménage</span>
      </span>
      <span className="font-semibold text-foreground">+{formatPrice(props.cleaningFee)}</span>
    </label>
  );

  const guestsLabel = `${adults + children} voyageur${adults + children > 1 ? "s" : ""}`;
  const datesLabel = hasRange
    ? `${formatDateShort(range.start!)} - ${formatDateShort(range.end!)}`
    : "Ajouter des dates";

  const priceRows = price && (
    <div className="space-y-2.5 text-sm">
      <div className="flex justify-between text-muted">
        <span className="underline-offset-2 hover:underline">
          {formatPrice(props.pricePerNight)} x {price.nights} nuit{price.nights > 1 ? "s" : ""}
        </span>
        <span className="text-foreground">{formatPrice(price.subtotal)}</span>
      </div>
      {price.cleaningFee > 0 && (
        <div className="flex justify-between text-muted">
          <span>Frais de ménage</span>
          <span className="text-foreground">{formatPrice(price.cleaningFee)}</span>
        </div>
      )}
      <div className="flex justify-between text-muted">
        <span>Frais de service KoraStay</span>
        <span className="text-foreground">{formatPrice(price.serviceFee)}</span>
      </div>
      <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-foreground">
        <span>Total</span>
        <span>{formatPrice(price.total)}</span>
      </div>
    </div>
  );

  const guestPopover = (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3 text-left text-sm">
          <span>
            <span className="block text-2xs font-bold uppercase text-muted">Voyageurs</span>
            <span className="font-semibold text-foreground">{guestsLabel}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <Stepper label="Adultes" value={adults} onChange={setAdults} min={1} max={props.maxCapacity} />
        <Stepper label="Enfants" hint="Moins de 12 ans" value={children} onChange={setChildren} max={props.maxCapacity} />
        <p className="mt-2 text-xs text-muted">Capacité maximum : {props.maxCapacity} voyageurs.</p>
      </PopoverContent>
    </Popover>
  );

  return (
    <>
      {/* ===== Desktop : carte sticky ===== */}
      <div className="hidden rounded-3xl border border-border bg-surface p-6 shadow-card lg:block">
        <div className="flex items-baseline justify-between">
          <p>
            <span className="text-2xl font-extrabold text-foreground">{formatPrice(props.pricePerNight)}</span>
            <span className="text-muted"> / nuit</span>
          </p>
          {props.ratingCount > 0 && (
            <span className="flex items-center gap-1 text-sm font-semibold">
              <Star className="h-4 w-4 fill-gold-500 text-gold-500" />
              {props.ratingAverage.toFixed(1)}
              <span className="text-muted">({props.ratingCount})</span>
            </span>
          )}
        </div>

        <div className="mt-4 space-y-2.5">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3 text-left text-sm">
                <span>
                  <span className="block text-2xs font-bold uppercase text-muted">Dates</span>
                  <span className={cn("font-semibold", hasRange ? "text-foreground" : "text-muted")}>{datesLabel}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto">
              <Calendar value={range} onChange={setRange} numMonths={2} disabledRanges={props.disabledRanges} className="w-[34rem] max-w-[80vw]" />
            </PopoverContent>
          </Popover>
          {guestPopover}
          {cleaningToggle}
        </div>

        <Button onClick={reserve} disabled={!hasRange} size="lg" className="mt-4 w-full">
          {hasRange ? "Réserver" : "Sélectionnez vos dates"}
        </Button>
        <p className="mt-2 text-center text-xs text-muted">Aucun montant ne sera debite a cette étape.</p>

        {price && <div className="mt-5">{priceRows}</div>}
      </div>

      {/* ===== Mobile : barre collante ===== */}
      <div className="safe-bottom fixed inset-x-0 bottom-[var(--bottom-nav-h)] z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-extrabold text-foreground">
              {formatPrice(props.pricePerNight)}
              <span className="text-sm font-normal text-muted"> / nuit</span>
            </p>
            {hasRange ? (
              <p className="text-xs text-muted">{datesLabel} - {guestsLabel}</p>
            ) : (
              props.ratingCount > 0 && (
                <p className="flex items-center gap-1 text-xs text-muted">
                  <Star className="h-3 w-3 fill-gold-500 text-gold-500" />
                  {props.ratingAverage.toFixed(1)} ({props.ratingCount} avis)
                </p>
              )
            )}
          </div>
          <Drawer>
            <DrawerTrigger asChild>
              <Button size="lg">Réserver</Button>
            </DrawerTrigger>
            <DrawerContent className="px-5 pb-6">
              <DrawerTitle className="px-1 pt-4 text-xl font-bold">Votre séjour</DrawerTitle>
              <div className="my-4 max-h-[64dvh] space-y-5 overflow-y-auto px-1">
                <div className="rounded-3xl border border-border p-3">
                  <Calendar value={range} onChange={setRange} numMonths={1} disabledRanges={props.disabledRanges} />
                </div>
                <div className="divide-y divide-border rounded-3xl border border-border px-4">
                  <Stepper label="Adultes" value={adults} onChange={setAdults} min={1} max={props.maxCapacity} />
                  <Stepper label="Enfants" hint="Moins de 12 ans" value={children} onChange={setChildren} max={props.maxCapacity} />
                </div>
                {cleaningToggle}
                {price && <div className="rounded-3xl bg-surface-soft p-4">{priceRows}</div>}
              </div>
              <DrawerClose asChild>
                <Button onClick={reserve} disabled={!hasRange} size="lg" className="w-full">
                  {hasRange ? `Réserver - ${formatPrice(price!.total)}` : "Sélectionnez vos dates"}
                </Button>
              </DrawerClose>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </>
  );
}
