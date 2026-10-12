import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createResidence } from "@/server/actions/owner";
import { PageHeader } from "@/components/dashboard/page-header";
import { ResidenceForm } from "@/components/dashboard/residence-form";
import { card } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.catalog.residence.newMeta };
}

export default async function AdminNewResidencePage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const [amenities, destinations, owners, { locale, dict }] = await Promise.all([
    prisma.amenity.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.destination.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: { in: ["OWNER", "ADMIN", "SUPER_ADMIN"] } },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: "asc" },
    }),
    getI18n(),
  ]);
  const t = dict.dashAdmin.catalog.residence;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={localePath("/admin/residences", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader title={t.newTitle} description={t.newSubtitle} />
      <div className={`${card} p-6 sm:p-8`}>
        <ResidenceForm
          action={createResidence}
          amenities={amenities}
          destinations={destinations}
          scope="admin"
          defaultStatus="PUBLISHED"
          owners={owners.map((o) => ({ id: o.id, name: `${o.firstName} ${o.lastName} (${o.email})` }))}
          submitLabel={dict.dashOwner.newResidence.submit}
        />
      </div>
    </div>
  );
}
