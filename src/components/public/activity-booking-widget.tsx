"use client";

import * as React from "react";
import { useActionState } from "react";
import { AlertCircle, CheckCircle2, UserCheck, Lock } from "lucide-react";
import { createActivityReservation, type ReservationResult } from "@/server/actions/reservations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Stepper } from "@/components/ui/stepper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPrice, initials, cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";

interface Guide {
  id: string;
  businessName: string;
  user: { firstName: string; lastName: string; avatarUrl: string | null };
}

interface Props {
  activityId: string;
  pricePerPerson: number;
  minPersons: number;
  maxPersons: number;
  guides: Guide[];
  defaultName: string;
  defaultEmail: string;
  defaultPhone: string;
}

export function ActivityBookingWidget({
  activityId, pricePerPerson, minPersons, maxPersons, guides, defaultName, defaultEmail, defaultPhone,
}: Props) {
  const dict = useI18n();
  const w = dict.activities.widget;
  const [state, formAction, pending] = useActionState<ReservationResult, FormData>(createActivityReservation, { ok: false });
  const [persons, setPersons] = React.useState(minPersons || 1);
  const [guideId, setGuideId] = React.useState("");

  const subtotal = pricePerPerson * persons;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="relative overflow-hidden rounded-[1.75rem] border border-border bg-surface p-6 pt-8 shadow-card">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 overflow-hidden">
        <div className="motif motif-kente text-terracotta/70" />
      </div>
      <input type="hidden" name="activityId" value={activityId} />
      <input type="hidden" name="persons" value={persons} />
      <input type="hidden" name="guideProfileId" value={guideId} />

      <p>
        <span className="font-display text-[2rem] leading-none text-foreground">{formatPrice(pricePerPerson)}</span>
        <span className="text-muted"> {w.perPerson}</span>
      </p>

      <div className="mt-6 space-y-3">
        <Field label={w.desiredDate} htmlFor="date" required>
          <Input id="date" name="date" type="date" min={today} required />
        </Field>
        <div className="rounded-xl border border-ink/15 px-4">
          <Stepper
            label={w.participants}
            hint={dict.activities.personsRange.replace("{min}", String(minPersons)).replace("{max}", String(maxPersons))}
            value={persons}
            onChange={setPersons}
            min={minPersons || 1}
            max={maxPersons}
          />
        </div>
      </div>

      {/* Guide obligatoire */}
      <div className="mt-6">
        <p className="eyebrow mb-3 flex items-center gap-1.5 text-[10.5px] text-muted">
          <UserCheck className="h-4 w-4 text-terracotta" /> {w.chooseGuide} <span className="text-danger">*</span>
        </p>
        {guides.length === 0 ? (
          <p className="rounded-xl bg-gold-50 px-4 py-3 text-sm text-gold-800 ring-1 ring-inset ring-gold-200/70">{w.noGuide}</p>
        ) : (
          <div className="space-y-2">
            {guides.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGuideId(g.id)}
                aria-pressed={guideId === g.id}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
                  guideId === g.id ? "border-ink bg-white shadow-soft ring-1 ring-ink" : "border-ink/15 bg-white hover:border-ink/35"
                )}
              >
                <Avatar className="h-10 w-10">
                  {g.user.avatarUrl && <AvatarImage src={g.user.avatarUrl} alt="" />}
                  <AvatarFallback className="text-xs">{initials(g.user.firstName, g.user.lastName)}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{g.businessName}</span>
                  <span className="block truncate text-xs text-muted">{g.user.firstName} {g.user.lastName}</span>
                </span>
                <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border", guideId === g.id ? "border-ink bg-ink text-white" : "border-ink/25")}>
                  {guideId === g.id && <CheckCircle2 className="h-4 w-4" />}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Coordonnees */}
      <div className="mt-6 space-y-3 border-t border-border pt-6">
        <Field label={w.fullName} htmlFor="guestName" required>
          <Input id="guestName" name="guestName" defaultValue={defaultName} required />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={w.email} htmlFor="guestEmail" required>
            <Input id="guestEmail" name="guestEmail" type="email" defaultValue={defaultEmail} required />
          </Field>
          <Field label={w.phone} htmlFor="guestPhone">
            <Input id="guestPhone" name="guestPhone" defaultValue={defaultPhone} placeholder="+225 ..." />
          </Field>
        </div>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-sm text-foreground/90">
        <input type="checkbox" name="acceptTerms" value="1" required className="mt-0.5 h-4 w-4 rounded border-ink/30 text-brand-500" />
        <span>
          {w.acceptPrefix}
          <a href={localePath("/conditions-generales", dict.locale)} target="_blank" className="font-semibold text-terracotta underline underline-offset-2">
            {w.terms}
          </a>
          .
        </span>
      </label>

      {/* Recap */}
      <div className="mt-5 space-y-2 rounded-[1.25rem] bg-sand-50 p-4 text-sm ring-1 ring-inset ring-sand-200">
        <div className="flex justify-between text-muted">
          <span>{formatPrice(pricePerPerson)} × {persons}</span>
          <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
        </div>
        <p className="text-xs leading-relaxed text-muted">{w.recapNote}</p>
      </div>

      {state.error && (
        <div role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-danger ring-1 ring-inset ring-red-200/70">
          <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}

      <Button type="submit" size="lg" loading={pending} disabled={guides.length === 0} className="mt-5 w-full">
        <Lock className="h-4 w-4" /> {w.submit}
      </Button>
    </form>
  );
}
