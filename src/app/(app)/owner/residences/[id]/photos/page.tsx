import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getOwnerResidence } from "@/lib/owner-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { PhotosManager } from "@/components/dashboard/photos-manager";

export const metadata = { title: "Photos de la residence" };

export default async function ResidencePhotosPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const residence = await getOwnerResidence(user.id, id);
  if (!residence) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Photos"
        description="Ajoutez au moins 5 photos de qualite. La photo de couverture est mise en avant."
        breadcrumbs={[{ label: "Mes residences", href: "/owner/residences" }, { label: residence.name, href: `/owner/residences/${id}` }, { label: "Photos" }]}
      />
      <PhotosManager entityId={id} images={residence.images} />
    </div>
  );
}
