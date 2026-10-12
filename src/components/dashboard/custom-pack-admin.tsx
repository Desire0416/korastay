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
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";

export function CustomPackQuoteForm({ id, currentAmount, currentMessage }: { id: string; currentAmount?: number | null; currentMessage?: string | null }) {
  const t = useI18n().dashAdmin.catalog.customPack;
  const action = sendCustomPackQuote.bind(null, id);
  const [state, formAction, pending] = useActionState<CustomPackResult, FormData>(action, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  const [before, after] = t.currentQuote.split("{amount}");

  return (
    <section className="rounded-[1.5rem] border border-border/80 bg-surface p-5 shadow-soft sm:p-6">
      <h2 className="mb-1 flex items-center gap-2.5 font-display text-xl text-foreground">
        <FileText className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.quoteTitle}
      </h2>
      {currentAmount ? (
        <p className="mb-4 text-sm text-muted">
          {before}
          <span className="font-bold text-foreground">{formatPrice(currentAmount)}</span>
          {after}
        </p>
      ) : (
        <p className="mb-4 text-sm text-muted">{t.noQuote}</p>
      )}
      <form action={formAction} className="space-y-4">
        <Field label={t.quoteAmount} htmlFor="quoteAmount" required>
          <Input id="quoteAmount" name="quoteAmount" type="number" min={1000} step={1000} defaultValue={currentAmount ?? undefined} placeholder="45000" required />
        </Field>
        <Field label={t.quoteMessage} htmlFor="quoteMessage">
          <Textarea id="quoteMessage" name="quoteMessage" defaultValue={currentMessage ?? ""} rows={2} placeholder={t.quoteMessagePh} />
        </Field>
        {state.error && (
          <div className="flex items-center gap-2 rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm text-danger-700 ring-1 ring-inset ring-danger-200/70">
            <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
          </div>
        )}
        <Button type="submit" loading={pending}>{currentAmount ? t.updateQuote : t.sendQuote}</Button>
      </form>
    </section>
  );
}

export function ConvertCustomPackButton({ id, disabled, hint }: { id: string; disabled?: boolean; hint?: string }) {
  const router = useRouter();
  const dict = useI18n();
  const t = dict.dashAdmin.catalog.customPack;
  const [pending, start] = React.useTransition();
  return (
    <section className="rounded-[1.5rem] bg-brand-50/70 p-5 ring-1 ring-inset ring-brand-200/70 sm:p-6">
      <h2 className="mb-1 flex items-center gap-2.5 font-display text-xl text-foreground">
        <Wand2 className="h-5 w-5 text-brand-600" strokeWidth={1.7} /> {t.convertTitle}
      </h2>
      <p className="mb-4 text-sm text-muted">{t.convertText}</p>
      <Button
        disabled={disabled}
        loading={pending}
        onClick={() =>
          start(async () => {
            const res = await convertCustomPackToReservation(id);
            if (res.ok) {
              toast.success(res.message ?? t.convertedToast);
              if (res.id) router.push(localePath(`/admin/reservations/${res.id}`, dict.locale));
              else router.refresh();
            } else toast.error(res.error ?? dict.dash.common.error);
          })
        }
      >
        <Wand2 className="h-4 w-4" /> {t.convert}
      </Button>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </section>
  );
}
