import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createResidence } from "@/server/actions/owner";
import { PageHeader } from "@/components/dashboard/page-header";
import { ResidenceForm } from "@/components/dashboard/residence-form";

export const metadata = { title: "Nouvelle résidence - Admin" };

export default async function AdminNewResidencePage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const [amenities, destinations, owners] = await Promise.all([
    prisma.amenity.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.destination.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: { in: ["OWNER", "ADMIN", "SUPER_ADMIN"] } }, select: { id: true, firstName: true, lastName: true, email: true }, orderBy: { firstName: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/residences" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Résidences
      </Link>
      <PageHeader title="Nouvelle résidence" description="Créez une résidence et attribuez-la a un propriétaire." />
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <ResidenceForm
          action={createResidence}
          amenities={amenities}
          destinations={destinations}
          scope="admin"
          defaultStatus="PUBLISHED"
          owners={owners.map((o) => ({ id: o.id, name: `${o.firstName} ${o.lastName} (${o.email})` }))}
          submitLabel="Créer la résidence"
        />
      </div>
    </div>
  );
}
