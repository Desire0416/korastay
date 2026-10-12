"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { MailCheck, Compass, Home, Handshake } from "lucide-react";
import { registerAction, type ActionState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { AuthHeading, AuthStatusIcon, AuthError } from "./auth-heading";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";

type AccountType = "TRAVELER" | "OWNER" | "PARTNER";

const ACCOUNT_OPTIONS: { value: AccountType; icon: typeof Compass }[] = [
  { value: "TRAVELER", icon: Compass },
  { value: "OWNER", icon: Home },
  { value: "PARTNER", icon: Handshake },
];

interface Props {
  /** Type pré-sélectionné (utilisé sur /devenir-proprietaire et /partners). */
  defaultType?: AccountType;
  /** Verrouille le type (masque le choix à 3 options) — le sous-type partenaire reste visible. */
  lockType?: boolean;
  title?: string;
  subtitle?: string;
  /** Code de parrainage pré-rempli (via ?ref=). */
  defaultReferral?: string;
}

export function RegisterForm({ defaultType = "TRAVELER", lockType = false, title, subtitle, defaultReferral = "" }: Props) {
  const dict = useI18n();
  const t = dict.auth.register;
  const [state, action, pending] = useActionState<ActionState, FormData>(registerAction, { ok: false });
  const [accountType, setAccountType] = useState<AccountType>(defaultType);

  if (state.ok) {
    return (
      <div className="text-center">
        <AuthStatusIcon>
          <MailCheck className="h-7 w-7" />
        </AuthStatusIcon>
        <h1 className="mt-7 font-display text-[2rem] font-normal leading-tight text-foreground">{t.doneTitle}</h1>
        <p className="mt-3 leading-relaxed text-muted">{state.message}</p>
        <div className="mt-6 rounded-xl bg-sand-50 p-4 text-sm text-foreground/80 ring-1 ring-inset ring-sand-300/70">{t.doneSpam}</div>
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild size="lg"><Link href={localePath("/login", dict.locale)}>{t.doneLogin}</Link></Button>
          <Button asChild variant="outline"><Link href={localePath("/", dict.locale)}>{t.doneHome}</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AuthHeading title={title ?? t.title} subtitle={subtitle ?? t.subtitle} />

      <form action={action} className="mt-8 space-y-4">
        {/* Choix du type de compte */}
        {!lockType ? (
          <fieldset>
            <legend className="eyebrow mb-3 text-[10.5px] text-muted">{t.accountAs}</legend>
            <div className="grid grid-cols-3 gap-2">
              {ACCOUNT_OPTIONS.map((opt) => {
                const active = accountType === opt.value;
                const Icon = opt.icon;
                const label = t.types[opt.value];
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      "cursor-pointer rounded-xl border bg-white p-3 text-center transition-all",
                      active ? "border-ink shadow-soft ring-1 ring-ink" : "border-ink/15 hover:border-ink/35"
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
                    <Icon className={cn("mx-auto h-5 w-5", active ? "text-terracotta" : "text-muted")} strokeWidth={1.7} />
                    <span className="mt-1.5 block text-xs font-bold text-foreground">{label.label}</span>
                    <span className="mt-0.5 block text-[10px] leading-tight text-muted">{label.desc}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : (
          <input type="hidden" name="accountType" value={accountType} />
        )}

        {/* Sous-type partenaire (métier) */}
        {accountType === "PARTNER" && (
          <Field label={t.partnerType} htmlFor="partnerType" required error={state.fieldErrors?.partnerType}>
            <select
              id="partnerType"
              name="partnerType"
              required
              defaultValue={state.values?.partnerType ?? ""}
              className="h-12 w-full rounded-xl border border-ink/15 bg-white px-4 text-[15px] text-foreground transition-colors hover:border-ink/30 focus-visible:border-terracotta focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-terracotta/10"
            >
              <option value="" disabled>{t.partnerPlaceholder}</option>
              {t.partnerOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label={t.firstName} htmlFor="firstName" required error={state.fieldErrors?.firstName}>
            <Input id="firstName" name="firstName" placeholder="Marc" required autoComplete="given-name" defaultValue={state.values?.firstName ?? ""} />
          </Field>
          <Field label={t.lastName} htmlFor="lastName" required error={state.fieldErrors?.lastName}>
            <Input id="lastName" name="lastName" placeholder="Yao" required autoComplete="family-name" defaultValue={state.values?.lastName ?? ""} />
          </Field>
        </div>
        <Field label={t.email} htmlFor="email" required error={state.fieldErrors?.email}>
          <Input id="email" name="email" type="email" placeholder={dict.auth.emailPlaceholder} required autoComplete="email" defaultValue={state.values?.email ?? ""} />
        </Field>
        <Field label={t.phone} htmlFor="phone" hint={t.optional} error={state.fieldErrors?.phone}>
          <Input id="phone" name="phone" placeholder="+225 07 ..." autoComplete="tel" defaultValue={state.values?.phone ?? ""} />
        </Field>
        <Field label={t.password} htmlFor="password" required hint={t.passwordHint} error={state.fieldErrors?.password}>
          <Input id="password" name="password" type="password" placeholder="********" required autoComplete="new-password" />
        </Field>
        <Field label={t.referral} htmlFor="referralCode" hint={defaultReferral ? t.referralBonus : t.optional}>
          <Input
            id="referralCode"
            name="referralCode"
            placeholder="ABCD23X"
            defaultValue={defaultReferral}
            className="uppercase placeholder:normal-case"
          />
        </Field>

        <label className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-ink/30 text-brand-500" />
          <span>
            {t.acceptPrefix}
            <Link href={localePath("/conditions-generales", dict.locale)} className="font-semibold text-terracotta underline underline-offset-2">{t.terms}</Link>
            {t.and}
            <Link href={localePath("/confidentialite", dict.locale)} className="font-semibold text-terracotta underline underline-offset-2">{t.privacy}</Link>.
          </span>
        </label>

        {state.error && <AuthError message={state.error} />}

        <Button type="submit" size="lg" loading={pending} className="w-full">
          {t.submit}
        </Button>
      </form>

      <p className="mt-8 border-t border-border pt-6 text-center text-sm text-muted">
        {t.hasAccount}{" "}
        <Link href={localePath("/login", dict.locale)} className="font-semibold text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink">
          {t.login}
        </Link>
      </p>
    </div>
  );
}
