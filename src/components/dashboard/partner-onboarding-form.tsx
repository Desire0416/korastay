"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle, ShieldCheck, Contact, FileCheck2, Car, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { UploadField } from "@/components/dashboard/upload-field";
import { VehicleFields } from "@/components/dashboard/vehicle-form";
import { completePartnerOnboarding, type PartnerResult } from "@/server/actions/partner";
import { partnerTypeMeta } from "@/lib/enums";
import { statusText } from "@/lib/dictionaries/enums";
import { useI18n } from "@/components/i18n/provider";

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

const sectionCls = "rounded-[1.5rem] border border-border/80 bg-surface p-6 shadow-soft sm:p-7";

function SectionTitle({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text?: string }) {
  return (
    <div className={text ? "mb-5" : "mb-4"}>
      <h2 className="flex items-center gap-2.5 font-display text-xl text-foreground">
        <Icon className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {title}
      </h2>
      {text && <p className="mt-1 text-sm text-muted">{text}</p>}
    </div>
  );
}

export function PartnerOnboardingForm({ type, defaults }: Props) {
  const dict = useI18n();
  const t = dict.dashPartner.onboarding;
  const vf = dict.dashPartner.vehicleForm;
  const [state, action, pending] = useActionState<PartnerResult, FormData>(completePartnerOnboarding, { ok: false });
  const v = (state.values ?? {}) as Record<string, string>;

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  const isDriver = type === "TRANSPORT";
  const isRestaurant = type === "RESTAURANT";
  const typeLabel = statusText(dict, partnerTypeMeta[type]?.label ?? type);

  return (
    <form action={action} className="space-y-6">
      {/* Informations communes */}
      <section className={sectionCls}>
        <SectionTitle icon={Contact} title={t.basics} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t.phone} htmlFor="phone" required>
            <Input id="phone" name="phone" defaultValue={v.phone ?? defaults.phone ?? ""} placeholder="+225 …" required />
          </Field>
          <Field label={t.whatsapp} htmlFor="whatsapp">
            <Input id="whatsapp" name="whatsapp" defaultValue={v.whatsapp ?? defaults.whatsapp ?? ""} placeholder="+225 …" />
          </Field>
          <Field label={t.city} htmlFor="city" required>
            <Input id="city" name="city" defaultValue={v.city ?? defaults.city ?? ""} placeholder="Abidjan" required />
          </Field>
          <Field label={t.zones} htmlFor="zonesCovered" hint={t.commaHint}>
            <Input id="zonesCovered" name="zonesCovered" defaultValue={v.zonesCovered ?? defaults.zonesCovered ?? ""} placeholder="Cocody, Plateau, Marcory" />
          </Field>
          <Field label={t.languages} htmlFor="languages" hint={t.commaHint} className="sm:col-span-2">
            <Input id="languages" name="languages" defaultValue={v.languages ?? defaults.languages ?? ""} placeholder={t.languagesPh} />
          </Field>
          <Field label={t.description} htmlFor="description" required className="sm:col-span-2">
            <Textarea id="description" name="description" rows={3} defaultValue={v.description ?? defaults.description ?? ""} placeholder={t.descriptionPh} required />
          </Field>
          {isRestaurant && (
            <Field label={t.cuisine} htmlFor="cuisineType" className="sm:col-span-2">
              <Input id="cuisineType" name="cuisineType" defaultValue={v.cuisineType ?? ""} placeholder={t.cuisinePh} />
            </Field>
          )}
        </div>
      </section>

      {/* Justificatifs */}
      <section className={sectionCls}>
        <SectionTitle icon={FileCheck2} title={t.docs} text={t.docsText} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <UploadField name="idDocumentUrl" label={t.idDoc} required kind="document" accept="image/*,application/pdf" hint={t.idDocHint} />
          <UploadField name="coverImageUrl" label={t.cover} hint={t.coverHint} />
          {isDriver && (
            <UploadField name="drivingLicenseUrl" label={vf.license} required kind="document" accept="image/*,application/pdf" hint={t.licenseHint} />
          )}
        </div>
      </section>

      {/* Vehicule (chauffeur) */}
      {isDriver && (
        <section className={sectionCls}>
          <SectionTitle icon={Car} title={t.vehicleTitle} />
          <VehicleFields defaults={v} />
        </section>
      )}

      {state.error && (
        <div className="flex items-center gap-2 rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 ring-1 ring-inset ring-danger-200/70">
          <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <ShieldCheck className="h-4 w-4 text-brand-500" /> {t.spaceLabel.replace("{type}", typeLabel)}
        </p>
        <Button type="submit" size="lg" loading={pending}>{t.submit}</Button>
      </div>
    </form>
  );
}
