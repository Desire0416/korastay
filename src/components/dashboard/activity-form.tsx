"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { saveActivity, type ActivityResult } from "@/server/actions/activities";
import { activityCategoryMeta } from "@/lib/enums";
import { useI18n } from "@/components/i18n/provider";

interface ActivityDefaults {
  name?: string; category?: string; city?: string; description?: string; shortDescription?: string;
  durationHours?: number; pricePerPerson?: number; minPersons?: number; maxPersons?: number;
  difficulty?: string; included?: string; meetingPoint?: string; isPublished?: boolean;
}

export function ActivityForm({ id, defaults = {}, destinations }: { id?: string; defaults?: ActivityDefaults; destinations: { name: string }[] }) {
  const dict = useI18n();
  const t = dict.dashAdmin.catalog.activityForm;
  const action = saveActivity.bind(null, id ?? null);
  const [state, formAction, pending] = useActionState<ActivityResult, FormData>(action, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.name} htmlFor="name" required className="sm:col-span-2">
          <Input id="name" name="name" defaultValue={defaults.name} placeholder={t.namePh} required />
        </Field>
        <Field label={t.category} htmlFor="category" required>
          <NativeSelect id="category" name="category" defaultValue={defaults.category ?? "EXCURSION"}>
            {Object.entries(activityCategoryMeta).map(([v, m]) => (
              <option key={v} value={v}>{dict.enums.activityCategory[v] ?? m.label}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t.city} htmlFor="city" required>
          <Input list="act-cities" id="city" name="city" defaultValue={defaults.city} placeholder="Man" required />
          <datalist id="act-cities">{destinations.map((d) => <option key={d.name} value={d.name} />)}</datalist>
        </Field>
        <Field label={t.duration} htmlFor="durationHours" required>
          <Input id="durationHours" name="durationHours" type="number" min={1} max={72} defaultValue={defaults.durationHours ?? 3} required />
        </Field>
        <Field label={t.price} htmlFor="pricePerPerson" required>
          <Input id="pricePerPerson" name="pricePerPerson" type="number" min={0} step={500} defaultValue={defaults.pricePerPerson} placeholder="15000" required />
        </Field>
        <Field label={t.minPersons} htmlFor="minPersons" required>
          <Input id="minPersons" name="minPersons" type="number" min={1} defaultValue={defaults.minPersons ?? 1} required />
        </Field>
        <Field label={t.maxPersons} htmlFor="maxPersons" required>
          <Input id="maxPersons" name="maxPersons" type="number" min={1} defaultValue={defaults.maxPersons ?? 10} required />
        </Field>
        <Field label={t.difficulty} htmlFor="difficulty">
          <Input id="difficulty" name="difficulty" defaultValue={defaults.difficulty} placeholder={t.difficultyPh} />
        </Field>
        <Field label={t.meetingPoint} htmlFor="meetingPoint">
          <Input id="meetingPoint" name="meetingPoint" defaultValue={defaults.meetingPoint} placeholder={t.meetingPointPh} />
        </Field>
      </div>

      <Field label={t.short} htmlFor="shortDescription" hint={t.shortHint}>
        <Input id="shortDescription" name="shortDescription" defaultValue={defaults.shortDescription} placeholder={t.shortPh} />
      </Field>
      <Field label={t.description} htmlFor="description" required>
        <Textarea id="description" name="description" defaultValue={defaults.description} rows={5} placeholder={t.descriptionPh} required />
      </Field>
      <Field label={t.included} htmlFor="included" hint={t.includedHint}>
        <Textarea id="included" name="included" defaultValue={defaults.included} rows={4} placeholder={t.includedPh} />
      </Field>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/15 bg-white p-4 text-sm font-medium text-foreground transition-colors hover:border-ink/30 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50/60">
        <input type="checkbox" name="isPublished" defaultChecked={defaults.isPublished} className="h-5 w-5 rounded border-ink/25 text-brand-500 focus:ring-brand-400" />
        {t.publish}
      </label>

      {state.error && (
        <div className="flex items-center gap-2 rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 ring-1 ring-inset ring-danger-200/70">
          <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}

      <div className="border-t border-border pt-5">
        <Button type="submit" size="lg" loading={pending}>{id ? t.save : t.create}</Button>
      </div>
    </form>
  );
}
