"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarOff, Trash2, Lock, CalendarCheck } from "lucide-react";
import { Calendar, type DateRange } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { addAvailabilityBlock, removeAvailabilityBlock } from "@/server/actions/owner";
import { useI18n } from "@/components/i18n/provider";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";

interface Block { id: string; startDate: string; endDate: string; reason: string | null }
interface Booking { startDate: string; endDate: string; reference: string; guestName: string }
interface Residence { id: string; name: string; blocks: Block[]; bookings: Booking[] }

const panel = "rounded-[1.5rem] border border-border/80 bg-surface p-5 shadow-soft sm:p-6";
const panelTitle = "mb-4 flex items-center gap-2.5 font-display text-xl text-foreground";

export function AvailabilityManager({ residences }: { residences: Residence[] }) {
  const router = useRouter();
  const dict = useI18n();
  const t = dict.dashOwner.availability;
  const locale = dict.locale;
  const [activeId, setActiveId] = React.useState(residences[0]?.id ?? "");
  const [range, setRange] = React.useState<DateRange>({ start: null, end: null });
  const [reason, setReason] = React.useState("");
  const [pending, start] = React.useTransition();

  const active = residences.find((r) => r.id === activeId);
  if (!active) return null;

  const disabledRanges = [
    ...active.bookings.map((b) => ({ startDate: b.startDate, endDate: b.endDate })),
    ...active.blocks.map((b) => ({ startDate: b.startDate, endDate: b.endDate })),
  ];

  function block() {
    if (!range.start || !range.end) {
      toast.error(t.selectPeriod);
      return;
    }
    const fd = new FormData();
    fd.set("residenceId", activeId);
    fd.set("startDate", range.start.toISOString());
    fd.set("endDate", range.end.toISOString());
    fd.set("reason", reason || t.defaultReason);
    start(async () => {
      const res = await addAvailabilityBlock(fd);
      if (res.ok) {
        toast.success(t.blocked);
        setRange({ start: null, end: null });
        setReason("");
        router.refresh();
      } else toast.error(res.error ?? dict.dash.common.error);
    });
  }

  return (
    <div>
      {/* Selecteur de residence */}
      {residences.length > 1 && (
        <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
          {residences.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveId(r.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                activeId === r.id ? "border-ink bg-ink text-white" : "border-ink/15 bg-white text-foreground hover:border-ink/35"
              )}
            >
              {r.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Calendrier + blocage */}
        <div className={panel}>
          <h3 className={panelTitle}>
            <Lock className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.blockTitle}
          </h3>
          <div className="rounded-xl border border-border p-3">
            <Calendar value={range} onChange={setRange} numMonths={1} disabledRanges={disabledRanges} />
          </div>
          <div className="mt-4 space-y-3">
            <Field label={t.reason}>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t.reasonPlaceholder} />
            </Field>
            <Button onClick={block} loading={pending} disabled={!range.start || !range.end} className="w-full">
              <Lock className="h-4 w-4" /> {t.block}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted">{t.bookedNote}</p>
        </div>

        {/* Listes */}
        <div className="space-y-6">
          <div className={panel}>
            <h3 className={panelTitle}>
              <CalendarCheck className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.confirmedTitle}
            </h3>
            {active.bookings.length === 0 ? (
              <p className="text-sm text-muted">{t.noUpcoming}</p>
            ) : (
              <ul className="space-y-2">
                {active.bookings.map((b, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm ring-1 ring-inset ring-brand-200/60">
                    <span className="font-medium text-brand-900">{formatDate(b.startDate, locale)} – {formatDate(b.endDate, locale)}</span>
                    <span className="truncate text-xs text-brand-800/70">{b.guestName}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={panel}>
            <h3 className={panelTitle}>
              <CalendarOff className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.blockedTitle}
            </h3>
            {active.blocks.length === 0 ? (
              <p className="text-sm text-muted">{t.noBlocks}</p>
            ) : (
              <ul className="space-y-2">
                {active.blocks.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 rounded-xl bg-sand-50 px-3.5 py-2 text-sm ring-1 ring-inset ring-sand-200">
                    <span className="min-w-0">
                      <span className="font-medium text-foreground">{formatDate(b.startDate, locale)} – {formatDate(b.endDate, locale)}</span>
                      {b.reason && <span className="ml-2 text-xs text-muted">({b.reason})</span>}
                    </span>
                    <button
                      onClick={() => start(async () => { await removeAvailabilityBlock(b.id); router.refresh(); })}
                      disabled={pending}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-danger transition-colors hover:bg-danger-50"
                      aria-label={t.removeBlock}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
