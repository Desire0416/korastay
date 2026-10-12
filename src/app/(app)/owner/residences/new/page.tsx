import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createResidence } from "@/server/actions/owner";
import { PageHeader } from "@/components/dashboard/page-header";
import { ResidenceForm } from "@/components/dashboard/residence-form";
import { card } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashOwner.newResidence.metaTitle };
}

export default async function NewResidencePage() {
  await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const [amenities, destinations, { dict }] = await Promise.all([
    prisma.amenity.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.destination.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: "asc" } }),
    getI18n(),
  ]);
  const t = dict.dashOwner.newResidence;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={t.title}
        description={t.subtitle}
        breadcrumbs={[{ label: dict.dashOwner.residences.title, href: "/owner/residences" }, { label: t.crumb }]}
      />
      <div className={`${card} p-6 sm:p-8`}>
        <ResidenceForm action={createResidence} amenities={amenities} destinations={destinations} submitLabel={t.submit} />
      </div>
    </div>
  );
}
