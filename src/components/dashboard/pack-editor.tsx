"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Check, X, CalendarDays, ListChecks, Save, AlertCircle, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { useI18n } from "@/components/i18n/provider";
import { cn } from "@/lib/utils";
import { savePack, type PackInput } from "@/server/actions/packs";

interface PackEditorProps {
  destinations: { id: string; name: string }[];
  packId?: string;
  defaults: PackInput;
}

const panel = "rounded-[1.5rem] border border-border/80 bg-surface p-5 shadow-soft sm:p-7";

export function PackEditor({ destinations, packId, defaults }: PackEditorProps) {
  const router = useRouter();
  const dict = useI18n();
  const t = dict.dashAdmin.catalog.packEditor;
  const [form, setForm] = React.useState<PackInput>(defaults);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, start] = React.useTransition();

  function set<K extends keyof PackInput>(key: K, value: PackInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  const num = (v: string) => (v === "" ? 0 : Math.max(0, Number(v)));

  // --- Inclus / non inclus ---
  const addItem = (included: boolean) => setForm((f) => ({ ...f, includedItems: [...f.includedItems, { label: "", details: "", included }] }));
  const updateItem = (i: number, patch: Partial<PackInput["includedItems"][number]>) =>
    setForm((f) => ({ ...f, includedItems: f.includedItems.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) }));
  const removeItem = (i: number) => setForm((f) => ({ ...f, includedItems: f.includedItems.filter((_, idx) => idx !== i) }));

  // --- Programme ---
  const addDay = () => setForm((f) => ({ ...f, programDays: [...f.programDays, { title: "", description: "", activities: [] }] }));
  const updateDay = (di: number, patch: Partial<PackInput["programDays"][number]>) =>
    setForm((f) => ({ ...f, programDays: f.programDays.map((d, idx) => (idx === di ? { ...d, ...patch } : d)) }));
  const removeDay = (di: number) => setForm((f) => ({ ...f, programDays: f.programDays.filter((_, idx) => idx !== di) }));
  const addActivity = (di: number) =>
    setForm((f) => ({
      ...f,
      programDays: f.programDays.map((d, idx) => (idx === di ? { ...d, activities: [...d.activities, { timeLabel: "", title: "", description: "" }] } : d)),
    }));
  const updateActivity = (di: number, ai: number, patch: Partial<PackInput["programDays"][number]["activities"][number]>) =>
    setForm((f) => ({
      ...f,
      programDays: f.programDays.map((d, idx) =>
        idx === di ? { ...d, activities: d.activities.map((a, aidx) => (aidx === ai ? { ...a, ...patch } : a)) } : d
      ),
    }));
  const removeActivity = (di: number, ai: number) =>
    setForm((f) => ({
      ...f,
      programDays: f.programDays.map((d, idx) => (idx === di ? { ...d, activities: d.activities.filter((_, aidx) => aidx !== ai) } : d)),
    }));

  function submit() {
    setError(null);
    start(async () => {
      const res = await savePack({ ...form, id: packId });
      if (res && !res.ok) {
        setError(res.error ?? dict.dash.common.error);
        toast.error(res.error ?? dict.dash.common.error);
      } else if (res?.ok) {
        toast.success(res.message ?? t.saved);
        router.refresh();
      }
      // En creation, l'action redirige automatiquement.
    });
  }

  const included = form.includedItems.filter((i) => i.included);
  const notIncluded = form.includedItems.filter((i) => !i.included);

  return (
    <div className="space-y-6">
      {/* Informations */}
      <div className={panel}>
        <Section title={t.general}>
          <Field label={t.name} required className="sm:col-span-2">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={t.namePh} />
          </Field>
          <Field label={t.destination}>
            <NativeSelect value={form.destinationId ?? ""} onChange={(e) => set("destinationId", e.target.value || null)}>
              <option value="">{t.none}</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={t.status}>
            <NativeSelect value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="PUBLISHED">{t.statusPublished}</option>
              <option value="UNPUBLISHED">{t.statusUnpublished}</option>
              <option value="DRAFT">{t.statusDraft}</option>
            </NativeSelect>
          </Field>
          <Field label={t.subtitle} className="sm:col-span-2">
            <Input value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} placeholder={t.subtitlePh} />
          </Field>
          <Field label={t.description} required className="sm:col-span-2">
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder={t.descriptionPh} />
          </Field>
        </Section>

        <Section title={t.durationSection} cols={4} className="mt-8">
          <Field label={t.days}><Input type="number" min={1} value={form.durationDays} onChange={(e) => set("durationDays", num(e.target.value))} /></Field>
          <Field label={t.nights}><Input type="number" min={0} value={form.durationNights} onChange={(e) => set("durationNights", num(e.target.value))} /></Field>
          <Field label={t.basePersons}><Input type="number" min={1} value={form.basePersons} onChange={(e) => set("basePersons", num(e.target.value))} /></Field>
          <Field label={t.maxPersons}><Input type="number" min={1} value={form.maxPersons} onChange={(e) => set("maxPersons", num(e.target.value))} /></Field>
        </Section>

        <Section title={t.pricing} className="mt-8">
          <Field label={t.price} required>
            <Input type="number" min={0} step={1000} value={form.price} onChange={(e) => set("price", num(e.target.value))} placeholder="100000" />
          </Field>
          <Field label={t.extraPrice}>
            <Input type="number" min={0} step={1000} value={form.extraPersonPrice} onChange={(e) => set("extraPersonPrice", num(e.target.value))} placeholder="35000" />
          </Field>
        </Section>
      </div>

      {/* Inclus / non inclus */}
      <div className={panel}>
        <PanelTitle icon={ListChecks} title={t.includedTitle} text={t.includedText} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ItemColumn
            title={t.included}
            tone="success"
            items={included}
            onChange={(globalIndex, patch) => updateItem(globalIndex, patch)}
            onRemove={(globalIndex) => removeItem(globalIndex)}
            indexMap={form.includedItems.map((it, idx) => ({ it, idx })).filter((x) => x.it.included).map((x) => x.idx)}
            onAdd={() => addItem(true)}
            labels={t}
          />
          <ItemColumn
            title={t.notIncluded}
            tone="muted"
            items={notIncluded}
            onChange={(globalIndex, patch) => updateItem(globalIndex, patch)}
            onRemove={(globalIndex) => removeItem(globalIndex)}
            indexMap={form.includedItems.map((it, idx) => ({ it, idx })).filter((x) => !x.it.included).map((x) => x.idx)}
            onAdd={() => addItem(false)}
            labels={t}
          />
        </div>
      </div>

      {/* Programme */}
      <div className={panel}>
        <PanelTitle icon={CalendarDays} title={t.programTitle} text={t.programText} />
        <div className="space-y-4">
          {form.programDays.map((day, di) => (
            <div key={di} className="rounded-xl bg-sand-50 p-4 ring-1 ring-inset ring-sand-200">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-9 w-8 shrink-0 items-center justify-center rounded-arch-sm bg-ink font-display text-sm text-white">{di + 1}</span>
                <Input value={day.title} onChange={(e) => updateDay(di, { title: e.target.value })} placeholder={t.dayTitle.replace("{n}", String(di + 1))} />
                <button
                  type="button"
                  onClick={() => removeDay(di)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-danger transition-colors hover:bg-danger-50"
                  aria-label={t.removeDay}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <Textarea value={day.description ?? ""} onChange={(e) => updateDay(di, { description: e.target.value })} placeholder={t.dayDescription} rows={2} className="mb-3" />

              <div className="space-y-2 border-l-2 border-terracotta/30 pl-3">
                {day.activities.map((act, ai) => (
                  <div key={ai} className="flex flex-wrap items-start gap-2">
                    <Input value={act.timeLabel ?? ""} onChange={(e) => updateActivity(di, ai, { timeLabel: e.target.value })} placeholder={t.timePh} className="h-10 w-28 shrink-0" />
                    <Input value={act.title} onChange={(e) => updateActivity(di, ai, { title: e.target.value })} placeholder={t.activityPh} className="h-10 min-w-[8rem] flex-1" />
                    <button
                      type="button"
                      onClick={() => removeActivity(di, ai)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger-50 hover:text-danger"
                      aria-label={t.removeActivity}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={() => addActivity(di)} className="text-terracotta">
                  <Plus className="h-4 w-4" /> {t.addActivity}
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addDay}>
            <Plus className="h-4 w-4" /> {t.addDay}
          </Button>
        </div>
      </div>

      {/* Infos pratiques */}
      <div className={panel}>
        <Section title={t.practical}>
          <Field label={t.meetingPoint} className="sm:col-span-2">
            <Input value={form.meetingPoint ?? ""} onChange={(e) => set("meetingPoint", e.target.value)} placeholder={t.meetingPointPh} />
          </Field>
          <Field label={t.startTime}>
            <Input value={form.startTime ?? ""} onChange={(e) => set("startTime", e.target.value)} placeholder="08:00" />
          </Field>
          <Field label={t.physicalLevel}>
            <Input value={form.physicalLevel ?? ""} onChange={(e) => set("physicalLevel", e.target.value)} placeholder={t.physicalLevelPh} />
          </Field>
          <Field label={t.clothing} className="sm:col-span-2">
            <Input value={form.clothingRecommendations ?? ""} onChange={(e) => set("clothingRecommendations", e.target.value)} placeholder={t.clothingPh} />
          </Field>
          <Field label={t.toBring} className="sm:col-span-2">
            <Input value={form.documentsToBring ?? ""} onChange={(e) => set("documentsToBring", e.target.value)} placeholder={t.toBringPh} />
          </Field>
          <Field label={t.cancellation} className="sm:col-span-2">
            <Textarea value={form.cancellationPolicy ?? ""} onChange={(e) => set("cancellationPolicy", e.target.value)} rows={2} placeholder={t.cancellationPh} />
          </Field>
        </Section>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 ring-1 ring-inset ring-danger-200/70">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="sticky bottom-[calc(var(--bottom-nav-h)+0.5rem)] z-10 flex items-center gap-3 rounded-[1.25rem] border border-border/80 bg-surface/95 p-3 shadow-card backdrop-blur lg:bottom-4">
        <Button size="lg" loading={pending} onClick={submit}>
          <Save className="h-4 w-4" /> {packId ? t.saveChanges : t.create}
        </Button>
        <p className="hidden text-sm text-muted sm:block">{packId ? t.saveHint : t.createHint}</p>
      </div>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h3 className="mb-4 flex items-center gap-3 font-display text-xl text-foreground">
      {title}
      <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-sand-300 to-transparent" />
    </h3>
  );
}

function Section({ title, children, cols = 2, className }: { title: string; children: React.ReactNode; cols?: 2 | 4; className?: string }) {
  return (
    <div className={className}>
      <SectionHeading title={title} />
      <div className={cn("grid gap-4", cols === 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2")}>{children}</div>
    </div>
  );
}

function PanelTitle({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="mb-5">
      <h3 className="flex items-center gap-2.5 font-display text-xl text-foreground">
        <Icon className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {title}
      </h3>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </div>
  );
}

function ItemColumn({
  title,
  tone,
  items,
  indexMap,
  onChange,
  onRemove,
  onAdd,
  labels,
}: {
  title: string;
  tone: "success" | "muted";
  items: { label: string; details?: string; included: boolean }[];
  indexMap: number[];
  onChange: (globalIndex: number, patch: Partial<{ label: string; details: string }>) => void;
  onRemove: (globalIndex: number) => void;
  onAdd: () => void;
  labels: { item: string; noItem: string; add: string; remove: string };
}) {
  return (
    <div className={cn("rounded-xl p-4 ring-1 ring-inset", tone === "success" ? "bg-brand-50/60 ring-brand-200/70" : "bg-sand-50 ring-sand-200")}>
      <p className={cn("mb-3 flex items-center gap-1.5 text-sm font-bold", tone === "success" ? "text-brand-700" : "text-muted")}>
        {tone === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />} {title}
      </p>
      <div className="space-y-2">
        {items.map((item, i) => {
          const globalIndex = indexMap[i];
          return (
            <div key={globalIndex} className="flex items-center gap-2">
              <Input value={item.label} onChange={(e) => onChange(globalIndex, { label: e.target.value })} placeholder={labels.item} className="h-10" />
              <button
                type="button"
                onClick={() => onRemove(globalIndex)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger-50 hover:text-danger"
                aria-label={labels.remove}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-xs text-muted">{labels.noItem}</p>}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onAdd} className="mt-2 text-terracotta">
        <Plus className="h-4 w-4" /> {labels.add}
      </Button>
    </div>
  );
}
