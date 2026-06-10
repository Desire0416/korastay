"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { resetPasswordAction, type ActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    resetPasswordAction,
    { ok: false }
  );

  if (state.ok) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-success">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">Mot de passe reinitialise</h1>
        <p className="mt-2 text-muted">{state.message}</p>
        <Button asChild size="lg" className="mt-7"><Link href="/login">Se connecter</Link></Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Nouveau mot de passe</h1>
      <p className="mt-1.5 text-muted">Choisissez un nouveau mot de passe securise.</p>
      <form action={action} className="mt-7 space-y-4">
        <input type="hidden" name="token" value={token} />
        <Field label="Nouveau mot de passe" htmlFor="password" required hint="8 caracteres minimum">
          <Input id="password" name="password" type="password" placeholder="********" required autoComplete="new-password" />
        </Field>
        {state.error && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">
            <AlertCircle className="h-4 w-4" /> {state.error}
          </div>
        )}
        <Button type="submit" size="lg" loading={pending} className="w-full">Reinitialiser</Button>
      </form>
    </div>
  );
}
