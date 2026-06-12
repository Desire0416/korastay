"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { recordManualPayment, type PayAdminResult } from "@/server/actions/payments-admin";
import { paymentMethodMeta } from "@/lib/enums";

const METHODS = ["WAVE", "ORANGE_MONEY", "MTN_MOMO", "MOOV_MONEY", "CARD", "BANK_TRANSFER", "MANUAL"];

export function ManualPaymentForm({
  reservationId,
  defaultAmount,
}: {
  reservationId: string;
  defaultAmount: number;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<PayAdminResult, FormData>(recordManualPayment, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [state, router]);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="reservationId" value={reservationId} />
      <div className="flex items-start gap-2 rounded-xl bg-gold-50 px-3 py-2 text-xs text-gold-800">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        Une capture d&apos;écran ne vaut pas paiement : ne validez qu&apos;un encaissement reellement reçu.
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Montant reçu (F CFA)" htmlFor="amount" required>
          <Input id="amount" name="amount" type="number" min={1} step="100" defaultValue={defaultAmount} required />
        </Field>
        <Field label="Moyen de paiement" htmlFor="method">
          <select id="method" name="method" defaultValue="MANUAL" className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100">
            {METHODS.map((m) => (
              <option key={m} value={m}>{paymentMethodMeta[m]?.label ?? m}</option>
            ))}
          </select>
        </Field>
        <Field label="Référence transaction" htmlFor="reference">
          <Input id="reference" name="reference" placeholder="Ex: WAVE-123456" />
        </Field>
        <Field label="Date du paiement" htmlFor="paidAt">
          <Input id="paidAt" name="paidAt" type="date" />
        </Field>
      </div>
      <Field label="Commentaire admin" htmlFor="comment">
        <Textarea id="comment" name="comment" rows={2} placeholder="Contexte, justificatif reçu..." />
      </Field>
      <Button type="submit" loading={pending} className="w-full">
        <CheckCircle2 className="h-4 w-4" /> Valider le paiement
      </Button>
    </form>
  );
}
