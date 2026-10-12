"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type ActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { AuthHeading, AuthError } from "./auth-heading";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const dict = useI18n();
  const t = dict.auth.login;
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, { ok: false });

  return (
    <div>
      <AuthHeading title={t.title} accent={t.accent} subtitle={t.subtitle} />

      <form action={action} className="mt-9 space-y-4">
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
        <Field label={t.email} htmlFor="email" required>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="vous@email.com"
            required
            autoComplete="email"
            defaultValue={state.values?.email ?? ""}
          />
        </Field>
        <Field label={t.password} htmlFor="password" required>
          <Input id="password" name="password" type="password" placeholder="********" required autoComplete="current-password" />
        </Field>

        <div className="flex justify-end">
          <Link href={localePath("/forgot-password", dict.locale)} className="text-sm font-semibold text-terracotta hover:text-terracotta-700">
            {t.forgot}
          </Link>
        </div>

        {state.error && <AuthError message={state.error} />}

        <Button type="submit" size="lg" loading={pending} className="w-full">
          {t.submit}
        </Button>
      </form>

      <p className="mt-8 border-t border-border pt-6 text-center text-sm text-muted">
        {t.noAccount}{" "}
        <Link href={localePath("/register", dict.locale)} className="font-semibold text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink">
          {t.createAccount}
        </Link>
      </p>
    </div>
  );
}
