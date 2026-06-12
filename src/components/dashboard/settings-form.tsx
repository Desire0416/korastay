"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { saveSettings, type SettingsResult } from "@/server/actions/settings";

interface Props {
  contactEmail: string;
  contactPhone: string;
  announcement: string;
}

export function SettingsForm({ contactEmail, contactPhone, announcement }: Props) {
  const [state, action, pending] = useActionState<SettingsResult, FormData>(saveSettings, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-6">
      <Link href="/admin/settings/payments" className="flex items-center justify-between rounded-3xl border border-border bg-surface p-5 shadow-soft transition-colors hover:border-brand-300">
        <span className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><CreditCard className="h-5 w-5" /></span>
          <span>
            <span className="block font-bold text-foreground">Regles de paiement</span>
            <span className="block text-sm text-muted">Moyens actives, frais de service, acomptes, caution, reversements.</span>
          </span>
        </span>
        <ChevronRight className="h-5 w-5 text-muted" />
      </Link>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-4 font-bold text-foreground">Contact affiche</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email de contact" htmlFor="contact_email">
            <Input id="contact_email" name="contact_email" type="email" defaultValue={contactEmail} />
          </Field>
          <Field label="Téléphone de contact" htmlFor="contact_phone">
            <Input id="contact_phone" name="contact_phone" defaultValue={contactPhone} />
          </Field>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-1 font-bold text-foreground">Annonce</h2>
        <p className="mb-4 text-sm text-muted">Message affiche en banniere sur le tableau de bord admin (laisser vide pour masquer).</p>
        <Textarea name="announcement" defaultValue={announcement} rows={2} placeholder="Ex: Maintenance prévue dimanche soir." />
      </div>

      <Button type="submit" size="lg" loading={pending}>Enregistrer les paramètres</Button>
    </form>
  );
}
