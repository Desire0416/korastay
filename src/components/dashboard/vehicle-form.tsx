"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { UploadField } from "@/components/dashboard/upload-field";
import { savePartnerVehicle, type PartnerResult } from "@/server/actions/partner";
import { useI18n } from "@/components/i18n/provider";

interface Props {
  defaults: {
    vehicleType?: string;
    vehicleBrand?: string;
    vehiclePlate?: string;
    vehicleSeats?: number | null;
    drivingLicenseUrl?: string;
  };
}

/** Champs vehicule partages avec l'onboarding chauffeur. */
export function VehicleFields({ defaults }: { defaults: Record<string, string | number | null | undefined> }) {
  const t = useI18n().dashPartner.vehicleForm;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label={t.type} htmlFor="vehicleType" required>
        <Input id="vehicleType" name="vehicleType" defaultValue={defaults.vehicleType ?? ""} placeholder={t.typePh} required />
      </Field>
      <Field label={t.brand} htmlFor="vehicleBrand">
        <Input id="vehicleBrand" name="vehicleBrand" defaultValue={defaults.vehicleBrand ?? ""} placeholder="Toyota Corolla" />
      </Field>
      <Field label={t.plate} htmlFor="vehiclePlate">
        <Input id="vehiclePlate" name="vehiclePlate" defaultValue={defaults.vehiclePlate ?? ""} placeholder="1234 AB 01" />
      </Field>
      <Field label={t.seats} htmlFor="vehicleSeats">
        <Input id="vehicleSeats" name="vehicleSeats" type="number" min={1} max={60} defaultValue={defaults.vehicleSeats ?? ""} placeholder="4" />
      </Field>
    </div>
  );
}

export function VehicleForm({ defaults }: Props) {
  const router = useRouter();
  const t = useI18n().dashPartner.vehicleForm;
  const [state, action, pending] = useActionState<PartnerResult, FormData>(savePartnerVehicle, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [state, router]);

  return (
    <form action={action} className="space-y-6">
      <VehicleFields defaults={defaults} />
      <UploadField
        name="drivingLicenseUrl"
        label={t.license}
        defaultUrl={defaults.drivingLicenseUrl ?? ""}
        kind="document"
        accept="image/*,application/pdf"
        hint={t.licenseHint}
      />
      <div className="border-t border-border pt-5">
        <Button type="submit" loading={pending}>{t.submit}</Button>
      </div>
    </form>
  );
}
