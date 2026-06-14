"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CreditCard, ChevronRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { saveSettings, type SettingsResult } from "@/server/actions/settings";

interface Props {
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  announcement: string;
  statsVisible: boolean;
}

export function SettingsForm({ contactEmail, contactPhone, whatsappNumber, announcement, statsVisible }: Props) {
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <BarChart3 className="h-4 w-4 text-brand-600" /> Statistiques publiques
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted">
              Affiche la section « KoraStay en chiffres » (visites, comptes, offre) sur la page d&apos;accueil.
              Laissez masqué tant que les chiffres sont faibles, puis activez-la au moment opportun.
            </p>
            <p className="mt-2 text-xs font-semibold">
              Actuellement :{" "}
              <span className={statsVisible ? "text-success" : "text-muted"}>
                {statsVisible ? "affichée sur l'accueil" : "masquée"}
              </span>
            </p>
          </div>
          <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center" title="Afficher la section sur l'accueil">
            <input type="checkbox" name="community_stats_visible" value="1" defaultChecked={statsVisible} className="peer sr-only" />
            <span className="h-6 w-11 rounded-full bg-border transition-colors peer-checked:bg-brand-500" />
            <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-4 font-bold text-foreground">Contact affiche</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email de contact" htmlFor="contact_email">
            <Input id="contact_email" name="contact_email" type="email" defaultValue={contactEmail} />
          </Field>
          <Field label="Téléphone de contact" htmlFor="contact_phone">
            <Input id="contact_phone" name="contact_phone" defaultValue={contactPhone} />
          </Field>
          <Field label="Numéro WhatsApp" htmlFor="whatsapp_number" hint="Format international (ex : +225 07 ...). Vide = téléphone de contact." className="sm:col-span-2">
            <Input id="whatsapp_number" name="whatsapp_number" defaultValue={whatsappNumber} placeholder="+225 07 00 00 00 00" />
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
