"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus, Trash2, Check, X, CalendarDays, ListChecks, Save, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { savePack, type PackInput } from "@/server/actions/packs";

interface PackEditorProps {
  destinations: { id: string; name: string }[];
  packId?: string;
  defaults: PackInput;
}

export function PackEditor({ destinations, packId, defaults }: PackEditorProps) {
  const router = useRouter();
  const [form, setForm] = React.useState<PackInput>(defaults);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, start] = React.useTransition();

  function set<K extends keyof PackInput>(key: K, value: PackInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  const num = (v: string) => (v === "" ? 0 : Math.max(0, Number(v)));

  // --- Inclus / non inclus ---
  const addItem = (included: boolean) =>
    setForm((f) => ({ ...f, includedItems: [...f.includedItems, { label: "", details: "", included }] }));
  const updateItem = (i: number, patch: Partial<PackInput["includedItems"][number]>) =>
    setForm((f) => ({ ...f, includedItems: f.includedItems.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) }));
  const removeItem = (i: number) =>
    setForm((f) => ({ ...f, includedItems: f.includedItems.filter((_, idx) => idx !== i) }));

  // --- Programme ---
  const addDay = () =>
    setForm((f) => ({ ...f, programDays: [...f.programDays, { title: "", description: "", activities: [] }] }));
  const updateDay = (di: number, patch: Partial<PackInput["programDays"][number]>) =>
    setForm((f) => ({ ...f, programDays: f.programDays.map((d, idx) => (idx === di ? { ...d, ...patch } : d)) }));
  const removeDay = (di: number) =>
    setForm((f) => ({ ...f, programDays: f.programDays.filter((_, idx) => idx !== di) }));
  const addActivity = (di: number) =>
    setForm((f) => ({ ...f, programDays: f.programDays.map((d, idx) => (idx === di ? { ...d, activities: [...d.activities, { timeLabel: "", title: "", description: "" }] } : d)) }));
  const updateActivity = (di: number, ai: number, patch: Partial<PackInput["programDays"][number]["activities"][number]>) =>
    setForm((f) => ({ ...f, programDays: f.programDays.map((d, idx) => (idx === di ? { ...d, activities: d.activities.map((a, aidx) => (aidx === ai ? { ...a, ...patch } : a)) } : d)) }));
  const removeActivity = (di: number, ai: number) =>
    setForm((f) => ({ ...f, programDays: f.programDays.map((d, idx) => (idx === di ? { ...d, activities: d.activities.filter((_, aidx) => aidx !== ai) } : d)) }));

  function submit() {
    setError(null);
    start(async () => {
      const res = await savePack({ ...form, id: packId });
      if (res && !res.ok) { setError(res.error ?? "Erreur."); toast.error(res.error ?? "Erreur."); }
      else if (res?.ok) { toast.success(res.message ?? "Enregistré."); router.refresh(); }
      // En creation, l'action redirige automatiquement.
    });
  }

  const included = form.includedItems.filter((i) => i.included);
  const notIncluded = form.includedItems.filter((i) => !i.included);

  return (
    <div className="space-y-8">
      {/* Informations */}
      <Section title="Informations générales">
        <Field label="Nom du pack" required className="sm:col-span-2">
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Pack Découverte Daloa" />
        </Field>
        <Field label="Destination">
          <select value={form.destinationId ?? ""} onChange={(e) => set("destinationId", e.target.value || null)} className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] focus-visible:border-brand-400 focus-visible:outline-none">
            <option value="">— Aucune —</option>
            {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="Statut">
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] focus-visible:border-brand-400 focus-visible:outline-none">
            <option value="PUBLISHED">Publié</option>
            <option value="UNPUBLISHED">Dépublié</option>
            <option value="DRAFT">Brouillon</option>
          </select>
        </Field>
        <Field label="Sous-titre" className="sm:col-span-2">
          <Input value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} placeholder="2 jours / 1 nuit - 2 personnes" />
        </Field>
        <Field label="Description" required className="sm:col-span-2">
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="Présentez le pack, son ambiance, ce qu'il offre..." />
        </Field>
      </Section>

      {/* Durée & personnes */}
      <Section title="Durée & personnes">
        <Field label="Jours"><Input type="number" min={1} value={form.durationDays} onChange={(e) => set("durationDays", num(e.target.value))} /></Field>
        <Field label="Nuits"><Input type="number" min={0} value={form.durationNights} onChange={(e) => set("durationNights", num(e.target.value))} /></Field>
        <Field label="Personnes (base)"><Input type="number" min={1} value={form.basePersons} onChange={(e) => set("basePersons", num(e.target.value))} /></Field>
        <Field label="Personnes (max)"><Input type="number" min={1} value={form.maxPersons} onChange={(e) => set("maxPersons", num(e.target.value))} /></Field>
      </Section>

      {/* Tarifs */}
      <Section title="Tarifs (F CFA)">
        <Field label="Prix du pack" required><Input type="number" min={0} step={1000} value={form.price} onChange={(e) => set("price", num(e.target.value))} placeholder="100000" /></Field>
        <Field label="Prix par personne supplémentaire"><Input type="number" min={0} step={1000} value={form.extraPersonPrice} onChange={(e) => set("extraPersonPrice", num(e.target.value))} placeholder="35000" /></Field>
      </Section>

      {/* Inclus / non inclus */}
      <div>
        <h3 className="mb-1 flex items-center gap-2 font-bold text-foreground"><ListChecks className="h-5 w-5 text-brand-600" /> Inclus & non inclus</h3>
        <p className="mb-3 text-sm text-muted">Listez ce qui est compris dans le pack et ce qui ne l'est pas.</p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ItemColumn
            title="Inclus" tone="success"
            items={included}
            onChange={(globalIndex, patch) => updateItem(globalIndex, patch)}
            onRemove={(globalIndex) => removeItem(globalIndex)}
            indexMap={form.includedItems.map((it, idx) => ({ it, idx })).filter((x) => x.it.included).map((x) => x.idx)}
            onAdd={() => addItem(true)}
          />
          <ItemColumn
            title="Non inclus" tone="muted"
            items={notIncluded}
            onChange={(globalIndex, patch) => updateItem(globalIndex, patch)}
            onRemove={(globalIndex) => removeItem(globalIndex)}
            indexMap={form.includedItems.map((it, idx) => ({ it, idx })).filter((x) => !x.it.included).map((x) => x.idx)}
            onAdd={() => addItem(false)}
          />
        </div>
      </div>

      {/* Programme */}
      <div>
        <h3 className="mb-1 flex items-center gap-2 font-bold text-foreground"><CalendarDays className="h-5 w-5 text-brand-600" /> Programme jour par jour</h3>
        <p className="mb-3 text-sm text-muted">Ajoutez les journées et leurs activités.</p>

        <div className="space-y-4">
          {form.programDays.map((day, di) => (
            <div key={di} className="rounded-3xl border border-border bg-surface-soft/40 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">{di + 1}</span>
                <Input value={day.title} onChange={(e) => updateDay(di, { title: e.target.value })} placeholder={`Titre du jour ${di + 1}`} className="bg-surface" />
                <button type="button" onClick={() => removeDay(di)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-danger hover:bg-red-50" aria-label="Supprimer le jour"><Trash2 className="h-4 w-4" /></button>
              </div>
              <Textarea value={day.description ?? ""} onChange={(e) => updateDay(di, { description: e.target.value })} placeholder="Description de la journée (optionnel)" rows={2} className="mb-3 bg-surface" />

              <div className="space-y-2 border-l-2 border-border pl-3">
                {day.activities.map((act, ai) => (
                  <div key={ai} className="flex flex-wrap items-start gap-2 rounded-2xl bg-surface p-2.5">
                    <Input value={act.timeLabel ?? ""} onChange={(e) => updateActivity(di, ai, { timeLabel: e.target.value })} placeholder="Matin" className="h-10 w-28 shrink-0" />
                    <Input value={act.title} onChange={(e) => updateActivity(di, ai, { title: e.target.value })} placeholder="Activité" className="h-10 min-w-[8rem] flex-1" />
                    <button type="button" onClick={() => removeActivity(di, ai)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-red-50 hover:text-danger" aria-label="Supprimer l'activité"><X className="h-4 w-4" /></button>
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={() => addActivity(di)} className="text-brand-600"><Plus className="h-4 w-4" /> Ajouter une activité</Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addDay}><Plus className="h-4 w-4" /> Ajouter un jour</Button>
        </div>
      </div>

      {/* Infos pratiques */}
      <Section title="Informations pratiques">
        <Field label="Point de rendez-vous" className="sm:col-span-2"><Input value={form.meetingPoint ?? ""} onChange={(e) => set("meetingPoint", e.target.value)} placeholder="Communiqué après réservation" /></Field>
        <Field label="Heure de départ"><Input value={form.startTime ?? ""} onChange={(e) => set("startTime", e.target.value)} placeholder="08:00" /></Field>
        <Field label="Niveau physique"><Input value={form.physicalLevel ?? ""} onChange={(e) => set("physicalLevel", e.target.value)} placeholder="Accessible à tous" /></Field>
        <Field label="Tenue conseillée" className="sm:col-span-2"><Input value={form.clothingRecommendations ?? ""} onChange={(e) => set("clothingRecommendations", e.target.value)} placeholder="Tenue légère, chaussures de marche..." /></Field>
        <Field label="À apporter" className="sm:col-span-2"><Input value={form.documentsToBring ?? ""} onChange={(e) => set("documentsToBring", e.target.value)} placeholder="Pièce d'identité, confirmation..." /></Field>
        <Field label="Conditions d'annulation" className="sm:col-span-2"><Textarea value={form.cancellationPolicy ?? ""} onChange={(e) => set("cancellationPolicy", e.target.value)} rows={2} placeholder="Annulation gratuite jusqu'à 7 jours avant le départ..." /></Field>
      </Section>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="sticky bottom-[calc(var(--bottom-nav-h)+0.5rem)] z-10 flex items-center gap-3 rounded-2xl border border-border bg-surface/95 p-3 shadow-card backdrop-blur lg:bottom-4">
        <Button size="lg" loading={pending} onClick={submit}>
          <Save className="h-4 w-4" /> {packId ? "Enregistrer les modifications" : "Créer le pack"}
        </Button>
        <p className="hidden text-sm text-muted sm:block">{packId ? "Les modifications seront visibles immédiatement." : "Des images de couverture seront générées automatiquement."}</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-bold text-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function ItemColumn({
  title, tone, items, indexMap, onChange, onRemove, onAdd,
}: {
  title: string;
  tone: "success" | "muted";
  items: { label: string; details?: string; included: boolean }[];
  indexMap: number[];
  onChange: (globalIndex: number, patch: Partial<{ label: string; details: string }>) => void;
  onRemove: (globalIndex: number) => void;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-3xl border border-border p-4">
      <p className={cn("mb-3 flex items-center gap-1.5 text-sm font-bold", tone === "success" ? "text-success" : "text-muted")}>
        {tone === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />} {title}
      </p>
      <div className="space-y-2">
        {items.map((item, i) => {
          const globalIndex = indexMap[i];
          return (
            <div key={globalIndex} className="flex items-center gap-2">
              <Input value={item.label} onChange={(e) => onChange(globalIndex, { label: e.target.value })} placeholder="Élément" className="h-10" />
              <button type="button" onClick={() => onRemove(globalIndex)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-red-50 hover:text-danger" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-xs text-muted">Aucun élément.</p>}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onAdd} className="mt-2 text-brand-600"><Plus className="h-4 w-4" /> Ajouter</Button>
    </div>
  );
}
