"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { savePaymentSettings, type PayAdminResult } from "@/server/actions/payments-admin";
import { paymentMethodMeta } from "@/lib/enums";
import { useI18n } from "@/components/i18n/provider";
import type { PaymentSettings } from "@/lib/payment-rules";

const METHODS = ["WAVE", "ORANGE_MONEY", "MTN_MOMO", "MOOV_MONEY", "CARD", "BANK_TRANSFER", "MANUAL"] as const;
const MOBILE_METHODS = ["WAVE", "ORANGE_MONEY", "MTN_MOMO", "MOOV_MONEY"] as const;

const panel = "rounded-[1.5rem] border border-border/80 bg-surface p-6 shadow-soft";
const titleCls = "font-display text-xl text-foreground";

// Defini au niveau module : un composant recree a chaque rendu remonterait
// le select (non controle) et perdrait le choix de l'utilisateur.
function PolicySelect({ name, defaultValue, half, full }: { name: string; defaultValue: string; half: string; full: string }) {
  return (
    <NativeSelect name={name} id={name} defaultValue={defaultValue}>
      <option value="HALF">{half}</option>
      <option value="FULL">{full}</option>
    </NativeSelect>
  );
}

export function PaymentSettingsForm({ settings }: { settings: PaymentSettings }) {
  const dict = useI18n();
  const t = dict.dashAdmin.system.paymentForm;
  const method = (m: string) => dict.enums.paymentMethod[m] ?? paymentMethodMeta[m] ?? { label: m };
  const [state, action, pending] = useActionState<PayAdminResult, FormData>(savePaymentSettings, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-6">
      {/* 1. Moyens de paiement */}
      <section className={panel}>
        <h2 className={titleCls}>{t.methodsTitle}</h2>
        <p className="mb-4 mt-1 text-sm text-muted">{t.methodsText}</p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {METHODS.map((m) => (
            <label
              key={m}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/15 bg-white px-4 py-3 transition-colors hover:border-ink/30 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50/60"
            >
              <input type="checkbox" name={`method_${m}`} value="1" defaultChecked={settings.methods[m]} className="h-5 w-5 rounded border-ink/25 text-brand-500 focus:ring-brand-400" />
              <span>
                <span className="block text-sm font-semibold text-foreground">{method(m).label}</span>
                <span className="block text-xs text-muted">{method(m).hint}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* 1 bis. Reception des paiements hors ligne (sans agregateur) */}
      <section className={panel}>
        <h2 className={titleCls}>{t.receivingTitle}</h2>
        <p className="mb-4 mt-1 text-sm text-muted">{t.receivingText}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {MOBILE_METHODS.map((m) => (
            <Field key={m} label={t.number.replace("{method}", method(m).label)} htmlFor={`recv_${m}`}>
              <Input id={`recv_${m}`} name={`recv_${m}`} placeholder="+225 07 00 00 00 00" defaultValue={settings.receivingNumbers?.[m] ?? ""} />
            </Field>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Field label={t.bankDetails} htmlFor="bankDetails" hint={t.bankDetailsHint}>
            <Textarea id="bankDetails" name="bankDetails" rows={3} defaultValue={settings.bankDetails ?? ""} placeholder={t.bankDetailsPh} />
          </Field>
          <Field label={t.instructions} htmlFor="manualInstructions" hint={t.instructionsHint}>
            <Textarea id="manualInstructions" name="manualInstructions" rows={2} defaultValue={settings.manualInstructions ?? ""} placeholder={t.instructionsPh} />
          </Field>
        </div>
      </section>

      {/* 2. Frais de service */}
      <section className={panel}>
        <h2 className={titleCls}>{t.feeTitle}</h2>
        <p className="mb-4 mt-1 text-sm text-muted">{t.feeText}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label={t.feePercent} htmlFor="serviceFeePercent">
            <Input id="serviceFeePercent" name="serviceFeePercent" type="number" min={0} max={30} step="0.5" defaultValue={settings.serviceFeePercent} />
          </Field>
          <Field label={t.feeMin} htmlFor="serviceFeeMin">
            <Input id="serviceFeeMin" name="serviceFeeMin" type="number" min={0} step="100" defaultValue={settings.serviceFeeMin} />
          </Field>
          <Field label={t.feeMax} htmlFor="serviceFeeMax">
            <Input id="serviceFeeMax" name="serviceFeeMax" type="number" min={0} step="100" defaultValue={settings.serviceFeeMax} />
          </Field>
        </div>
      </section>

      {/* 3. Regles residences */}
      <section className={panel}>
        <h2 className={titleCls}>{t.depositTitle}</h2>
        <p className="mb-4 mt-1 text-sm text-muted">{t.depositText}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t.standard} htmlFor="residenceStandardPolicy"><PolicySelect half={t.half} full={t.full} name="residenceStandardPolicy" defaultValue={settings.residenceStandardPolicy} /></Field>
          <Field label={t.premium} htmlFor="residencePremiumPolicy"><PolicySelect half={t.half} full={t.full} name="residencePremiumPolicy" defaultValue={settings.residencePremiumPolicy} /></Field>
          <Field label={t.highDemand} htmlFor="residenceHighDemandPolicy"><PolicySelect half={t.half} full={t.full} name="residenceHighDemandPolicy" defaultValue={settings.residenceHighDemandPolicy} /></Field>
          <Field label={t.oneNight} htmlFor="residenceOneNightPolicy"><PolicySelect half={t.half} full={t.full} name="residenceOneNightPolicy" defaultValue={settings.residenceOneNightPolicy} /></Field>
          <Field label={t.businessDeposit} htmlFor="businessDepositPercent" hint={t.businessDepositHint}>
            <Input id="businessDepositPercent" name="businessDepositPercent" type="number" min={0} max={100} step="5" defaultValue={settings.businessDepositPercent} />
          </Field>
        </div>
      </section>

      {/* 4. Packs & activites */}
      <section className={panel}>
        <h2 className={titleCls}>{t.packsTitle}</h2>
        <p className="mb-4 mt-1 text-sm text-muted">{t.packsText}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t.packs} htmlFor="packPolicy"><PolicySelect half={t.half} full={t.full} name="packPolicy" defaultValue={settings.packPolicy} /></Field>
          <Field label={t.activities} htmlFor="activityPolicy"><PolicySelect half={t.half} full={t.full} name="activityPolicy" defaultValue={settings.activityPolicy} /></Field>
        </div>
      </section>

      {/* 5. Reversements hote */}
      <section className={panel}>
        <h2 className={titleCls}>{t.payoutsTitle}</h2>
        <p className="mb-4 mt-1 text-sm text-muted">{t.payoutsText}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t.payoutNew} htmlFor="payoutNewCheckInPercent" hint={t.payoutNewHint}>
            <Input id="payoutNewCheckInPercent" name="payoutNewCheckInPercent" type="number" min={0} max={100} step="5" defaultValue={settings.payoutNewCheckInPercent} />
          </Field>
          <Field label={t.payoutReliable} htmlFor="payoutReliableCheckInPercent" hint={t.payoutReliableHint}>
            <Input id="payoutReliableCheckInPercent" name="payoutReliableCheckInPercent" type="number" min={0} max={100} step="5" defaultValue={settings.payoutReliableCheckInPercent} />
          </Field>
        </div>
      </section>

      {/* 6. Message client */}
      <section className={panel}>
        <h2 className={titleCls}>{t.noteTitle}</h2>
        <p className="mb-4 mt-1 text-sm text-muted">{t.noteText}</p>
        <Textarea name="payViaKoraStayNote" defaultValue={settings.payViaKoraStayNote} rows={3} />
      </section>

      <div className="sticky bottom-[calc(var(--bottom-nav-h)+0.5rem)] z-10 rounded-[1.25rem] border border-border/80 bg-surface/95 p-3 shadow-card backdrop-blur lg:bottom-4">
        <Button type="submit" size="lg" loading={pending}>{t.save}</Button>
      </div>
    </form>
  );
}
