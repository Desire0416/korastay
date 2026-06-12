"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { UploadField } from "@/components/dashboard/upload-field";
import { savePartnerVehicle, type PartnerResult } from "@/server/actions/partner";

interface Props {
  defaults: {
    vehicleType?: string;
    vehicleBrand?: string;
    vehiclePlate?: string;
    vehicleSeats?: number | null;
    drivingLicenseUrl?: string;
  };
}

export function VehicleForm({ defaults }: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState<PartnerResult, FormData>(savePartnerVehicle, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) { toast.success(state.message); router.refresh(); }
    if (state.error) toast.error(state.error);
  }, [state, router]);

  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Type de véhicule" htmlFor="vehicleType" required>
          <Input id="vehicleType" name="vehicleType" defaultValue={defaults.vehicleType ?? ""} placeholder="Berline, SUV, minibus, van..." required />
        </Field>
        <Field label="Marque / modele" htmlFor="vehicleBrand">
          <Input id="vehicleBrand" name="vehicleBrand" defaultValue={defaults.vehicleBrand ?? ""} placeholder="Toyota Corolla" />
        </Field>
        <Field label="Immatriculation" htmlFor="vehiclePlate">
          <Input id="vehiclePlate" name="vehiclePlate" defaultValue={defaults.vehiclePlate ?? ""} placeholder="1234 AB 01" />
        </Field>
        <Field label="Nombre de places" htmlFor="vehicleSeats">
          <Input id="vehicleSeats" name="vehicleSeats" type="number" min={1} max={60} defaultValue={defaults.vehicleSeats ?? ""} placeholder="4" />
        </Field>
      </div>
      <UploadField name="drivingLicenseUrl" label="Permis de conduire" defaultUrl={defaults.drivingLicenseUrl ?? ""} kind="document" accept="image/*,application/pdf" hint="Mettez a jour votre permis si nécessaire." />
      <Button type="submit" loading={pending}>Enregistrer mon véhicule</Button>
    </form>
  );
}
