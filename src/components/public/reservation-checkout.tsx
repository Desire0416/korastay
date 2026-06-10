"use client";

import * as React from "react";
import { useActionState } from "react";
import { AlertCircle, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/payments";
import type { ReservationResult } from "@/server/actions/reservations";

type Action = (prev: ReservationResult, formData: FormData) => Promise<ReservationResult>;

interface ReservationCheckoutProps {
  action: Action;
  hidden: Record<string, string>;
  defaultName: string;
  defaultEmail: string;
  defaultPhone: string;
  isMock?: boolean;
}

export function ReservationCheckout({
  action,
  hidden,
  defaultName,
  defaultEmail,
  defaultPhone,
  isMock,
}: ReservationCheckoutProps) {
  const [state, formAction, pending] = useActionState<ReservationResult, FormData>(
    action,
    { ok: false }
  );
  const [method, setMethod] = React.useState(PAYMENT_METHOD_OPTIONS[0].value);

  return (
    <form action={formAction} className="space-y-7">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <input type="hidden" name="method" value={method} />

      {/* Coordonnees */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground">Vos coordonnees</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nom complet" htmlFor="guestName" required className="sm:col-span-2">
            <Input id="guestName" name="guestName" defaultValue={defaultName} required />
          </Field>
          <Field label="Email" htmlFor="guestEmail" required>
            <Input id="guestEmail" name="guestEmail" type="email" defaultValue={defaultEmail} required />
          </Field>
          <Field label="Telephone" htmlFor="guestPhone">
            <Input id="guestPhone" name="guestPhone" defaultValue={defaultPhone} placeholder="+225 ..." />
          </Field>
        </div>
      </section>

      {/* Paiement */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground">Mode de paiement</h2>
        {isMock && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl bg-gold-50 px-4 py-3 text-sm text-gold-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>Mode demonstration :</strong> le paiement est simule. Aucun montant
              reel ne sera debite. La reservation sera confirmee immediatement.
            </span>
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PAYMENT_METHOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMethod(opt.value)}
              className={cn(
                "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
                method === opt.value ? "border-brand-500 bg-brand-50" : "border-border hover:border-brand-300"
              )}
            >
              <span>
                <span className="block font-semibold text-foreground">{opt.label}</span>
                <span className="block text-xs text-muted">{opt.hint}</span>
              </span>
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border", method === opt.value ? "border-brand-500 bg-brand-500 text-white" : "border-border")}>
                {method === opt.value && <CheckCircle2 className="h-4 w-4" />}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Conditions */}
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-4">
        <input type="checkbox" name="acceptTerms" value="1" required className="mt-0.5 h-5 w-5 rounded border-border text-brand-500 focus:ring-brand-400" />
        <span className="text-sm text-foreground/90">
          J'accepte les{" "}
          <a href="/conditions-generales" target="_blank" className="font-semibold text-brand-600 underline">conditions generales de reservation</a>{" "}
          et la{" "}
          <a href="/politique-annulation" target="_blank" className="font-semibold text-brand-600 underline">politique d'annulation</a>.
        </span>
      </label>

      {state.error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          <AlertCircle className="h-4 w-4" />
          {state.error}
        </div>
      )}

      <Button type="submit" size="lg" loading={pending} className="w-full">
        <Lock className="h-4 w-4" />
        Confirmer et payer
      </Button>
    </form>
  );
}
