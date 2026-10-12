import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { DestinationForm } from "@/components/dashboard/destination-form";
import { card } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.catalog.destination.editMeta };
}

export default async function EditDestinationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const [dest, { locale, dict }] = await Promise.all([prisma.destination.findUnique({ where: { id } }), getI18n()]);
  if (!dest) notFound();
  const t = dict.dashAdmin.catalog.destination;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={localePath("/admin/destinations", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader title={t.editTitle} description={dest.name} />
      <div className={`${card} p-6 sm:p-8`}>
        <DestinationForm
          id={dest.id}
          defaults={{
            name: dest.name, region: dest.region ?? "", country: dest.country ?? "",
            description: dest.description ?? "", heroImageUrl: dest.heroImageUrl ?? "",
            priority: dest.priority, latitude: dest.latitude, longitude: dest.longitude, isActive: dest.isActive,
          }}
        />
      </div>
    </div>
  );
}
