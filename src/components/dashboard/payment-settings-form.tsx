"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { savePaymentSettings, type PayAdminResult } from "@/server/actions/payments-admin";
import { paymentMethodMeta } from "@/lib/enums";
import type { PaymentSettings } from "@/lib/payment-rules";

const METHODS = ["WAVE", "ORANGE_MONEY", "MTN_MOMO", "MOOV_MONEY", "CARD", "BANK_TRANSFER", "MANUAL"] as const;

function PolicySelect({ name, defaultValue }: { name: string; defaultValue: string }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
    >
      <option value="HALF">50 % a la reservation</option>
      <option value="FULL">100 % a la reservation</option>
    </select>
  );
}

export function PaymentSettingsForm({ settings }: { settings: PaymentSettings }) {
  const [state, action, pending] = useActionState<PayAdminResult, FormData>(savePaymentSettings, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-6">
      {/* 1. Moyens de paiement */}
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="font-bold text-foreground">1. Moyens de paiement actives</h2>
        <p className="mb-4 text-sm text-muted">Seuls les moyens coches sont proposes au voyageur.</p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {METHODS.map((m) => (
            <label key={m} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border px-4 py-3 hover:border-brand-300 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50/60">
              <input type="checkbox" name={`method_${m}`} value="1" defaultChecked={settings.methods[m]} className="h-5 w-5 rounded border-border text-brand-500 focus:ring-brand-400" />
              <span>
                <span className="block text-sm font-semibold text-foreground">{paymentMethodMeta[m]?.label ?? m}</span>
                <span className="block text-xs text-muted">{paymentMethodMeta[m]?.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* 2. Frais de service */}
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="font-bold text-foreground">2. Frais de service voyageur</h2>
        <p className="mb-4 text-sm text-muted">Pourcentage du sous-total, borne entre un plancher et un plafond.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Pourcentage (%)" htmlFor="serviceFeePercent">
            <Input id="serviceFeePercent" name="serviceFeePercent" type="number" min={0} max={30} step="0.5" defaultValue={settings.serviceFeePercent} />
          </Field>
          <Field label="Minimum (F CFA)" htmlFor="serviceFeeMin">
            <Input id="serviceFeeMin" name="serviceFeeMin" type="number" min={0} step="100" defaultValue={settings.serviceFeeMin} />
          </Field>
          <Field label="Plafond (F CFA)" htmlFor="serviceFeeMax">
            <Input id="serviceFeeMax" name="serviceFeeMax" type="number" min={0} step="100" defaultValue={settings.serviceFeeMax} />
          </Field>
        </div>
      </section>

      {/* 3. Regles residences */}
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="font-bold text-foreground">3. Acompte residences</h2>
        <p className="mb-4 text-sm text-muted">Politique appliquee selon le type de residence (un reglage par residence peut forcer la valeur).</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Residence standard" htmlFor="residenceStandardPolicy"><PolicySelect name="residenceStandardPolicy" defaultValue={settings.residenceStandardPolicy} /></Field>
          <Field label="Residence premium" htmlFor="residencePremiumPolicy"><PolicySelect name="residencePremiumPolicy" defaultValue={settings.residencePremiumPolicy} /></Field>
          <Field label="Forte demande" htmlFor="residenceHighDemandPolicy"><PolicySelect name="residenceHighDemandPolicy" defaultValue={settings.residenceHighDemandPolicy} /></Field>
          <Field label="Sejour d'une nuit" htmlFor="residenceOneNightPolicy"><PolicySelect name="residenceOneNightPolicy" defaultValue={settings.residenceOneNightPolicy} /></Field>
          <Field label="Client entreprise (acompte %)" htmlFor="businessDepositPercent" hint="Defaut : 50 %">
            <Input id="businessDepositPercent" name="businessDepositPercent" type="number" min={0} max={100} step="5" defaultValue={settings.businessDepositPercent} />
          </Field>
        </div>
      </section>

      {/* 4. Packs & activites */}
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="font-bold text-foreground">4. Packs &amp; activites</h2>
        <p className="mb-4 text-sm text-muted">Les packs touristiques exigent en principe 100 % avant confirmation.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Packs touristiques" htmlFor="packPolicy"><PolicySelect name="packPolicy" defaultValue={settings.packPolicy} /></Field>
          <Field label="Activites" htmlFor="activityPolicy"><PolicySelect name="activityPolicy" defaultValue={settings.activityPolicy} /></Field>
        </div>
      </section>

      {/* 8. Reversements hote */}
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="font-bold text-foreground">5. Reversements proprietaire</h2>
        <p className="mb-4 text-sm text-muted">Part versee a l'arrivee du voyageur ; le reste est verse au depart. Un litige bloque tout reversement.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nouveau proprietaire : % au check-in" htmlFor="payoutNewCheckInPercent" hint="Reste verse au check-out (defaut 70/30)">
            <Input id="payoutNewCheckInPercent" name="payoutNewCheckInPercent" type="number" min={0} max={100} step="5" defaultValue={settings.payoutNewCheckInPercent} />
          </Field>
          <Field label="Proprietaire fiable : % au check-in" htmlFor="payoutReliableCheckInPercent" hint="Defaut 100 %">
            <Input id="payoutReliableCheckInPercent" name="payoutReliableCheckInPercent" type="number" min={0} max={100} step="5" defaultValue={settings.payoutReliableCheckInPercent} />
          </Field>
        </div>
      </section>

      {/* 9. Message client */}
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-1 font-bold text-foreground">6. Message de reassurance client</h2>
        <p className="mb-4 text-sm text-muted">Affiche sur la page de reservation : tout paiement passe par KoraStay.</p>
        <Textarea name="payViaKoraStayNote" defaultValue={settings.payViaKoraStayNote} rows={3} />
      </section>

      <Button type="submit" size="lg" loading={pending}>Enregistrer les regles de paiement</Button>
    </form>
  );
}
