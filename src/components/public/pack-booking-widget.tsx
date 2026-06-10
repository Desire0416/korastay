"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, CalendarDays } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose, DrawerTitle } from "@/components/ui/drawer";
import { Calendar, type DateRange } from "@/components/ui/calendar";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { computePackPrice } from "@/lib/pricing";

interface PackBookingWidgetProps {
  packId: string;
  slug: string;
  price: number;
  basePersons: number;
  maxPersons: number;
  extraPersonPrice: number;
}

export function PackBookingWidget(props: PackBookingWidgetProps) {
  const router = useRouter();
  const [range, setRange] = React.useState<DateRange>({ start: null, end: null });
  const [persons, setPersons] = React.useState(props.basePersons);

  const price = computePackPrice({
    basePrice: props.price,
    basePersons: props.basePersons,
    extraPersonPrice: props.extraPersonPrice,
    persons,
  });

  function reserve() {
    if (!range.start) return;
    const params = new URLSearchParams({
      startDate: range.start.toISOString().slice(0, 10),
      persons: String(persons),
    });
    router.push(`/packs/${props.slug}/reserver?${params.toString()}`);
  }

  const body = (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3 text-left text-sm">
            <span>
              <span className="block text-2xs font-bold uppercase text-muted">Date de depart</span>
              <span className={cn("font-semibold", range.start ? "text-foreground" : "text-muted")}>
                {range.start ? formatDate(range.start) : "Choisir une date"}
              </span>
            </span>
            <CalendarDays className="h-4 w-4 text-muted" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto">
          <Calendar value={range} onChange={(r) => setRange({ start: r.start, end: r.start })} numMonths={1} />
        </PopoverContent>
      </Popover>

      <div className="rounded-2xl border border-border px-4">
        <Stepper label="Voyageurs" value={persons} onChange={setPersons} min={1} max={props.maxPersons} />
      </div>

      <div className="space-y-2 rounded-2xl bg-surface-soft p-4 text-sm">
        <div className="flex justify-between text-muted">
          <span>Pack ({props.basePersons} pers.)</span>
          <span className="text-foreground">{formatPrice(props.price)}</span>
        </div>
        {price.extras > 0 && (
          <div className="flex justify-between text-muted">
            <span>Personnes supplementaires</span>
            <span className="text-foreground">{formatPrice(price.extras)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted">
          <span>Frais de service</span>
          <span className="text-foreground">{formatPrice(price.serviceFee)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base font-extrabold text-foreground">
          <span>Total</span><span>{formatPrice(price.total)}</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden rounded-3xl border border-border bg-surface p-6 shadow-card lg:block">
        <p className="mb-4">
          <span className="text-2xl font-extrabold text-foreground">{formatPrice(props.price)}</span>
          <span className="text-muted"> / pack</span>
        </p>
        <div className="space-y-3">{body}</div>
        <Button onClick={reserve} disabled={!range.start} size="lg" className="mt-4 w-full">
          {range.start ? "Reserver ce pack" : "Choisir une date"}
        </Button>
      </div>

      {/* Mobile : barre collante */}
      <div className="safe-bottom fixed inset-x-0 bottom-[var(--bottom-nav-h)] z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-base font-extrabold text-foreground">
            {formatPrice(props.price)}<span className="text-sm font-normal text-muted"> / pack</span>
          </p>
          <Drawer>
            <DrawerTrigger asChild><Button size="lg">Reserver</Button></DrawerTrigger>
            <DrawerContent className="px-5 pb-6">
              <DrawerTitle className="px-1 pt-4 text-xl font-bold">Reserver ce pack</DrawerTitle>
              <div className="my-4 space-y-3 px-1">{body}</div>
              <DrawerClose asChild>
                <Button onClick={reserve} disabled={!range.start} size="lg" className="w-full">
                  {range.start ? `Reserver - ${formatPrice(price.total)}` : "Choisir une date"}
                </Button>
              </DrawerClose>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </>
  );
}
