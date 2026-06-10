"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { changePassword, type FormResult } from "@/server/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormResult, FormData>(changePassword, { ok: false });
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      ref.current?.reset();
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form ref={ref} action={action} className="max-w-md space-y-4">
      <Field label="Mot de passe actuel" htmlFor="currentPassword" required>
        <Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
      </Field>
      <Field label="Nouveau mot de passe" htmlFor="newPassword" required hint="8 caracteres minimum">
        <Input id="newPassword" name="newPassword" type="password" required autoComplete="new-password" />
      </Field>
      <Button type="submit" loading={pending}>Modifier le mot de passe</Button>
    </form>
  );
}
