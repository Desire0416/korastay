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
  const [state, formAction, pending] = useActionState<ReservationResult, FormData>(createActivityReservation, { ok: false });
  const [persons, setPersons] = React.useState(minPersons || 1);
  const [guideId, setGuideId] = React.useState("");

  const subtotal = pricePerPerson * persons;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <input type="hidden" name="activityId" value={activityId} />
      <input type="hidden" name="persons" value={persons} />
      <input type="hidden" name="guideProfileId" value={guideId} />

      <p className="flex items-baseline justify-between">
        <span><span className="text-2xl font-extrabold text-foreground">{formatPrice(pricePerPerson)}</span><span className="text-muted"> / personne</span></span>
      </p>

      <div className="mt-4 space-y-3">
        <Field label="Date souhaitee" htmlFor="date" required>
          <Input id="date" name="date" type="date" min={today} required />
        </Field>
        <div className="rounded-2xl border border-border px-4">
          <Stepper label="Participants" hint={`${minPersons} a ${maxPersons} personnes`} value={persons} onChange={setPersons} min={minPersons || 1} max={maxPersons} />
        </div>
      </div>

      {/* Guide obligatoire */}
      <div className="mt-5">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-foreground">
          <UserCheck className="h-4 w-4 text-brand-600" /> Choisissez votre guide <span className="text-danger">*</span>
        </p>
        {guides.length === 0 ? (
          <p className="rounded-2xl bg-gold-50 px-4 py-3 text-sm text-gold-700">
            Aucun guide vérifié n'est disponible dans cette ville pour le moment. Revenez bientôt.
          </p>
        ) : (
          <div className="space-y-2">
            {guides.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGuideId(g.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors",
                  guideId === g.id ? "border-brand-500 bg-brand-50" : "border-border hover:border-brand-300"
                )}
              >
                <Avatar className="h-9 w-9">
                  {g.user.avatarUrl && <AvatarImage src={g.user.avatarUrl} alt="" />}
                  <AvatarFallback className="text-xs">{initials(g.user.firstName, g.user.lastName)}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{g.businessName}</span>
                  <span className="block truncate text-xs text-muted">{g.user.firstName} {g.user.lastName}</span>
                </span>
                <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border", guideId === g.id ? "border-brand-500 bg-brand-500 text-white" : "border-border")}>
                  {guideId === g.id && <CheckCircle2 className="h-4 w-4" />}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Coordonnees */}
      <div className="mt-5 space-y-3">
        <Field label="Nom complet" htmlFor="guestName" required>
          <Input id="guestName" name="guestName" defaultValue={defaultName} required />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Email" htmlFor="guestEmail" required>
            <Input id="guestEmail" name="guestEmail" type="email" defaultValue={defaultEmail} required />
          </Field>
          <Field label="Téléphone" htmlFor="guestPhone">
            <Input id="guestPhone" name="guestPhone" defaultValue={defaultPhone} placeholder="+225 ..." />
          </Field>
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm text-foreground/90">
        <input type="checkbox" name="acceptTerms" value="1" required className="mt-0.5 h-4 w-4 rounded border-border text-brand-500" />
        <span>J'accepte les <a href="/conditions-generales" target="_blank" className="font-semibold text-brand-600 underline">conditions</a>.</span>
      </label>

      {/* Recap */}
      <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
        <div className="flex justify-between text-muted"><span>{formatPrice(pricePerPerson)} x {persons}</span><span className="text-foreground">{formatPrice(subtotal)}</span></div>
        <p className="text-xs text-muted">Frais de service ajoutés a l'étape suivante. Aucun paiement maintenant : validation puis acompte.</p>
      </div>

      {state.error && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          <AlertCircle className="h-4 w-4" /> {state.error}
        </div>
      )}

      <Button type="submit" size="lg" loading={pending} disabled={guides.length === 0} className="mt-4 w-full">
        <Lock className="h-4 w-4" /> Envoyer ma demande
      </Button>
    </form>
  );
}
