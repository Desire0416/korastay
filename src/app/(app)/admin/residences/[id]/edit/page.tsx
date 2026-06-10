import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateResidence } from "@/server/actions/owner";
import { PageHeader } from "@/components/dashboard/page-header";
import { ResidenceForm } from "@/components/dashboard/residence-form";

export const metadata = { title: "Modifier la residence - Admin" };

export default async function AdminEditResidencePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const [residence, amenities, destinations, owners] = await Promise.all([
    prisma.residence.findUnique({ where: { id }, include: { amenities: true } }),
    prisma.amenity.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.destination.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: { in: ["OWNER", "ADMIN", "SUPER_ADMIN"] } }, select: { id: true, firstName: true, lastName: true, email: true }, orderBy: { firstName: "asc" } }),
  ]);
  if (!residence) notFound();

  const boundUpdate = updateResidence.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/admin/residences/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Retour a la residence
      </Link>
      <PageHeader title="Modifier la residence" description={residence.name} />
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
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
            checkOutTime: residence.checkOutTime, houseRules: residence.houseRules ?? "",
          }}
          submitLabel="Enregistrer les modifications"
        />
      </div>
    </div>
  );
}
