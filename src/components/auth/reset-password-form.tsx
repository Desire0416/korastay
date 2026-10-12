"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { resetPasswordAction, type ActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { AuthHeading, AuthStatusIcon, AuthError } from "./auth-heading";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";

export function ResetPasswordForm({ token }: { token: string }) {
  const dict = useI18n();
  const t = dict.auth.reset;
  const [state, action, pending] = useActionState<ActionState, FormData>(resetPasswordAction, { ok: false });

  if (state.ok) {
    return (
      <div className="text-center">
        <AuthStatusIcon>
          <CheckCircle2 className="h-7 w-7" />
        </AuthStatusIcon>
        <h1 className="mt-7 font-display text-[2rem] font-normal leading-tight text-foreground">{t.doneTitle}</h1>
        <p className="mt-3 leading-relaxed text-muted">{state.message}</p>
        <Button asChild size="lg" className="mt-8">
          <Link href={localePath("/login", dict.locale)}>{t.login}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <AuthHeading title={t.title} subtitle={t.subtitle} />
      <form action={action} className="mt-9 space-y-4">
        <input type="hidden" name="token" value={token} />
        <Field label={t.password} htmlFor="password" required hint={dict.auth.register.passwordHint}>
          <Input id="password" name="password" type="password" placeholder="********" required autoComplete="new-password" />
        </Field>
        {state.error && <AuthError message={state.error} />}
        <Button type="submit" size="lg" loading={pending} className="w-full">{t.submit}</Button>
      </form>
    </div>
  );
}
