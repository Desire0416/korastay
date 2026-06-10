"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateContentPage, type AdminResult } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";

export function ContentPageForm({ id, title, body }: { id: string; title: string; body: string }) {
  const action = updateContentPage.bind(null, id);
  const [state, formAction, pending] = useActionState<AdminResult, FormData>(action, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Titre" htmlFor="title" required>
        <Input id="title" name="title" defaultValue={title} required />
      </Field>
      <Field label="Contenu" htmlFor="body" required hint="Separez les paragraphes par une ligne vide.">
        <Textarea id="body" name="body" defaultValue={body} rows={16} required />
      </Field>
      <Button type="submit" loading={pending}>Enregistrer</Button>
    </form>
  );
}
