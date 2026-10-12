"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Motif } from "@/components/brand/motif";
import { useI18n } from "@/components/i18n/provider";
import type { LeadResult } from "@/server/actions/leads";

export interface LeadField {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  hint?: string;
  full?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
}

interface LeadFormProps {
  action: (prev: LeadResult, formData: FormData) => Promise<LeadResult>;
  fields: LeadField[];
  submitLabel: string;
}

export function LeadForm({ action, fields, submitLabel }: LeadFormProps) {
  const dict = useI18n();
  const [state, formAction, pending] = useActionState<LeadResult, FormData>(action, { ok: false });

  if (state.ok) {
    return (
      <div className="relative flex flex-col items-center overflow-hidden rounded-[1.5rem] bg-brand-500 p-9 text-center text-white">
        <Motif variant="dots" className="text-white/10" />
        <div className="relative flex h-16 w-14 items-center justify-center rounded-arch-sm bg-white/15">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="relative mt-5 font-display text-2xl">{dict.pages.leadForm.sent}</h3>
        <p className="relative mt-2 max-w-md text-sm leading-relaxed text-white/80">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <Field
            key={f.name}
            label={f.label}
            htmlFor={f.name}
            required={f.required}
            hint={f.hint}
            className={f.full || f.type === "textarea" ? "sm:col-span-2" : undefined}
          >
            {f.type === "textarea" ? (
              <Textarea id={f.name} name={f.name} placeholder={f.placeholder} required={f.required} rows={4} />
            ) : f.type === "select" ? (
              <select
                id={f.name}
                name={f.name}
                required={f.required}
                defaultValue={f.defaultValue ?? ""}
                className="h-12 w-full rounded-xl border border-ink/15 bg-white px-4 text-[15px] text-foreground transition-colors hover:border-ink/30 focus-visible:border-terracotta focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-terracotta/10"
              >
                <option value="" disabled>{f.placeholder ?? dict.pages.leadForm.select}</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <Input id={f.name} name={f.name} type={f.type ?? "text"} placeholder={f.placeholder} required={f.required} defaultValue={f.defaultValue} />
            )}
          </Field>
        ))}
      </div>

      {state.error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-danger ring-1 ring-inset ring-red-200/70">
          <AlertCircle className="h-4 w-4" /> {state.error}
        </div>
      )}

      <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">{submitLabel}</Button>
    </form>
  );
}
