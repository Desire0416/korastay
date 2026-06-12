"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { sendBusinessQuote, type AdminResult } from "@/server/actions/admin";
import { formatPrice } from "@/lib/utils";

interface Props {
  requestId: string;
  currentAmount?: number | null;
  currentMessage?: string | null;
}

export function BusinessQuoteForm({ requestId, currentAmount, currentMessage }: Props) {
  const action = sendBusinessQuote.bind(null, requestId);
  const [state, formAction, pending] = useActionState<AdminResult, FormData>(action, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
      <h3 className="mb-1 flex items-center gap-2 font-bold text-foreground"><FileText className="h-4 w-4 text-brand-600" /> Devis</h3>
      {currentAmount ? (
        <p className="mb-3 text-sm text-muted">Devis actuel : <span className="font-bold text-foreground">{formatPrice(currentAmount)}</span>. Vous pouvez le modifier.</p>
      ) : (
        <p className="mb-3 text-sm text-muted">Etablissez un devis chiffre pour ce client.</p>
      )}
      <form action={formAction} className="space-y-3">
        <Field label="Montant du devis (F CFA)" htmlFor="quoteAmount" required>
          <Input id="quoteAmount" name="quoteAmount" type="number" min={1000} step={1000} defaultValue={currentAmount ?? undefined} placeholder="1500000" required />
        </Field>
        <Field label="Message au client" htmlFor="quoteMessage">
          <Textarea id="quoteMessage" name="quoteMessage" defaultValue={currentMessage ?? ""} rows={3} placeholder="Détail de l'offre, conditions..." />
        </Field>
        {state.error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">
            <AlertCircle className="h-4 w-4" /> {state.error}
          </div>
        )}
        <Button type="submit" loading={pending}>{currentAmount ? "Mettre a jour le devis" : "Envoyer le devis"}</Button>
      </form>
    </div>
  );
}
