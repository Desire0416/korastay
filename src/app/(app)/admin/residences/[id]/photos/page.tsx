import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { PhotosManager } from "@/components/dashboard/photos-manager";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashOwner.photosPage.metaTitle };
}

export default async function AdminResidencePhotosPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const [residence, { locale, dict }] = await Promise.all([
    prisma.residence.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    getI18n(),
  ]);
  if (!residence) notFound();
  const t = dict.dashAdmin.catalog.residence;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={localePath(`/admin/residences/${id}`, locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.backToResidence}
      </Link>
      <PageHeader title={dict.dashOwner.photosPage.title} description={residence.name} />
      <PhotosManager entityId={id} images={residence.images} />
    </div>
  );
}
