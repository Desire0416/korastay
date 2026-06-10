"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, Mail, Lock } from "lucide-react";
import { loginAction, type ActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    loginAction,
    { ok: false }
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Bon retour parmi nous</h1>
      <p className="mt-1.5 text-muted">Connectez-vous a votre espace KoraStay.</p>

      <form action={action} className="mt-7 space-y-4">
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
        <Field label="Email" htmlFor="email" required>
          <Input id="email" name="email" type="email" placeholder="vous@email.com" required autoComplete="email" />
        </Field>
        <Field label="Mot de passe" htmlFor="password" required>
          <Input id="password" name="password" type="password" placeholder="********" required autoComplete="current-password" />
        </Field>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Mot de passe oublie ?
          </Link>
        </div>

        {state.error && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">
            <AlertCircle className="h-4 w-4" />
            {state.error}
          </div>
        )}

        <Button type="submit" size="lg" loading={pending} className="w-full">
          Se connecter
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          Creer un compte
        </Link>
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface-soft/40 p-4 text-xs text-muted">
        <p className="font-bold text-foreground">Comptes de demonstration</p>
        <p className="mt-1">traveler@korastay.com - owner@korastay.com - admin@korastay.com</p>
        <p>Mot de passe : <span className="font-mono font-semibold">Password123!</span></p>
      </div>
    </div>
  );
}
