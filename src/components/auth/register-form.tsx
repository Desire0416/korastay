"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { AlertCircle, MailCheck, Compass, Home, Handshake } from "lucide-react";
import { registerAction, type ActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type AccountType = "TRAVELER" | "OWNER" | "PARTNER";

const ACCOUNT_OPTIONS: { value: AccountType; label: string; desc: string; icon: typeof Compass }[] = [
  { value: "TRAVELER", label: "Voyageur", desc: "Réserver des séjours", icon: Compass },
  { value: "OWNER", label: "Propriétaire", desc: "Publier mes logements", icon: Home },
  { value: "PARTNER", label: "Partenaire", desc: "Guide, resto, transport…", icon: Handshake },
];

const PARTNER_OPTIONS = [
  { value: "GUIDE", label: "Guide touristique" },
  { value: "TRANSPORT", label: "Chauffeur / Transport" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "ACTIVITY", label: "Activité / expérience" },
  { value: "OTHER", label: "Autre prestataire" },
];

interface Props {
  /** Type pré-sélectionné (utilisé sur /devenir-proprietaire et /partners). */
  defaultType?: AccountType;
  /** Verrouille le type (masque le choix à 3 options) — le sous-type partenaire reste visible. */
  lockType?: boolean;
  title?: string;
  subtitle?: string;
}

export function RegisterForm({ defaultType = "TRAVELER", lockType = false, title, subtitle }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(registerAction, { ok: false });
  const [accountType, setAccountType] = useState<AccountType>(defaultType);

  if (state.ok) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
          <MailCheck className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-foreground">Confirmez votre email</h1>
        <p className="mt-2 text-muted">{state.message}</p>
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface-soft/40 p-4 text-sm text-muted">
          Pensez a vérifier vos <strong>spams</strong>. Le lien de confirmation est valable 24h.
        </div>
        <div className="mt-7 flex flex-col gap-3">
          <Button asChild size="lg"><Link href="/login">Aller a la connexion</Link></Button>
          <Button asChild variant="outline"><Link href="/">Retour a l&apos;accueil</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{title ?? "Créer votre compte"}</h1>
      <p className="mt-1.5 text-muted">{subtitle ?? "Rejoignez KoraStay en quelques secondes."}</p>

      <form action={action} className="mt-7 space-y-4">
        {/* Choix du type de compte */}
        {!lockType ? (
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">Je crée un compte en tant que</p>
            <div className="grid grid-cols-3 gap-2">
              {ACCOUNT_OPTIONS.map((opt) => {
                const active = accountType === opt.value;
                const Icon = opt.icon;
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      "cursor-pointer rounded-2xl border p-3 text-center transition-all",
                      active
                        ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                        : "border-border hover:border-brand-300",
                    )}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value={opt.value}
                      checked={active}
                      onChange={() => setAccountType(opt.value)}
                      className="sr-only"
                    />
                    <Icon className={cn("mx-auto h-5 w-5", active ? "text-brand-600" : "text-muted")} />
                    <span className="mt-1.5 block text-xs font-bold text-foreground">{opt.label}</span>
                    <span className="mt-0.5 block text-[10px] leading-tight text-muted">{opt.desc}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ) : (
          <input type="hidden" name="accountType" value={accountType} />
        )}

        {/* Sous-type partenaire (métier) */}
        {accountType === "PARTNER" && (
          <Field label="Type de partenaire" htmlFor="partnerType" required error={state.fieldErrors?.partnerType}>
            <select
              id="partnerType"
              name="partnerType"
              required
              defaultValue={state.values?.partnerType ?? ""}
              className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] text-foreground focus-visible:border-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
            >
              <option value="" disabled>Choisir votre activité</option>
              {PARTNER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Prenom" htmlFor="firstName" required error={state.fieldErrors?.firstName}>
            <Input id="firstName" name="firstName" placeholder="Marc" required defaultValue={state.values?.firstName ?? ""} />
          </Field>
          <Field label="Nom" htmlFor="lastName" required error={state.fieldErrors?.lastName}>
            <Input id="lastName" name="lastName" placeholder="Yao" required defaultValue={state.values?.lastName ?? ""} />
          </Field>
        </div>
        <Field label="Email" htmlFor="email" required error={state.fieldErrors?.email}>
          <Input id="email" name="email" type="email" placeholder="vous@email.com" required autoComplete="email" defaultValue={state.values?.email ?? ""} />
        </Field>
        <Field label="Téléphone" htmlFor="phone" hint="Optionnel" error={state.fieldErrors?.phone}>
          <Input id="phone" name="phone" placeholder="+225 07 ..." autoComplete="tel" defaultValue={state.values?.phone ?? ""} />
        </Field>
        <Field label="Mot de passe" htmlFor="password" required hint="8 caractères minimum" error={state.fieldErrors?.password}>
          <Input id="password" name="password" type="password" placeholder="********" required autoComplete="new-password" />
        </Field>

        <label className="flex items-start gap-2.5 text-sm text-muted">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-border text-brand-500" />
          <span>
            J'accepte les{" "}
            <Link href="/conditions-generales" className="font-semibold text-brand-600">conditions générales</Link>{" "}
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
          Créer mon compte
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
