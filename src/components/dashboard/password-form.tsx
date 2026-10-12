"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { changePassword, type FormResult } from "@/server/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { useI18n } from "@/components/i18n/provider";

export function PasswordForm() {
  const dict = useI18n();
  const t = dict.dashAccount.passwordForm;
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
      <Field label={t.current} htmlFor="currentPassword" required>
        <Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
      </Field>
      <Field label={t.next} htmlFor="newPassword" required hint={t.hint}>
        <Input id="newPassword" name="newPassword" type="password" required autoComplete="new-password" />
      </Field>
      <Button type="submit" loading={pending}>{t.submit}</Button>
    </form>
  );
}
