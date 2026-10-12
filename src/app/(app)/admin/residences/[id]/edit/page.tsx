import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateResidence } from "@/server/actions/owner";
import { PageHeader } from "@/components/dashboard/page-header";
import { ResidenceForm } from "@/components/dashboard/residence-form";
import { card } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.catalog.residence.editMeta };
}

export default async function AdminEditResidencePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const [residence, amenities, destinations, owners, { locale, dict }] = await Promise.all([
    prisma.residence.findUnique({ where: { id }, include: { amenities: true } }),
    prisma.amenity.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.destination.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: { in: ["OWNER", "ADMIN", "SUPER_ADMIN"] } },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: "asc" },
    }),
    getI18n(),
  ]);
  if (!residence) notFound();
  const t = dict.dashAdmin.catalog.residence;

  const boundUpdate = updateResidence.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={localePath(`/admin/residences/${id}`, locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.backToResidence}
      </Link>
      <PageHeader title={t.editTitle} description={residence.name} />
      <div className={`${card} p-6 sm:p-8`}>
        <ResidenceForm
          action={boundUpdate}
          amenities={amenities}
          destinations={destinations}
          scope="admin"
          selectedAmenityIds={residence.amenities.map((a) => a.amenityId)}
          owners={owners.map((o) => ({ id: o.id, name: `${o.firstName} ${o.lastName} (${o.email})` }))}
          selectedOwnerId={residence.ownerId}
          defaultStatus={residence.status}
          defaults={{
            name: residence.name, type: residence.type, city: residence.city,
            district: residence.district ?? "", address: residence.address ?? "",
            description: residence.description, capacity: residence.capacity,
            bedrooms: residence.bedrooms, beds: residence.beds, bathrooms: residence.bathrooms,
            pricePerNight: residence.pricePerNight, cleaningFee: residence.cleaningFee,
            depositAmount: residence.depositAmount, checkInTime: residence.checkInTime,
            cautionEnabled: residence.cautionEnabled, cautionJustification: residence.cautionJustification ?? "",
            isHighDemand: residence.isHighDemand,
            checkOutTime: residence.checkOutTime, houseRules: residence.houseRules ?? "",
          }}
          submitLabel={dict.dashOwner.editResidence.submit}
        />
      </div>
    </div>
  );
}
