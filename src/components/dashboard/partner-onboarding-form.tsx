"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { UploadField } from "@/components/dashboard/upload-field";
import { completePartnerOnboarding, type PartnerResult } from "@/server/actions/partner";
import { partnerTypeMeta } from "@/lib/enums";

interface Props {
  type: string;
  defaults: {
    businessName: string;
    description?: string;
    phone?: string;
    whatsapp?: string;
    city?: string;
    zonesCovered?: string;
    languages?: string;
  };
}

export function PartnerOnboardingForm({ type, defaults }: Props) {
  const [state, action, pending] = useActionState<PartnerResult, FormData>(completePartnerOnboarding, { ok: false });
  const v = (state.values ?? {}) as Record<string, string>;

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  const isDriver = type === "TRANSPORT";
  const isRestaurant = type === "RESTAURANT";

  return (
    <form action={action} className="space-y-6">
      {/* Informations communes */}
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-4 font-bold text-foreground">Informations de base</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Téléphone" htmlFor="phone" required>
            <Input id="phone" name="phone" defaultValue={v.phone ?? defaults.phone ?? ""} placeholder="+225 ..." required />
          </Field>
          <Field label="WhatsApp" htmlFor="whatsapp">
            <Input id="whatsapp" name="whatsapp" defaultValue={v.whatsapp ?? defaults.whatsapp ?? ""} placeholder="+225 ..." />
          </Field>
          <Field label="Ville principale" htmlFor="city" required>
            <Input id="city" name="city" defaultValue={v.city ?? defaults.city ?? ""} placeholder="Abidjan" required />
          </Field>
          <Field label="Zones couvertes" htmlFor="zonesCovered" hint="Separees par des virgules">
            <Input id="zonesCovered" name="zonesCovered" defaultValue={v.zonesCovered ?? defaults.zonesCovered ?? ""} placeholder="Cocody, Plateau, Marcory" />
          </Field>
          <Field label="Langues parlees" htmlFor="languages" hint="Separees par des virgules" className="sm:col-span-2">
            <Input id="languages" name="languages" defaultValue={v.languages ?? defaults.languages ?? ""} placeholder="Français, Anglais, Dioula" />
          </Field>
          <Field label="Présentation de votre activité" htmlFor="description" required className="sm:col-span-2">
            <Textarea id="description" name="description" rows={3} defaultValue={v.description ?? defaults.description ?? ""} placeholder="Decrivez votre activité, votre expérience, vos points forts..." required />
          </Field>
          {isRestaurant && (
            <Field label="Type de cuisine" htmlFor="cuisineType" className="sm:col-span-2">
              <Input id="cuisineType" name="cuisineType" defaultValue={v.cuisineType ?? ""} placeholder="Ivoirienne, fast-food, maquis, gastronomique..." />
            </Field>
          )}
        </div>
      </section>

      {/* Justificatifs */}
      <section className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <h2 className="mb-1 font-bold text-foreground">Justificatifs</h2>
        <p className="mb-4 text-sm text-muted">Vos documents restent confidentiels et servent uniquement a la vérification.</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <UploadField name="idDocumentUrl" label="Pièce d'identité" required kind="document" accept="image/*,application/pdf" hint="CNI, passeport ou permis (image ou PDF)." />
          <UploadField name="coverImageUrl" label="Photo de votre espace" hint="Visuel affiche aux voyageurs (optionnel)." />
          {isDriver && (
            <UploadField name="drivingLicenseUrl" label="Permis de conduire" required kind="document" accept="image/*,application/pdf" hint="Obligatoire pour les chauffeurs." />
          )}
        </div>
      </section>

      {/* Vehicule (chauffeur) */}
      {isDriver && (
        <section className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
          <h2 className="mb-4 font-bold text-foreground">Votre véhicule</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Type de véhicule" htmlFor="vehicleType" required>
              <Input id="vehicleType" name="vehicleType" defaultValue={v.vehicleType ?? ""} placeholder="Berline, SUV, minibus, van..." required />
            </Field>
            <Field label="Marque / modele" htmlFor="vehicleBrand">
              <Input id="vehicleBrand" name="vehicleBrand" defaultValue={v.vehicleBrand ?? ""} placeholder="Toyota Corolla" />
            </Field>
            <Field label="Immatriculation" htmlFor="vehiclePlate">
              <Input id="vehiclePlate" name="vehiclePlate" defaultValue={v.vehiclePlate ?? ""} placeholder="1234 AB 01" />
            </Field>
            <Field label="Nombre de places" htmlFor="vehicleSeats">
              <Input id="vehicleSeats" name="vehicleSeats" type="number" min={1} max={60} defaultValue={v.vehicleSeats ?? ""} placeholder="4" />
            </Field>
          </div>
        </section>
      )}

      {state.error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          <AlertCircle className="h-4 w-4" /> {state.error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <ShieldCheck className="h-4 w-4 text-brand-500" /> Espace {partnerTypeMeta[type]?.label.toLowerCase()}
        </p>
        <Button type="submit" size="lg" loading={pending}>Terminer ma configuration</Button>
      </div>
    </form>
  );
}
