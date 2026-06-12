"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarOff, Trash2, Lock, Plus } from "lucide-react";
import { Calendar, type DateRange } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { addAvailabilityBlock, removeAvailabilityBlock } from "@/server/actions/owner";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";

interface Block { id: string; startDate: string; endDate: string; reason: string | null }
interface Booking { startDate: string; endDate: string; reference: string; guestName: string }
interface Residence { id: string; name: string; blocks: Block[]; bookings: Booking[] }

export function AvailabilityManager({ residences }: { residences: Residence[] }) {
  const router = useRouter();
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
    if (!range.start || !range.end) { toast.error("Sélectionnez une periode."); return; }
    const fd = new FormData();
    fd.set("residenceId", activeId);
    fd.set("startDate", range.start.toISOString());
    fd.set("endDate", range.end.toISOString());
    fd.set("reason", reason || "Indisponible");
    start(async () => {
      const res = await addAvailabilityBlock(fd);
      if (res.ok) { toast.success("Periode bloquée."); setRange({ start: null, end: null }); setReason(""); router.refresh(); }
      else toast.error(res.error ?? "Erreur.");
    });
  }

  return (
    <div>
      {/* Selecteur de residence */}
      {residences.length > 1 && (
        <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
          {residences.map((r) => (
            <button key={r.id} onClick={() => setActiveId(r.id)} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors", activeId === r.id ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border")}>
              {r.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Calendrier + blocage */}
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
          <h3 className="mb-3 font-bold text-foreground">Bloquer une periode</h3>
          <div className="rounded-2xl border border-border p-3">
            <Calendar value={range} onChange={setRange} numMonths={1} disabledRanges={disabledRanges} />
          </div>
          <div className="mt-4 space-y-3">
            <Field label="Motif (optionnel)">
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Maintenance, usage personnel..." />
            </Field>
            <Button onClick={block} loading={pending} disabled={!range.start || !range.end} className="w-full">
              <Lock className="h-4 w-4" /> Bloquer ces dates
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted">Les dates réservées (clients) ne peuvent pas être debloquees ici.</p>
        </div>

        {/* Listes */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <h3 className="mb-3 font-bold text-foreground">Réservations confirmées</h3>
            {active.bookings.length === 0 ? (
              <p className="text-sm text-muted">Aucune réservation a venir.</p>
            ) : (
              <ul className="space-y-2">
                {active.bookings.map((b, i) => (
                  <li key={i} className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm">
                    <span className="font-medium text-foreground">{formatDate(b.startDate)} - {formatDate(b.endDate)}</span>
                    <span className="text-xs text-muted">{b.guestName}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <h3 className="mb-3 font-bold text-foreground">Periodes bloquées</h3>
            {active.blocks.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted"><CalendarOff className="h-4 w-4" /> Aucun blocage manuel.</div>
            ) : (
              <ul className="space-y-2">
                {active.blocks.map((b) => (
                  <li key={b.id} className="flex items-center justify-between rounded-xl bg-surface-soft px-3 py-2 text-sm">
                    <span>
                      <span className="font-medium text-foreground">{formatDate(b.startDate)} - {formatDate(b.endDate)}</span>
                      {b.reason && <span className="ml-2 text-xs text-muted">({b.reason})</span>}
                    </span>
                    <button
                      onClick={() => start(async () => { await removeAvailabilityBlock(b.id); router.refresh(); })}
                      disabled={pending}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-danger hover:bg-red-50"
                      aria-label="Supprimer le blocage"
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
