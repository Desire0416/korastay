"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { OwnerResult } from "@/server/actions/owner";

interface Amenity { id: string; name: string; icon: string | null }
interface ResidenceDefaults {
  name?: string; type?: string; city?: string; district?: string; address?: string;
  description?: string; capacity?: number; bedrooms?: number; beds?: number;
  bathrooms?: number; pricePerNight?: number; cleaningFee?: number; depositAmount?: number;
  cautionEnabled?: boolean; cautionJustification?: string; isHighDemand?: boolean;
  checkInTime?: string; checkOutTime?: string; houseRules?: string;
}

interface ResidenceFormProps {
  action: (prev: OwnerResult, formData: FormData) => Promise<OwnerResult>;
  amenities: Amenity[];
  selectedAmenityIds?: string[];
  defaults?: ResidenceDefaults;
  destinations: { name: string }[];
  submitLabel: string;
  /** Mode admin : liste des proprietaires assignables. */
  owners?: { id: string; name: string }[];
  selectedOwnerId?: string;
  scope?: "owner" | "admin";
  defaultStatus?: string;
}

export function ResidenceForm({
  action, amenities, selectedAmenityIds = [], defaults = {}, destinations, submitLabel,
  owners, selectedOwnerId, scope = "owner", defaultStatus,
}: ResidenceFormProps) {
  const [state, formAction, pending] = useActionState<OwnerResult, FormData>(action, { ok: false });
  const isAdmin = scope === "admin";
  // Conserve les valeurs saisies si la validation echoue (React 19 reinitialise
  // le formulaire apres une action : on reinjecte les valeurs renvoyees).
  const dv = { ...defaults, ...(state.values as Partial<ResidenceDefaults> | undefined) };

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="scope" value={scope} />

      {/* Section admin : proprietaire & statut */}
      {isAdmin && owners && (
        <Section title="Attribution (admin)">
          <Field label="Propriétaire" htmlFor="ownerId" required>
            <select id="ownerId" name="ownerId" defaultValue={selectedOwnerId ?? ""} required className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] focus-visible:border-brand-400 focus-visible:outline-none">
              <option value="" disabled>Sélectionner un propriétaire</option>
              {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </Field>
          <Field label="Statut" htmlFor="status" hint="Publier rend la résidence visible immédiatement.">
            <select id="status" name="status" defaultValue={defaultStatus ?? "PUBLISHED"} className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] focus-visible:border-brand-400 focus-visible:outline-none">
              <option value="PUBLISHED">Publiée (vérifiée)</option>
              <option value="PENDING_VALIDATION">En attente de validation</option>
              <option value="UNPUBLISHED">Dépubliée</option>
            </select>
          </Field>
        </Section>
      )}

      {/* Informations generales */}
      <Section title="Informations générales">
        <Field label="Nom de la résidence" htmlFor="name" required className="sm:col-span-2">
          <Input id="name" name="name" defaultValue={dv.name} placeholder="Lux Résidence Daloa" required />
        </Field>
        <Field label="Type de logement" htmlFor="type" required>
          <select id="type" name="type" defaultValue={dv.type ?? "STUDIO"} className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] focus-visible:border-brand-400 focus-visible:outline-none">
            <option value="STUDIO">Studio meublé</option>
            <option value="T2">Appartement T2</option>
            <option value="T3">Appartement T3</option>
            <option value="VILLA">Villa / Maison</option>
          </select>
        </Field>
        <Field label="Ville" htmlFor="city" required>
          <input list="cities" id="city" name="city" defaultValue={dv.city} placeholder="Daloa" required className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] focus-visible:border-brand-400 focus-visible:outline-none" />
          <datalist id="cities">
            {destinations.map((d) => <option key={d.name} value={d.name} />)}
          </datalist>
        </Field>
        <Field label="Quartier" htmlFor="district">
          <Input id="district" name="district" defaultValue={dv.district} placeholder="Lobia 2" />
        </Field>
        <Field label="Adresse" htmlFor="address">
          <Input id="address" name="address" defaultValue={dv.address} placeholder="Adresse complète (non publique)" />
        </Field>
        <Field label="Description" htmlFor="description" required className="sm:col-span-2">
          <Textarea id="description" name="description" defaultValue={dv.description} placeholder="Decrivez votre résidence, son ambiance, ses atouts..." rows={5} required />
        </Field>
      </Section>

      {/* Capacite */}
      <Section title="Capacité & couchage">
        <Field label="Voyageurs max" htmlFor="capacity" required>
          <Input id="capacity" name="capacity" type="number" min={1} defaultValue={dv.capacity ?? 2} required />
        </Field>
        <Field label="Chambres" htmlFor="bedrooms" required>
          <Input id="bedrooms" name="bedrooms" type="number" min={0} defaultValue={dv.bedrooms ?? 1} required />
        </Field>
        <Field label="Lits" htmlFor="beds" required>
          <Input id="beds" name="beds" type="number" min={1} defaultValue={dv.beds ?? 1} required />
        </Field>
        <Field label="Salles de bain" htmlFor="bathrooms" required>
          <Input id="bathrooms" name="bathrooms" type="number" min={1} defaultValue={dv.bathrooms ?? 1} required />
        </Field>
      </Section>

      {/* Tarifs */}
      <Section title="Tarifs (F CFA)">
        <Field label="Prix par nuit" htmlFor="pricePerNight" required>
          <Input id="pricePerNight" name="pricePerNight" type="number" min={1000} step={500} defaultValue={dv.pricePerNight} placeholder="25000" required />
        </Field>
        <Field label="Frais de ménage" htmlFor="cleaningFee">
          <Input id="cleaningFee" name="cleaningFee" type="number" min={0} step={500} defaultValue={dv.cleaningFee ?? 0} placeholder="5000" />
        </Field>
        <Field label="Montant de la caution" htmlFor="depositAmount">
          <Input id="depositAmount" name="depositAmount" type="number" min={0} step={1000} defaultValue={dv.depositAmount ?? 0} placeholder="30000" />
        </Field>
      </Section>

      {/* Caution & demande */}
      <Section title="Caution & demande">
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-3.5 sm:col-span-2">
          <input type="checkbox" name="cautionEnabled" value="1" defaultChecked={dv.cautionEnabled ?? false} className="mt-0.5 h-5 w-5 rounded border-border text-brand-500 focus:ring-brand-400" />
          <span>
            <span className="block text-sm font-semibold text-foreground">Exiger une caution (dépôt de garantie)</span>
            <span className="block text-xs text-muted">Le montant ci-dessus pourra être bloqué puis restitué au départ.</span>
          </span>
        </label>
        <Field label="Justification de la caution" htmlFor="cautionJustification" className="sm:col-span-2" hint="Affichee au voyageur (ex: objets de valeur, équipements fragiles).">
          <Input id="cautionJustification" name="cautionJustification" defaultValue={dv.cautionJustification ?? ""} placeholder="Ex: protection des équipements" />
        </Field>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-3.5 sm:col-span-2">
          <input type="checkbox" name="isHighDemand" value="1" defaultChecked={dv.isHighDemand ?? false} className="mt-0.5 h-5 w-5 rounded border-border text-brand-500 focus:ring-brand-400" />
          <span>
            <span className="block text-sm font-semibold text-foreground">Résidence a forte demande</span>
            <span className="block text-xs text-muted">Paiement de 100% exige a la réservation (selon les regles de paiement).</span>
          </span>
        </label>
      </Section>

      {/* Horaires */}
      <Section title="Arrivée & départ">
        <Field label="Heure d'arrivée" htmlFor="checkInTime">
          <Input id="checkInTime" name="checkInTime" type="time" defaultValue={dv.checkInTime ?? "14:00"} />
        </Field>
        <Field label="Heure de départ" htmlFor="checkOutTime">
          <Input id="checkOutTime" name="checkOutTime" type="time" defaultValue={dv.checkOutTime ?? "11:00"} />
        </Field>
        <Field label="Règlement intérieur" htmlFor="houseRules" className="sm:col-span-2">
          <Textarea id="houseRules" name="houseRules" defaultValue={dv.houseRules} placeholder="Non fumeur, pas de fetes, respect du voisinage..." rows={3} />
        </Field>
      </Section>

      {/* Equipements */}
      <div>
        <h3 className="mb-3 font-bold text-foreground">Équipements</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {amenities.map((a) => (
            <label key={a.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm transition-colors has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
              <input type="checkbox" name="amenities" value={a.id} defaultChecked={selectedAmenityIds.includes(a.id)} className="peer sr-only" />
              <Icon name={a.icon} className="h-4 w-4 text-muted peer-checked:text-brand-600" />
              <span className="text-foreground">{a.name}</span>
            </label>
          ))}
        </div>
      </div>

      {state.error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          <AlertCircle className="h-4 w-4" /> {state.error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" loading={pending}>{submitLabel}</Button>
        <p className="text-sm text-muted">
          {isAdmin ? "Vous gérez cette résidence en tant qu'administrateur." : "Votre résidence sera soumise a validation KoraStay."}
        </p>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-bold text-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}
