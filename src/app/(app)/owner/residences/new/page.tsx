import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createResidence } from "@/server/actions/owner";
import { PageHeader } from "@/components/dashboard/page-header";
import { ResidenceForm } from "@/components/dashboard/residence-form";

export const metadata = { title: "Nouvelle residence" };

export default async function NewResidencePage() {
  await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const [amenities, destinations] = await Promise.all([
    prisma.amenity.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.destination.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Ajouter une residence"
        description="Renseignez les informations de votre logement. Il sera soumis a validation."
        breadcrumbs={[{ label: "Mes residences", href: "/owner/residences" }, { label: "Nouvelle" }]}
      />
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <ResidenceForm
          action={createResidence}
          amenities={amenities}
          destinations={destinations}
          submitLabel="Creer la residence"
        />
      </div>
    </div>
  );
}
