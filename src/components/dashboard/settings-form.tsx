"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { saveSettings, type SettingsResult } from "@/server/actions/settings";

interface Props {
  feePercent: number;
  contactEmail: string;
  contactPhone: string;
  announcement: string;
}

export function SettingsForm({ feePercent, contactEmail, contactPhone, announcement }: Props) {
  const [state, action, pending] = useActionState<SettingsResult, FormData>(saveSettings, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-6">
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-4 font-bold text-foreground">Tarification</h2>
        <Field label="Frais de service KoraStay (%)" htmlFor="feePercent" hint="Applique au sous-total de chaque reservation. Defaut : 7%.">
          <Input id="feePercent" name="feePercent" type="number" min={0} max={30} step="0.5" defaultValue={feePercent} className="max-w-40" />
        </Field>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-4 font-bold text-foreground">Contact affiche</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email de contact" htmlFor="contact_email">
            <Input id="contact_email" name="contact_email" type="email" defaultValue={contactEmail} />
          </Field>
          <Field label="Telephone de contact" htmlFor="contact_phone">
            <Input id="contact_phone" name="contact_phone" defaultValue={contactPhone} />
          </Field>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-1 font-bold text-foreground">Annonce</h2>
        <p className="mb-4 text-sm text-muted">Message affiche en banniere sur le tableau de bord admin (laisser vide pour masquer).</p>
        <Textarea name="announcement" defaultValue={announcement} rows={2} placeholder="Ex: Maintenance prevue dimanche soir." />
      </div>

      <Button type="submit" size="lg" loading={pending}>Enregistrer les parametres</Button>
    </form>
  );
}
