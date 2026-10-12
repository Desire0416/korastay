import { redirect } from "next/navigation";
import { Car } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { VehicleForm } from "@/components/dashboard/vehicle-form";
import { card } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashPartner.vehicle.metaTitle };
}

export default async function PartnerVehiclePage() {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const [profile, { locale, dict }] = await Promise.all([prisma.partnerProfile.findUnique({ where: { userId: user.id } }), getI18n()]);

  if (!profile) redirect(localePath("/partner", locale));
  if (profile.type !== "TRANSPORT") redirect(localePath("/partner/services", locale));
  const t = dict.dashPartner.vehicle;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t.title} description={t.subtitle} />

      <div className="mb-5 flex items-center gap-3 rounded-[1.25rem] bg-sand-50 p-4 text-sm text-foreground/85 ring-1 ring-inset ring-sand-200">
        <Car className="h-5 w-5 shrink-0 text-terracotta" strokeWidth={1.7} />
        {t.note}
      </div>

      <div className={`${card} p-6 sm:p-8`}>
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
