"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MailCheck, ArrowLeft } from "lucide-react";
import { forgotPasswordAction, type ActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { AuthHeading, AuthStatusIcon, AuthError } from "./auth-heading";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";

export function ForgotPasswordForm() {
  const dict = useI18n();
  const t = dict.auth.forgot;
  const [state, action, pending] = useActionState<ActionState, FormData>(forgotPasswordAction, { ok: false });

  if (state.ok) {
    return (
      <div className="text-center">
        <AuthStatusIcon>
          <MailCheck className="h-7 w-7" />
        </AuthStatusIcon>
        <h1 className="mt-7 font-display text-[2rem] font-normal leading-tight text-foreground">{t.doneTitle}</h1>
        <p className="mt-3 leading-relaxed text-muted">{state.message}</p>
        <Button asChild variant="outline" className="mt-8">
          <Link href={localePath("/login", dict.locale)}>{t.back}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <AuthHeading title={t.title} subtitle={t.subtitle} />
      <form action={action} className="mt-9 space-y-4">
        <Field label={dict.auth.login.email} htmlFor="email" required>
          <Input id="email" name="email" type="email" placeholder={dict.auth.emailPlaceholder} required autoComplete="email" />
        </Field>
        {state.error && <AuthError message={state.error} />}
        <Button type="submit" size="lg" loading={pending} className="w-full">{t.submit}</Button>
      </form>
      <p className="mt-8 border-t border-border pt-6 text-center text-sm">
        <Link href={localePath("/login", dict.locale)} className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-terracotta">
          <ArrowLeft className="h-4 w-4" /> {t.back}
        </Link>
      </p>
    </div>
  );
}
