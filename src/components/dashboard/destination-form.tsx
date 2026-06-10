"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { saveDestination, type DestResult } from "@/server/actions/destinations";

interface DestinationFormProps {
  id?: string;
  defaults?: {
    name?: string; region?: string; country?: string; description?: string;
    heroImageUrl?: string; priority?: number; latitude?: number | null; longitude?: number | null; isActive?: boolean;
  };
}

export function DestinationForm({ id, defaults = {} }: DestinationFormProps) {
  const action = saveDestination.bind(null, id ?? null);
  const [state, formAction, pending] = useActionState<DestResult, FormData>(action, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nom de la ville" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={defaults.name} placeholder="Daloa" required />
        </Field>
        <Field label="Region" htmlFor="region">
          <Input id="region" name="region" defaultValue={defaults.region} placeholder="Haut-Sassandra" />
        </Field>
        <Field label="Pays" htmlFor="country">
          <Input id="country" name="country" defaultValue={defaults.country ?? "Cote d'Ivoire"} />
        </Field>
        <Field label="Priorite d'affichage" htmlFor="priority" hint="Plus petit = affiche en premier">
          <Input id="priority" name="priority" type="number" min={0} defaultValue={defaults.priority ?? 5} />
        </Field>
        <Field label="Latitude" htmlFor="latitude">
          <Input id="latitude" name="latitude" type="number" step="any" defaultValue={defaults.latitude ?? undefined} placeholder="6.877" />
        </Field>
        <Field label="Longitude" htmlFor="longitude">
          <Input id="longitude" name="longitude" type="number" step="any" defaultValue={defaults.longitude ?? undefined} placeholder="-6.45" />
        </Field>
        <Field label="Image (URL)" htmlFor="heroImageUrl" className="sm:col-span-2" hint="Laisser vide pour un visuel de marque automatique">
          <Input id="heroImageUrl" name="heroImageUrl" defaultValue={defaults.heroImageUrl} placeholder="https://..." />
        </Field>
        <Field label="Description" htmlFor="description" className="sm:col-span-2">
          <Textarea id="description" name="description" defaultValue={defaults.description} rows={4} placeholder="Presentez la destination..." />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input type="checkbox" name="isActive" defaultChecked={defaults.isActive ?? true} className="h-4 w-4 rounded border-border text-brand-500" />
        Destination active (visible sur le site)
      </label>

      {state.error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          <AlertCircle className="h-4 w-4" /> {state.error}
        </div>
      )}

      <Button type="submit" size="lg" loading={pending}>{id ? "Enregistrer" : "Creer la destination"}</Button>
    </form>
  );
}
