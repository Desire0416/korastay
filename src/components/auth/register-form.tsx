"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, MailCheck } from "lucide-react";
import { registerAction, type ActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export function RegisterForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    registerAction,
    { ok: false }
  );

  if (state.ok) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
          <MailCheck className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">Compte cree !</h1>
        <p className="mt-2 text-muted">{state.message}</p>
        <div className="mt-7 flex flex-col gap-3">
          <Button asChild size="lg"><Link href="/account">Acceder a mon espace</Link></Button>
          <Button asChild variant="outline"><Link href="/residences">Explorer les residences</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Creer votre compte</h1>
      <p className="mt-1.5 text-muted">Rejoignez KoraStay en quelques secondes.</p>

      <form action={action} className="mt-7 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prenom" htmlFor="firstName" required error={state.fieldErrors?.firstName}>
            <Input id="firstName" name="firstName" placeholder="Marc" required />
          </Field>
          <Field label="Nom" htmlFor="lastName" required error={state.fieldErrors?.lastName}>
            <Input id="lastName" name="lastName" placeholder="Yao" required />
          </Field>
        </div>
        <Field label="Email" htmlFor="email" required error={state.fieldErrors?.email}>
          <Input id="email" name="email" type="email" placeholder="vous@email.com" required autoComplete="email" />
        </Field>
        <Field label="Telephone" htmlFor="phone" hint="Optionnel" error={state.fieldErrors?.phone}>
          <Input id="phone" name="phone" placeholder="+225 07 ..." autoComplete="tel" />
        </Field>
        <Field label="Mot de passe" htmlFor="password" required hint="8 caracteres minimum" error={state.fieldErrors?.password}>
          <Input id="password" name="password" type="password" placeholder="********" required autoComplete="new-password" />
        </Field>

        <label className="flex items-start gap-2.5 text-sm text-muted">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-border text-brand-500" />
          <span>
            J'accepte les{" "}
            <Link href="/conditions-generales" className="font-semibold text-brand-600">conditions generales</Link>{" "}
            et la{" "}
            <Link href="/confidentialite" className="font-semibold text-brand-600">politique de confidentialite</Link>.
          </span>
        </label>

        {state.error && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">
            <AlertCircle className="h-4 w-4" />
            {state.error}
          </div>
        )}

        <Button type="submit" size="lg" loading={pending} className="w-full">
          Creer mon compte
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Deja un compte ?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
