"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Banknote, Copy, Check, ShieldCheck } from "lucide-react";
import { declareReservationPayment, type ReservationResult } from "@/server/actions/reservations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { UploadField } from "@/components/dashboard/upload-field";
import { useI18n } from "@/components/i18n/provider";
import { cn } from "@/lib/utils";

interface MethodOption {
  value: string;
  label: string;
  number: string;
}

interface Props {
  reservationId: string;
  amountLabel: string;
  reference: string;
  options: MethodOption[];
  bankDetails: string;
  instructions: string;
}

// Paiement hors ligne (sans agregateur) : on indique au voyageur ou envoyer
// l'argent, puis il declare sa transaction (reference + capture). L'admin valide.
export function ManualPaymentPanel({ reservationId, amountLabel, reference, options, bankDetails, instructions }: Props) {
  const dict = useI18n();
  const c = dict.dashAccount.components;
  const [state, action, pending] = useActionState<ReservationResult, FormData>(declareReservationPayment, { ok: false });
  const [method, setMethod] = React.useState(options[0]?.value ?? "");
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  const selected = options.find((o) => o.value === method);
  const isBank = method === "BANK_TRANSFER";
  const isOther = method === "MANUAL";
  const payTarget = selected?.number ?? "";

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="reservationId" value={reservationId} />
      <input type="hidden" name="method" value={method} />

      {/* Choix du moyen */}
      {options.length > 1 && (
        <div>
          <p className="eyebrow mb-3 text-[10.5px] text-muted">{c.payMethod}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setMethod(o.value)}
                aria-pressed={method === o.value}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all",
                  method === o.value ? "border-ink bg-white text-ink shadow-soft ring-1 ring-ink" : "border-ink/15 bg-white text-foreground hover:border-ink/35"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instructions de paiement */}
      <div className="rounded-[1.25rem] bg-ink-800 p-5 text-sm text-white">
        <p className="flex items-center gap-2 font-display text-lg">
          <Banknote className="h-5 w-5 text-gold-300" /> {c.amountToSend.replace("{amount}", amountLabel)}
        </p>
        {isBank ? (
          bankDetails ? (
            <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-white/10 px-3 py-2.5 font-sans text-white/90">{bankDetails}</pre>
          ) : (
            <p className="mt-2 text-white/75">{c.bankMissing}</p>
          )
        ) : isOther ? (
          <p className="mt-2 text-white/75">{c.otherMethod}</p>
        ) : payTarget ? (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-white/10 px-4 py-3">
            <span className="font-display text-xl tracking-wide">{payTarget}</span>
            <button type="button" onClick={() => copy(payTarget)} className="inline-flex items-center gap-1 text-xs font-semibold text-gold-300">
              {copied ? <><Check className="h-3.5 w-3.5" /> {c.copied}</> : <><Copy className="h-3.5 w-3.5" /> {c.copyNumber}</>}
            </button>
          </div>
        ) : (
          <p className="mt-2 text-white/75">{c.numberMissing.replace("{method}", selected?.label ?? "")}</p>
        )}
        <p className="mt-3 text-xs text-white/70">
          {c.referenceHint.split("{ref}")[0]}
          <strong className="text-gold-300">{reference}</strong>
          {c.referenceHint.split("{ref}")[1]}
        </p>
        {instructions && <p className="mt-1.5 text-xs text-white/60">{instructions}</p>}
      </div>

      {/* Declaration */}
      <Field label={c.txRef} htmlFor="payRef" required hint={c.txRefHint}>
        <Input id="payRef" name="reference" placeholder="TXN-123456" required />
      </Field>
      <UploadField name="proofUrl" label={c.proof} kind="image" hint={c.proofHint} />

      <Button type="submit" size="lg" loading={pending} className="w-full">
        <ShieldCheck className="h-5 w-5" /> {c.declare}
      </Button>
      <p className="text-center text-xs text-muted">{c.verifiedNote}</p>
    </form>
  );
}
