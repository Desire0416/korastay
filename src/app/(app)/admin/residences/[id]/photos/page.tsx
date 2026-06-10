import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { PhotosManager } from "@/components/dashboard/photos-manager";

export const metadata = { title: "Photos - Admin" };

export default async function AdminResidencePhotosPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const residence = await prisma.residence.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!residence) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/admin/residences/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Retour a la residence
      </Link>
      <PageHeader title="Photos" description={residence.name} />
      <PhotosManager residenceId={id} images={residence.images} />
    </div>
  );
}
