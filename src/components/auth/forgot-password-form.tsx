"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, MailCheck } from "lucide-react";
import { forgotPasswordAction, type ActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    forgotPasswordAction,
    { ok: false }
  );

  if (state.ok) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
          <MailCheck className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">Vérifiez vos emails</h1>
        <p className="mt-2 text-muted">{state.message}</p>
        <Button asChild variant="outline" className="mt-7"><Link href="/login">Retour a la connexion</Link></Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Mot de passe oublie</h1>
      <p className="mt-1.5 text-muted">Saisissez votre email pour recevoir un lien de reinitialisation.</p>
      <form action={action} className="mt-7 space-y-4">
        <Field label="Email" htmlFor="email" required>
          <Input id="email" name="email" type="email" placeholder="vous@email.com" required />
        </Field>
        {state.error && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">
            <AlertCircle className="h-4 w-4" /> {state.error}
          </div>
        )}
        <Button type="submit" size="lg" loading={pending} className="w-full">Envoyer le lien</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-semibold text-brand-600">Retour a la connexion</Link>
      </p>
    </div>
  );
}
