import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOwnerResidence } from "@/lib/owner-queries";
import { updateResidence } from "@/server/actions/owner";
import { PageHeader } from "@/components/dashboard/page-header";
import { ResidenceForm } from "@/components/dashboard/residence-form";

export const metadata = { title: "Modifier la residence" };

export default async function EditResidencePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const [residence, amenities, destinations] = await Promise.all([
    getOwnerResidence(user.id, id),
    prisma.amenity.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.destination.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!residence) notFound();

  const boundUpdate = updateResidence.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Modifier la residence"
        breadcrumbs={[{ label: "Mes residences", href: "/owner/residences" }, { label: residence.name, href: `/owner/residences/${id}` }, { label: "Modifier" }]}
      />
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
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
            checkOutTime: residence.checkOutTime, houseRules: residence.houseRules ?? "",
          }}
          submitLabel="Enregistrer les modifications"
        />
      </div>
    </div>
  );
}
