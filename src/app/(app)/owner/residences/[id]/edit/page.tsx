import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOwnerResidence } from "@/lib/owner-queries";
import { updateResidence } from "@/server/actions/owner";
import { PageHeader } from "@/components/dashboard/page-header";
import { ResidenceForm } from "@/components/dashboard/residence-form";
import { card } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashOwner.editResidence.metaTitle };
}

export default async function EditResidencePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const [residence, amenities, destinations, { dict }] = await Promise.all([
    getOwnerResidence(user.id, id),
    prisma.amenity.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.destination.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: "asc" } }),
    getI18n(),
  ]);
  if (!residence) notFound();
  const t = dict.dashOwner.editResidence;

  const boundUpdate = updateResidence.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={t.title}
        breadcrumbs={[
          { label: dict.dashOwner.residences.title, href: "/owner/residences" },
          { label: residence.name, href: `/owner/residences/${id}` },
          { label: t.crumb },
        ]}
      />
      <div className={`${card} p-6 sm:p-8`}>
        <ResidenceForm
          action={boundUpdate}
          amenities={amenities}
          destinations={destinations}
          selectedAmenityIds={residence.amenities.map((a) => a.amenityId)}
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
          submitLabel={t.submit}
        />
      </div>
    </div>
  );
}
