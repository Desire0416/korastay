"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateContentPage, type AdminResult } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { useI18n } from "@/components/i18n/provider";

export function ContentPageForm({ id, title, body }: { id: string; title: string; body: string }) {
  const t = useI18n().dashAdmin.system.pageForm;
  const action = updateContentPage.bind(null, id);
  const [state, formAction, pending] = useActionState<AdminResult, FormData>(action, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      <Field label={t.title} htmlFor="title" required>
        <Input id="title" name="title" defaultValue={title} required />
      </Field>
      <Field label={t.body} htmlFor="body" required hint={t.bodyHint}>
        <Textarea id="body" name="body" defaultValue={body} rows={22} required className="font-mono text-xs leading-relaxed" />
      </Field>
      <div className="border-t border-border pt-5">
        <Button type="submit" loading={pending}>{t.save}</Button>
      </div>
    </form>
  );
}
