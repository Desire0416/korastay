"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Star, ChevronDown, Handshake } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose, DrawerTitle } from "@/components/ui/drawer";
import { Calendar, type DateRange } from "@/components/ui/calendar";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDateShort, cn } from "@/lib/utils";
import { computeResidencePrice, computeNegotiatedPrice } from "@/lib/pricing";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";

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
  const dict = useI18n();
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

  // Negociation : actif pour 2+ nuits
  const isNegotiationMode = !!price && price.nights >= 2;
  const [proposedAmount, setProposedAmount] = React.useState<number>(0);
  // Synchro montant propose avec le sous-total de base quand les dates changent
  React.useEffect(() => {
    if (price) setProposedAmount(price.subtotal);
  }, [price?.subtotal]);

  const negotiatedPreview = isNegotiationMode && proposedAmount > 0
    ? computeNegotiatedPrice({
        negotiatedSubtotal: proposedAmount,
        cleaningFee: cleaning ? props.cleaningFee : 0,
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
    if (isNegotiationMode) {
      params.set("proposedAmount", String(proposedAmount));
      params.set("mode", "negotiate");
    }
    router.push(`${localePath(`/residences/${props.slug}/reserver`, dict.locale)}?${params.toString()}`);
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
        <span className="font-medium text-foreground">{dict.booking.addCleaning}</span>
      </span>
      <span className="font-semibold text-foreground">+{formatPrice(props.cleaningFee)}</span>
    </label>
  );

  const guestsLabel = `${adults + children} ${adults + children > 1 ? dict.search.travelerPlural : dict.search.travelerSingular}`;
  const datesLabel = hasRange
    ? `${formatDateShort(range.start!)} - ${formatDateShort(range.end!)}`
    : dict.booking.addDates;

  // Section prix fixe (1 nuit)
  const priceRows = price && !isNegotiationMode && (
    <div className="space-y-2.5 text-sm">
      <div className="flex justify-between text-muted">
        <span className="underline-offset-2 hover:underline">
          {formatPrice(props.pricePerNight)} x {price.nights} {price.nights > 1 ? dict.booking.nightPlural : dict.booking.nightSingular}
        </span>
        <span className="text-foreground">{formatPrice(price.subtotal)}</span>
      </div>
      {price.cleaningFee > 0 && (
        <div className="flex justify-between text-muted">
          <span>{dict.booking.cleaningFee}</span>
          <span className="text-foreground">{formatPrice(price.cleaningFee)}</span>
        </div>
      )}
      <div className="flex justify-between text-muted">
        <span>{dict.booking.serviceFee}</span>
        <span className="text-foreground">{formatPrice(price.serviceFee)}</span>
      </div>
      {price.stayDiscount > 0 && (
        <div className="flex justify-between font-semibold text-success">
          <span>{dict.booking.stayDiscount.replace("{p}", String(Math.round(price.stayDiscountRate * 100)))}</span>
          <span>−{formatPrice(price.stayDiscount)}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-foreground">
        <span>{dict.booking.total}</span>
        <span>{formatPrice(price.total)}</span>
      </div>
    </div>
  );

  // Section négociation (2+ nuits)
  const negotiateSection = isNegotiationMode && (
    <div className="space-y-3 rounded-2xl border border-brand-200 bg-brand-50/40 p-4">
      <div className="flex items-center gap-2">
        <Handshake className="h-4 w-4 text-brand-600" />
        <span className="text-sm font-bold text-brand-900">{dict.booking.negotiateTitle}</span>
      </div>
      <p className="text-xs text-brand-800/80">{dict.booking.negotiateHint}</p>
      <div>
        <p className="mb-1 text-xs text-muted">
          {dict.booking.referencePrice} : {formatPrice(props.pricePerNight)} × {price.nights} {price.nights > 1 ? dict.booking.nightPlural : dict.booking.nightSingular} = {formatPrice(price.subtotal)}
        </p>
        <div className="flex items-center gap-2 rounded-xl border border-brand-300 bg-white px-3 py-2">
          <input
            type="number"
            min={1}
            step={500}
            value={proposedAmount || ""}
            onChange={(e) => setProposedAmount(Math.max(0, Number(e.target.value)))}
            placeholder={String(price.subtotal)}
            className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted"
          />
          <span className="shrink-0 text-xs font-medium text-muted">FCFA</span>
        </div>
      </div>
      {negotiatedPreview && (
        <div className="space-y-1.5 text-xs text-muted">
          {negotiatedPreview.cleaningFee > 0 && (
            <div className="flex justify-between">
              <span>{dict.booking.cleaningFee}</span>
              <span className="text-foreground">{formatPrice(negotiatedPreview.cleaningFee)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>{dict.booking.serviceFee}</span>
            <span className="text-foreground">{formatPrice(negotiatedPreview.serviceFee)}</span>
          </div>
          <div className="flex justify-between border-t border-brand-200 pt-1.5 text-sm font-bold text-foreground">
            <span>{dict.booking.estimatedTotal}</span>
            <span>{formatPrice(negotiatedPreview.total)}</span>
          </div>
        </div>
      )}
      <p className="text-xs text-muted">{dict.booking.negotiate24h}</p>
    </div>
  );

  const guestPopover = (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3 text-left text-sm">
          <span>
            <span className="block text-2xs font-bold uppercase text-muted">{dict.search.guests}</span>
            <span className="font-semibold text-foreground">{guestsLabel}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <Stepper label={dict.search.adults} value={adults} onChange={setAdults} min={1} max={props.maxCapacity} />
        <Stepper label={dict.search.children} hint={dict.search.childrenHint} value={children} onChange={setChildren} max={props.maxCapacity} />
        <p className="mt-2 text-xs text-muted">{dict.booking.maxCapacity.replace("{n}", String(props.maxCapacity))}</p>
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
            <span className="text-muted"> {dict.card.perNight}</span>
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
                  <span className="block text-2xs font-bold uppercase text-muted">{dict.search.dates}</span>
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

        <Button
          onClick={reserve}
          disabled={!hasRange || (isNegotiationMode && proposedAmount < 1)}
          size="lg"
          className="mt-4 w-full"
        >
          {!hasRange
            ? dict.booking.selectDates
            : isNegotiationMode
              ? dict.booking.sendOffer
              : dict.booking.reserve}
        </Button>
        <p className="mt-2 text-center text-xs text-muted">
          {isNegotiationMode ? dict.booking.negotiate24h : dict.booking.noChargeYet}
        </p>

        {price && <div className="mt-5">{negotiateSection ?? priceRows}</div>}
      </div>

      {/* ===== Mobile : barre collante ===== */}
      <div className="safe-bottom fixed inset-x-0 bottom-[var(--bottom-nav-h)] z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-extrabold text-foreground">
              {formatPrice(props.pricePerNight)}
              <span className="text-sm font-normal text-muted"> {dict.card.perNight}</span>
            </p>
            {hasRange ? (
              <p className="text-xs text-muted">{datesLabel} - {guestsLabel}</p>
            ) : (
              props.ratingCount > 0 && (
                <p className="flex items-center gap-1 text-xs text-muted">
                  <Star className="h-3 w-3 fill-gold-500 text-gold-500" />
                  {props.ratingAverage.toFixed(1)} ({props.ratingCount} {dict.residenceDetail.reviewsWord})
                </p>
              )
            )}
          </div>
          <Drawer>
            <DrawerTrigger asChild>
              <Button size="lg">{dict.booking.reserve}</Button>
            </DrawerTrigger>
            <DrawerContent className="px-5 pb-6">
              <DrawerTitle className="px-1 pt-4 text-xl font-bold">{dict.booking.yourStay}</DrawerTitle>
              <div className="my-4 max-h-[64dvh] space-y-5 overflow-y-auto px-1">
                <div className="rounded-3xl border border-border p-3">
                  <Calendar value={range} onChange={setRange} numMonths={1} disabledRanges={props.disabledRanges} />
                </div>
                <div className="divide-y divide-border rounded-3xl border border-border px-4">
                  <Stepper label={dict.search.adults} value={adults} onChange={setAdults} min={1} max={props.maxCapacity} />
                  <Stepper label={dict.search.children} hint={dict.search.childrenHint} value={children} onChange={setChildren} max={props.maxCapacity} />
                </div>
                {cleaningToggle}
              </div>
              {negotiateSection && <div className="px-1 pb-3">{negotiateSection}</div>}
              {price && !isNegotiationMode && <div className="rounded-3xl bg-surface-soft p-4">{priceRows}</div>}
              <DrawerClose asChild>
                <Button
                  onClick={reserve}
                  disabled={!hasRange || (isNegotiationMode && proposedAmount < 1)}
                  size="lg"
                  className="w-full"
                >
                  {!hasRange
                    ? dict.booking.selectDates
                    : isNegotiationMode
                      ? `${dict.booking.sendOffer} — ${negotiatedPreview ? formatPrice(negotiatedPreview.total) : ""}`.trim()
                      : `${dict.booking.reserve} - ${formatPrice(price!.total)}`}
                </Button>
              </DrawerClose>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </>
  );
}
