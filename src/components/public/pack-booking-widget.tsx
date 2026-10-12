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
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";

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
  const dict = useI18n();
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
    router.push(`${localePath(`/packs/${props.slug}/reserver`, dict.locale)}?${params.toString()}`);
  }

  const body = (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex w-full items-center justify-between rounded-xl border border-ink/15 px-4 py-3 text-left text-sm transition-colors hover:border-ink/35">
            <span>
              <span className="eyebrow block text-[9.5px] text-muted">{dict.packs.departureDate}</span>
              <span className={cn("font-semibold", range.start ? "text-foreground" : "text-muted")}>
                {range.start ? formatDate(range.start, dict.locale) : dict.packs.chooseDate}
              </span>
            </span>
            <CalendarDays className="h-4 w-4 text-muted" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto">
          <Calendar value={range} onChange={(r) => setRange({ start: r.start, end: r.start })} numMonths={1} />
        </PopoverContent>
      </Popover>

      <div className="rounded-xl border border-ink/15 px-4">
        <Stepper label={dict.search.guests} value={persons} onChange={setPersons} min={1} max={props.maxPersons} />
      </div>

      <div className="space-y-2 rounded-[1.25rem] bg-sand-50 p-4 text-sm ring-1 ring-inset ring-sand-200">
        <div className="flex justify-between text-muted">
          <span>{dict.packs.packLine.replace("{n}", String(props.basePersons))}</span>
          <span className="text-foreground">{formatPrice(props.price)}</span>
        </div>
        {price.extras > 0 && (
          <div className="flex justify-between text-muted">
            <span>{dict.packs.extraPersons}</span>
            <span className="text-foreground">{formatPrice(price.extras)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted">
          <span>{dict.booking.serviceFee}</span>
          <span className="text-foreground">{formatPrice(price.serviceFee)}</span>
        </div>
        <div className="flex items-baseline justify-between border-t border-sand-300 pt-2.5 font-bold text-foreground">
          <span>{dict.booking.total}</span><span className="font-display text-xl font-normal">{formatPrice(price.total)}</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <div className="relative hidden overflow-hidden rounded-[1.75rem] border border-border bg-surface p-7 pt-8 shadow-card lg:block">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 overflow-hidden">
          <div className="motif motif-kente text-terracotta/70" />
        </div>
        <p className="mb-6">
          <span className="font-display text-[2rem] leading-none text-foreground">{formatPrice(props.price)}</span>
          <span className="text-muted"> {dict.packs.perPack}</span>
        </p>
        <div className="space-y-3">{body}</div>
        <Button onClick={reserve} disabled={!range.start} size="lg" className="mt-4 w-full">
          {range.start ? dict.packs.reservePack : dict.packs.chooseDate}
        </Button>
      </div>

      {/* Mobile : barre collante */}
      <div className="safe-bottom fixed inset-x-0 bottom-[var(--bottom-nav-h)] z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-xl leading-tight text-foreground">
            {formatPrice(props.price)}<span className="text-sm font-normal text-muted"> {dict.packs.perPack}</span>
          </p>
          <Drawer>
            <DrawerTrigger asChild><Button size="lg">{dict.booking.reserve}</Button></DrawerTrigger>
            <DrawerContent className="px-5 pb-6">
              <DrawerTitle className="px-1 pt-4 font-display text-2xl font-normal">{dict.packs.reservePack}</DrawerTitle>
              <div className="my-4 space-y-3 px-1">{body}</div>
              <DrawerClose asChild>
                <Button onClick={reserve} disabled={!range.start} size="lg" className="w-full">
                  {range.start ? `${dict.booking.reserve} - ${formatPrice(price.total)}` : dict.packs.chooseDate}
                </Button>
              </DrawerClose>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </>
  );
}
