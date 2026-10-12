import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getOwnerResidence } from "@/lib/owner-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { PhotosManager } from "@/components/dashboard/photos-manager";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashOwner.photosPage.metaTitle };
}

export default async function ResidencePhotosPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const [residence, { dict }] = await Promise.all([getOwnerResidence(user.id, id), getI18n()]);
  if (!residence) notFound();
  const t = dict.dashOwner.photosPage;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t.title}
        description={t.subtitle}
        breadcrumbs={[
          { label: dict.dashOwner.residences.title, href: "/owner/residences" },
          { label: residence.name, href: `/owner/residences/${id}` },
          { label: t.title },
        ]}
      />
      <PhotosManager entityId={id} images={residence.images} />
    </div>
  );
}
