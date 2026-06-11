"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { saveActivity, type ActivityResult } from "@/server/actions/activities";
import { activityCategoryMeta } from "@/lib/enums";

interface ActivityDefaults {
  name?: string; category?: string; city?: string; description?: string; shortDescription?: string;
  durationHours?: number; pricePerPerson?: number; minPersons?: number; maxPersons?: number;
  difficulty?: string; included?: string; meetingPoint?: string; isPublished?: boolean;
}

export function ActivityForm({ id, defaults = {}, destinations }: { id?: string; defaults?: ActivityDefaults; destinations: { name: string }[] }) {
  const action = saveActivity.bind(null, id ?? null);
  const [state, formAction, pending] = useActionState<ActivityResult, FormData>(action, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nom de l'activite" htmlFor="name" required className="sm:col-span-2">
          <Input id="name" name="name" defaultValue={defaults.name} placeholder="Randonnee au Mont Tonkpi" required />
        </Field>
        <Field label="Categorie" htmlFor="category" required>
          <select id="category" name="category" defaultValue={defaults.category ?? "EXCURSION"} className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] focus-visible:border-brand-400 focus-visible:outline-none">
            {Object.entries(activityCategoryMeta).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
          </select>
        </Field>
        <Field label="Ville" htmlFor="city" required>
          <input list="act-cities" id="city" name="city" defaultValue={defaults.city} placeholder="Man" required className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] focus-visible:border-brand-400 focus-visible:outline-none" />
          <datalist id="act-cities">{destinations.map((d) => <option key={d.name} value={d.name} />)}</datalist>
        </Field>
        <Field label="Duree (heures)" htmlFor="durationHours" required>
          <Input id="durationHours" name="durationHours" type="number" min={1} max={72} defaultValue={defaults.durationHours ?? 3} required />
        </Field>
        <Field label="Prix / personne (F CFA)" htmlFor="pricePerPerson" required>
          <Input id="pricePerPerson" name="pricePerPerson" type="number" min={0} step={500} defaultValue={defaults.pricePerPerson} placeholder="15000" required />
        </Field>
        <Field label="Participants min." htmlFor="minPersons" required>
          <Input id="minPersons" name="minPersons" type="number" min={1} defaultValue={defaults.minPersons ?? 1} required />
        </Field>
        <Field label="Participants max." htmlFor="maxPersons" required>
          <Input id="maxPersons" name="maxPersons" type="number" min={1} defaultValue={defaults.maxPersons ?? 10} required />
        </Field>
        <Field label="Niveau / difficulte" htmlFor="difficulty">
          <Input id="difficulty" name="difficulty" defaultValue={defaults.difficulty} placeholder="Facile, modere, sportif..." />
        </Field>
        <Field label="Point de rendez-vous" htmlFor="meetingPoint">
          <Input id="meetingPoint" name="meetingPoint" defaultValue={defaults.meetingPoint} placeholder="Devant l'hotel de ville" />
        </Field>
      </div>

      <Field label="Resume court" htmlFor="shortDescription" hint="Affiche dans le catalogue (facultatif).">
        <Input id="shortDescription" name="shortDescription" defaultValue={defaults.shortDescription} placeholder="Une journee inoubliable..." />
      </Field>
      <Field label="Description" htmlFor="description" required>
        <Textarea id="description" name="description" defaultValue={defaults.description} rows={5} placeholder="Decrivez le deroule, les points forts..." required />
      </Field>
      <Field label="Ce qui est inclus" htmlFor="included" hint="Un element par ligne.">
        <Textarea id="included" name="included" defaultValue={defaults.included} rows={4} placeholder={"Transport\nGuide certifie\nEntree des sites\nCollation"} />
      </Field>

      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input type="checkbox" name="isPublished" defaultChecked={defaults.isPublished} className="h-4 w-4 rounded border-border text-brand-500" />
        Publier (visible dans le catalogue)
      </label>

      {state.error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          <AlertCircle className="h-4 w-4" /> {state.error}
        </div>
      )}

      <Button type="submit" size="lg" loading={pending}>{id ? "Enregistrer" : "Creer l'activite"}</Button>
    </form>
  );
}
