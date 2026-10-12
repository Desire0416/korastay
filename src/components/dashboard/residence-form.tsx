"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/components/i18n/provider";
import type { OwnerResult } from "@/server/actions/owner";

interface Amenity { id: string; name: string; slug?: string; icon: string | null }
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

const TYPES = ["STUDIO", "T2", "T3", "VILLA"] as const;

export function ResidenceForm({
  action, amenities, selectedAmenityIds = [], defaults = {}, destinations, submitLabel,
  owners, selectedOwnerId, scope = "owner", defaultStatus,
}: ResidenceFormProps) {
  const dict = useI18n();
  const t = dict.dashOwner.form;
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
    <form action={formAction} className="space-y-9">
      <input type="hidden" name="scope" value={scope} />

      {/* Section admin : proprietaire & statut */}
      {isAdmin && owners && (
        <Section title={t.adminSection}>
          <Field label={t.owner} htmlFor="ownerId" required>
            <NativeSelect id="ownerId" name="ownerId" defaultValue={selectedOwnerId ?? ""} required>
              <option value="" disabled>{t.selectOwner}</option>
              {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label={t.status} htmlFor="status" hint={t.statusHint}>
            <NativeSelect id="status" name="status" defaultValue={defaultStatus ?? "PUBLISHED"}>
              <option value="PUBLISHED">{t.statusPublished}</option>
              <option value="PENDING_VALIDATION">{t.statusPending}</option>
              <option value="UNPUBLISHED">{t.statusUnpublished}</option>
            </NativeSelect>
          </Field>
        </Section>
      )}

      {/* Informations generales */}
      <Section title={t.general}>
        <Field label={t.name} htmlFor="name" required className="sm:col-span-2">
          <Input id="name" name="name" defaultValue={dv.name} placeholder={t.namePh} required />
        </Field>
        <Field label={t.type} htmlFor="type" required>
          <NativeSelect id="type" name="type" defaultValue={dv.type ?? "STUDIO"}>
            {TYPES.map((type) => (
              <option key={type} value={type}>{dict.enums.residenceType[type] ?? type}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={t.city} htmlFor="city" required>
          <Input list="cities" id="city" name="city" defaultValue={dv.city} placeholder={t.cityPh} required />
          <datalist id="cities">
            {destinations.map((d) => <option key={d.name} value={d.name} />)}
          </datalist>
        </Field>
        <Field label={t.district} htmlFor="district">
          <Input id="district" name="district" defaultValue={dv.district} placeholder={t.districtPh} />
        </Field>
        <Field label={t.address} htmlFor="address">
          <Input id="address" name="address" defaultValue={dv.address} placeholder={t.addressPh} />
        </Field>
        <Field label={t.description} htmlFor="description" required className="sm:col-span-2">
          <Textarea id="description" name="description" defaultValue={dv.description} placeholder={t.descriptionPh} rows={5} required />
        </Field>
      </Section>

      {/* Capacite */}
      <Section title={t.capacitySection} cols={4}>
        <Field label={t.capacity} htmlFor="capacity" required>
          <Input id="capacity" name="capacity" type="number" min={1} defaultValue={dv.capacity ?? 2} required />
        </Field>
        <Field label={t.bedrooms} htmlFor="bedrooms" required>
          <Input id="bedrooms" name="bedrooms" type="number" min={0} defaultValue={dv.bedrooms ?? 1} required />
        </Field>
        <Field label={t.beds} htmlFor="beds" required>
          <Input id="beds" name="beds" type="number" min={1} defaultValue={dv.beds ?? 1} required />
        </Field>
        <Field label={t.bathrooms} htmlFor="bathrooms" required>
          <Input id="bathrooms" name="bathrooms" type="number" min={1} defaultValue={dv.bathrooms ?? 1} required />
        </Field>
      </Section>

      {/* Tarifs */}
      <Section title={t.pricing} cols={3}>
        <Field label={t.price} htmlFor="pricePerNight" required>
          <Input id="pricePerNight" name="pricePerNight" type="number" min={1000} step={500} defaultValue={dv.pricePerNight} placeholder="25000" required />
        </Field>
        <Field label={t.cleaning} htmlFor="cleaningFee">
          <Input id="cleaningFee" name="cleaningFee" type="number" min={0} step={500} defaultValue={dv.cleaningFee ?? 0} placeholder="5000" />
        </Field>
        <Field label={t.deposit} htmlFor="depositAmount">
          <Input id="depositAmount" name="depositAmount" type="number" min={0} step={1000} defaultValue={dv.depositAmount ?? 0} placeholder="30000" />
        </Field>
      </Section>

      {/* Caution & demande */}
      <Section title={t.cautionSection}>
        <Toggle name="cautionEnabled" defaultChecked={dv.cautionEnabled ?? false} title={t.cautionEnabled} hint={t.cautionEnabledHint} />
        <Field label={t.cautionJustification} htmlFor="cautionJustification" className="sm:col-span-2" hint={t.cautionJustificationHint}>
          <Input id="cautionJustification" name="cautionJustification" defaultValue={dv.cautionJustification ?? ""} placeholder={t.cautionJustificationPh} />
        </Field>
        <Toggle name="isHighDemand" defaultChecked={dv.isHighDemand ?? false} title={t.highDemand} hint={t.highDemandHint} />
      </Section>

      {/* Horaires */}
      <Section title={t.schedule}>
        <Field label={t.checkIn} htmlFor="checkInTime">
          <Input id="checkInTime" name="checkInTime" type="time" defaultValue={dv.checkInTime ?? "14:00"} />
        </Field>
        <Field label={t.checkOut} htmlFor="checkOutTime">
          <Input id="checkOutTime" name="checkOutTime" type="time" defaultValue={dv.checkOutTime ?? "11:00"} />
        </Field>
        <Field label={t.rules} htmlFor="houseRules" className="sm:col-span-2">
          <Textarea id="houseRules" name="houseRules" defaultValue={dv.houseRules} placeholder={t.rulesPh} rows={3} />
        </Field>
      </Section>

      {/* Equipements */}
      <div>
        <SectionHeading title={t.amenities} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {amenities.map((a) => (
            <label
              key={a.id}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm transition-colors hover:border-ink/30 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
            >
              <input type="checkbox" name="amenities" value={a.id} defaultChecked={selectedAmenityIds.includes(a.id)} className="peer sr-only" />
              <Icon name={a.icon} className="h-4 w-4 text-muted peer-checked:text-brand-600" />
              <span className="text-foreground">{(a.slug && dict.enums.amenity[a.slug]) || a.name}</span>
            </label>
          ))}
        </div>
      </div>

      {state.error && (
        <div className="flex items-center gap-2 rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 ring-1 ring-inset ring-danger-200/70">
          <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" loading={pending}>{submitLabel}</Button>
        <p className="text-sm text-muted">{isAdmin ? t.adminNote : t.ownerNote}</p>
      </div>
    </form>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h3 className="mb-4 flex items-center gap-3 font-display text-xl text-foreground">
      {title}
      <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-sand-300 to-transparent" />
    </h3>
  );
}

function Section({ title, children, cols = 2 }: { title: string; children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  const grid = cols === 4 ? "grid-cols-2 lg:grid-cols-4" : cols === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2";
  return (
    <div>
      <SectionHeading title={title} />
      <div className={`grid gap-4 ${grid}`}>{children}</div>
    </div>
  );
}

function Toggle({ name, defaultChecked, title, hint }: { name: string; defaultChecked: boolean; title: string; hint: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/15 bg-white p-4 transition-colors hover:border-ink/30 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50/60 sm:col-span-2">
      <input type="checkbox" name={name} value="1" defaultChecked={defaultChecked} className="mt-0.5 h-5 w-5 rounded border-ink/25 text-brand-500 focus:ring-brand-400" />
      <span>
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
    </label>
  );
}
