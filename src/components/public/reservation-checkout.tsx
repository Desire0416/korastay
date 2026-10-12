"use client";

import * as React from "react";
import { useActionState } from "react";
import { AlertCircle, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/payments";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";
import { StepHeading } from "./step-heading";
import type { ReservationResult } from "@/server/actions/reservations";

type Action = (prev: ReservationResult, formData: FormData) => Promise<ReservationResult>;

interface MethodOption {
  value: string;
  label: string;
  hint?: string;
}

interface ReservationCheckoutProps {
  action: Action;
  hidden: Record<string, string>;
  defaultName: string;
  defaultEmail: string;
  defaultPhone: string;
  isMock?: boolean;
  depositLabel?: string;
  balanceLabel?: string;
  cautionLabel?: string;
  validationLabel?: string;
  methods?: MethodOption[];
  koraStayNote?: string;
}

export function ReservationCheckout({
  action,
  hidden,
  defaultName,
  defaultEmail,
  defaultPhone,
  isMock,
  depositLabel,
  balanceLabel,
  cautionLabel,
  validationLabel = "24h",
  methods,
  koraStayNote,
}: ReservationCheckoutProps) {
  const dict = useI18n();
  const [state, formAction, pending] = useActionState<ReservationResult, FormData>(
    action,
    { ok: false }
  );
  const methodOptions = methods && methods.length > 0 ? methods : PAYMENT_METHOD_OPTIONS;
  const [method, setMethod] = React.useState(methodOptions[0].value);

  return (
    <form action={formAction} className="space-y-10">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <input type="hidden" name="method" value={method} />

      {/* Coordonnees */}
      <section>
        <StepHeading step={1} title={dict.checkout.yourDetails} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={dict.checkout.fullName} htmlFor="guestName" required className="sm:col-span-2">
            <Input id="guestName" name="guestName" defaultValue={defaultName} required />
          </Field>
          <Field label="Email" htmlFor="guestEmail" required>
            <Input id="guestEmail" name="guestEmail" type="email" defaultValue={defaultEmail} required />
          </Field>
          <Field label={dict.checkout.phone} htmlFor="guestPhone">
            <Input id="guestPhone" name="guestPhone" defaultValue={defaultPhone} placeholder="+225 ..." />
          </Field>
        </div>
      </section>

      {/* Validation & acompte */}
      <section>
        <StepHeading step={2} title={dict.checkout.validationTitle} />
        <div className="mb-4 flex items-start gap-3 rounded-[1.25rem] bg-sand-50 px-4 py-4 text-sm leading-relaxed text-foreground/85 ring-1 ring-inset ring-sand-300/70">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
          <span>
            {dict.checkout.validationP1}<strong>{validationLabel}</strong>{dict.checkout.validationP2}<strong>{depositLabel ? depositLabel : dict.checkout.depositFallback}</strong>{dict.checkout.validationP3}
            {balanceLabel ? dict.checkout.balanceLine.replace("{x}", balanceLabel) : ""}
            {cautionLabel ? dict.checkout.cautionLine.replace("{x}", cautionLabel) : ""}
          </span>
        </div>
        {koraStayNote && (
          <p className="mb-4 flex items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-800 ring-1 ring-inset ring-brand-200/60">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            {koraStayNote}
          </p>
        )}
        {isMock && (
          <p className="mb-4 text-xs text-muted">{dict.checkout.demoMode}</p>
        )}
        <p className="eyebrow mb-3 text-[10.5px] text-muted">{dict.checkout.preferredMethod}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {methodOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMethod(opt.value)}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all",
                method === opt.value ? "border-ink bg-white shadow-soft ring-1 ring-ink" : "border-ink/15 bg-white hover:border-ink/35"
              )}
            >
              <span>
                <span className="block font-semibold text-foreground">{opt.label}</span>
                <span className="block text-xs text-muted">{opt.hint}</span>
              </span>
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border", method === opt.value ? "border-ink bg-ink text-white" : "border-ink/25")}>
                {method === opt.value && <CheckCircle2 className="h-4 w-4" />}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Conditions */}
      <label className="flex cursor-pointer items-start gap-3 rounded-[1.25rem] border border-border bg-surface p-4">
        <input type="checkbox" name="acceptTerms" value="1" required className="mt-0.5 h-5 w-5 rounded border-ink/30 text-brand-500 focus:ring-brand-400" />
        <span className="text-sm leading-relaxed text-foreground/90">
          {dict.checkout.acceptPrefix}
          <a href={localePath("/conditions-generales", dict.locale)} target="_blank" className="font-semibold text-terracotta underline underline-offset-2">{dict.checkout.termsLink}</a>
          {dict.checkout.and}
          <a href={localePath("/politique-annulation", dict.locale)} target="_blank" className="font-semibold text-terracotta underline underline-offset-2">{dict.checkout.cancellationLink}</a>.
        </span>
      </label>

      {state.error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-danger ring-1 ring-inset ring-red-200/70">
          <AlertCircle className="h-4 w-4" />
          {state.error}
        </div>
      )}

      <Button type="submit" size="lg" loading={pending} className="w-full">
        <Lock className="h-4 w-4" />
        {dict.checkout.submit}
      </Button>
    </form>
  );
}
