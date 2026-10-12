"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { recordManualPayment, type PayAdminResult } from "@/server/actions/payments-admin";
import { paymentMethodMeta } from "@/lib/enums";
import { useI18n } from "@/components/i18n/provider";

const METHODS = ["WAVE", "ORANGE_MONEY", "MTN_MOMO", "MOOV_MONEY", "CARD", "BANK_TRANSFER", "MANUAL"];

export function ManualPaymentForm({ reservationId, defaultAmount }: { reservationId: string; defaultAmount: number }) {
  const router = useRouter();
  const dict = useI18n();
  const t = dict.dashAdmin.ops.manualPayment;
  const [state, action, pending] = useActionState<PayAdminResult, FormData>(recordManualPayment, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="reservationId" value={reservationId} />
      <div className="flex items-start gap-2 rounded-xl bg-warning-50 px-3.5 py-2.5 text-xs leading-relaxed text-warning-800 ring-1 ring-inset ring-warning-200/70">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        {t.warning}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.amount} htmlFor="amount" required>
          <Input id="amount" name="amount" type="number" min={1} step="100" defaultValue={defaultAmount} required />
        </Field>
        <Field label={t.method} htmlFor="method">
          <NativeSelect id="method" name="method" defaultValue="MANUAL">
            {METHODS.map((m) => (
              <option key={m} value={m}>{dict.enums.paymentMethod[m]?.label ?? paymentMethodMeta[m]?.label ?? m}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t.reference} htmlFor="reference">
          <Input id="reference" name="reference" placeholder={t.referencePh} />
        </Field>
        <Field label={t.paidAt} htmlFor="paidAt">
          <Input id="paidAt" name="paidAt" type="date" />
        </Field>
      </div>
      <Field label={t.comment} htmlFor="comment">
        <Textarea id="comment" name="comment" rows={2} placeholder={t.commentPh} />
      </Field>
      <Button type="submit" loading={pending} className="w-full">
        <CheckCircle2 className="h-4 w-4" /> {t.submit}
      </Button>
    </form>
  );
}
