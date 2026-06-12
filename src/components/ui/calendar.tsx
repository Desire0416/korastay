"use client";

import * as React from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  startOfToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface CalendarProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  numMonths?: number;
  minDate?: Date;
  disabledRanges?: { startDate: Date | string; endDate: Date | string }[];
  className?: string;
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

export function Calendar({
  value,
  onChange,
  numMonths = 1,
  minDate,
  disabledRanges = [],
  className,
}: CalendarProps) {
  const today = startOfToday();
  const floor = minDate ?? today;
  const [cursor, setCursor] = React.useState(() =>
    startOfMonth(value.start ?? floor)
  );

  const normalizedDisabled = React.useMemo(
    () =>
      disabledRanges.map((r) => ({
        start: new Date(r.startDate),
        end: new Date(r.endDate),
      })),
    [disabledRanges]
  );

  function isDisabled(day: Date) {
    if (isBefore(day, floor)) return true;
    return normalizedDisabled.some((r) =>
      isWithinInterval(day, { start: r.start, end: r.end })
    );
  }

  function dayInRange(day: Date) {
    if (value.start && value.end) {
      return isWithinInterval(day, { start: value.start, end: value.end });
    }
    return false;
  }

  function handleSelect(day: Date) {
    if (isDisabled(day)) return;
    const { start, end } = value;
    if (!start || (start && end)) {
      onChange({ start: day, end: null });
    } else if (isBefore(day, start)) {
      onChange({ start: day, end: null });
    } else if (isSameDay(day, start)) {
      onChange({ start: day, end: null });
    } else {
      // Verifie qu'aucune date indisponible n'est dans l'intervalle
      const conflict = normalizedDisabled.some(
        (r) => isBefore(start, r.end) && isBefore(r.start, day)
      );
      if (conflict) {
        onChange({ start: day, end: null });
      } else {
        onChange({ start, end: day });
      }
    }
  }

  function renderMonth(offset: number) {
    const monthDate = addMonths(cursor, offset);
    const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

    return (
      <div key={offset} className="w-full">
        <div className="mb-3 text-center text-sm font-bold text-foreground">
          {MONTHS[monthDate.getMonth()]} {monthDate.getFullYear()}
        </div>
        <div className="mb-1 grid grid-cols-7">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="py-1 text-center text-2xs font-semibold text-muted">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day) => {
            const inMonth = isSameMonth(day, monthDate);
            const disabled = isDisabled(day);
            const isStart = value.start && isSameDay(day, value.start);
            const isEnd = value.end && isSameDay(day, value.end);
            const inRange = dayInRange(day);
            const selected = isStart || isEnd;

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "relative flex justify-center",
                  inRange && !selected && "bg-brand-50",
                  isStart && value.end && "rounded-l-full bg-brand-50",
                  isEnd && "rounded-r-full bg-brand-50"
                )}
              >
                <button
                  type="button"
                  disabled={disabled || !inMonth}
                  onClick={() => handleSelect(day)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                    !inMonth && "invisible",
                    disabled && inMonth && "text-muted/40 line-through",
                    !disabled && inMonth && !selected && !inRange && "text-foreground hover:bg-surface-soft",
                    inRange && !selected && "text-brand-700",
                    selected && "bg-brand-500 font-bold text-white hover:bg-brand-600"
                  )}
                >
                  {day.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const canGoBack = isAfter(startOfMonth(cursor), startOfMonth(floor));

  return (
    <div className={cn("select-none", className)}>
      <div className="relative mb-1 flex items-center justify-between">
        <button
          type="button"
          aria-label="Mois précédent"
          disabled={!canGoBack}
          onClick={() => setCursor(addMonths(cursor, -1))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-soft disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Mois suivant"
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-soft"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div
        className={cn(
          "grid gap-6",
          numMonths > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
        )}
      >
        {Array.from({ length: numMonths }).map((_, i) => renderMonth(i))}
      </div>
    </div>
  );
}
