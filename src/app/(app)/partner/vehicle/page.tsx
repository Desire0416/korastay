import { redirect } from "next/navigation";
import { Car } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { VehicleForm } from "@/components/dashboard/vehicle-form";

export const metadata = { title: "Mon véhicule - Partenaire" };

export default async function PartnerVehiclePage() {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const profile = await prisma.partnerProfile.findUnique({ where: { userId: user.id } });

  if (!profile) redirect("/partner");
  if (profile.type !== "TRANSPORT") redirect("/partner/services");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Mon véhicule" description="Les informations affichees aux voyageurs lors de vos missions de transport." />

      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 text-sm text-brand-800">
        <Car className="h-5 w-5 shrink-0 text-brand-600" />
        Un véhicule a jour rassure les voyageurs et facilité l&apos;attribution des missions de transfert.
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <VehicleForm
          defaults={{
            vehicleType: profile.vehicleType ?? "",
            vehicleBrand: profile.vehicleBrand ?? "",
            vehiclePlate: profile.vehiclePlate ?? "",
            vehicleSeats: profile.vehicleSeats,
            drivingLicenseUrl: profile.drivingLicenseUrl ?? "",
          }}
        />
      </div>
    </div>
  );
}
