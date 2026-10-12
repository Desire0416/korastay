"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { sendBusinessQuote, type AdminResult } from "@/server/actions/admin";
import { useI18n } from "@/components/i18n/provider";
import { formatPrice } from "@/lib/utils";

interface Props {
  requestId: string;
  currentAmount?: number | null;
  currentMessage?: string | null;
}

export function BusinessQuoteForm({ requestId, currentAmount, currentMessage }: Props) {
  const t = useI18n().dashAdmin.community.businessRequest;
  const action = sendBusinessQuote.bind(null, requestId);
  const [state, formAction, pending] = useActionState<AdminResult, FormData>(action, { ok: false });

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
          <Input id="quoteAmount" name="quoteAmount" type="number" min={1000} step={1000} defaultValue={currentAmount ?? undefined} placeholder="1500000" required />
        </Field>
        <Field label={t.quoteMessage} htmlFor="quoteMessage">
          <Textarea id="quoteMessage" name="quoteMessage" defaultValue={currentMessage ?? ""} rows={3} placeholder={t.quoteMessagePh} />
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
