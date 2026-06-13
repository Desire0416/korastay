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
export function ManualPaymentPanel({
  reservationId,
  amountLabel,
  reference,
  options,
  bankDetails,
  instructions,
}: Props) {
  const [state, action, pending] = useActionState<ReservationResult, FormData>(
    declareReservationPayment,
    { ok: false },
  );
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
    <form action={action} className="space-y-4">
      <input type="hidden" name="reservationId" value={reservationId} />
      <input type="hidden" name="method" value={method} />

      {/* Choix du moyen */}
      {options.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Moyen utilisé</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setMethod(o.value)}
                className={cn(
                  "rounded-2xl border px-3 py-2 text-sm font-semibold transition-colors",
                  method === o.value
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-border text-foreground hover:border-brand-300",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instructions de paiement */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4 text-sm">
        <p className="flex items-center gap-1.5 font-bold text-brand-800">
          <Banknote className="h-4 w-4" /> Montant à envoyer : {amountLabel}
        </p>
        {isBank ? (
          bankDetails ? (
            <pre className="mt-2 whitespace-pre-wrap font-sans text-brand-800/90">{bankDetails}</pre>
          ) : (
            <p className="mt-2 text-brand-800/80">Contactez KoraStay pour obtenir les coordonnées bancaires.</p>
          )
        ) : isOther ? (
          <p className="mt-2 text-brand-800/80">
            Réglez selon les modalités convenues avec KoraStay, puis déclarez votre paiement ci-dessous.
          </p>
        ) : payTarget ? (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-white/70 px-3 py-2">
            <span className="font-bold tracking-wide text-foreground">{payTarget}</span>
            <button
              type="button"
              onClick={() => copy(payTarget)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600"
            >
              {copied ? (
                <><Check className="h-3.5 w-3.5" /> Copié</>
              ) : (
                <><Copy className="h-3.5 w-3.5" /> Copier</>
              )}
            </button>
          </div>
        ) : (
          <p className="mt-2 text-brand-800/80">
            Numéro {selected?.label} non communiqué — contactez KoraStay.
          </p>
        )}
        <p className="mt-2 text-xs text-brand-800/80">
          Précisez la référence <strong>{reference}</strong> dans le motif du paiement.
        </p>
        {instructions && <p className="mt-1 text-xs text-brand-800/70">{instructions}</p>}
      </div>

      {/* Declaration */}
      <Field label="Référence de votre transaction" htmlFor="payRef" required hint="ID Wave/Orange, n° de transfert…">
        <Input id="payRef" name="reference" placeholder="Ex : TXN-123456" required />
      </Field>
      <UploadField
        name="proofUrl"
        label="Capture du paiement (optionnel)"
        kind="image"
        hint="Reçu Wave / Orange Money — accélère la validation."
      />

      <Button type="submit" size="lg" loading={pending} className="w-full">
        <ShieldCheck className="h-5 w-5" /> J&apos;ai payé — déclarer mon paiement
      </Button>
      <p className="text-center text-xs text-muted">
        Votre paiement sera vérifié et confirmé par l&apos;équipe KoraStay.
      </p>
    </form>
  );
}
