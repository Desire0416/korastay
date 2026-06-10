"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
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
  const [state, formAction, pending] = useActionState<LeadResult, FormData>(action, { ok: false });

  if (state.ok) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-success/30 bg-emerald-50 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success text-white">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-success">Demande envoyee !</h3>
        <p className="mt-1.5 max-w-md text-sm text-emerald-800/80">{state.message}</p>
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
                className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] text-foreground focus-visible:border-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
              >
                <option value="" disabled>{f.placeholder ?? "Selectionner..."}</option>
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
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          <AlertCircle className="h-4 w-4" /> {state.error}
        </div>
      )}

      <Button type="submit" size="lg" loading={pending}>{submitLabel}</Button>
    </form>
  );
}
