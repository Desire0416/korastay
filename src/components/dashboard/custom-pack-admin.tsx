"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, AlertCircle, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { sendCustomPackQuote, convertCustomPackToReservation, type CustomPackResult } from "@/server/actions/custom-pack";
import { formatPrice } from "@/lib/utils";

export function CustomPackQuoteForm({ id, currentAmount, currentMessage }: { id: string; currentAmount?: number | null; currentMessage?: string | null }) {
  const action = sendCustomPackQuote.bind(null, id);
  const [state, formAction, pending] = useActionState<CustomPackResult, FormData>(action, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
      <h3 className="mb-1 flex items-center gap-2 font-bold text-foreground"><FileText className="h-4 w-4 text-brand-600" /> Devis</h3>
      {currentAmount ? (
        <p className="mb-3 text-sm text-muted">Devis actuel : <span className="font-bold text-foreground">{formatPrice(currentAmount)}</span>.</p>
      ) : (
        <p className="mb-3 text-sm text-muted">Proposez un devis chiffre (sinon le total estime fait foi).</p>
      )}
      <form action={formAction} className="space-y-3">
        <Field label="Montant du devis (F CFA)" htmlFor="quoteAmount" required>
          <Input id="quoteAmount" name="quoteAmount" type="number" min={1000} step={1000} defaultValue={currentAmount ?? undefined} placeholder="45000" required />
        </Field>
        <Field label="Message au client" htmlFor="quoteMessage">
          <Textarea id="quoteMessage" name="quoteMessage" defaultValue={currentMessage ?? ""} rows={2} placeholder="Detail de l'offre..." />
        </Field>
        {state.error && <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-danger"><AlertCircle className="h-4 w-4" /> {state.error}</div>}
        <Button type="submit" loading={pending}>{currentAmount ? "Mettre a jour le devis" : "Envoyer le devis"}</Button>
      </form>
    </div>
  );
}

export function ConvertCustomPackButton({ id, disabled, hint }: { id: string; disabled?: boolean; hint?: string }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  return (
    <div className="rounded-3xl border border-brand-200 bg-brand-50/50 p-5">
      <h3 className="mb-1 flex items-center gap-2 font-bold text-foreground"><Wand2 className="h-4 w-4 text-brand-600" /> Convertir en reservation</h3>
      <p className="mb-3 text-sm text-muted">Cree une reservation confirmee pour le voyageur et des missions pour chaque partenaire du panier.</p>
      <Button
        disabled={disabled}
        loading={pending}
        onClick={() => start(async () => {
          const res = await convertCustomPackToReservation(id);
          if (res.ok) { toast.success(res.message ?? "Converti."); if (res.id) router.push(`/admin/reservations/${res.id}`); else router.refresh(); }
          else toast.error(res.error ?? "Erreur.");
        })}
      >
        <Wand2 className="h-4 w-4" /> Convertir en reservation & missions
      </Button>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}
