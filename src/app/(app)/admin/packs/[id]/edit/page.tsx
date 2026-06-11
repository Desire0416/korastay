import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { PackEditor } from "@/components/dashboard/pack-editor";
import { DeletePackButton } from "@/components/dashboard/delete-pack-button";
import { PhotosManager } from "@/components/dashboard/photos-manager";
import { addPackImage, deletePackImage, setPackCoverImage } from "@/server/actions/admin";

export const metadata = { title: "Modifier le pack" };

export default async function EditPackPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const [pack, destinations] = await Promise.all([
    prisma.pack.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        includedItems: { orderBy: { sortOrder: "asc" } },
        programDays: { orderBy: { sortOrder: "asc" }, include: { activities: { orderBy: { sortOrder: "asc" } } } },
      },
    }),
    prisma.destination.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!pack) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/packs" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Packs
      </Link>
      <PageHeader
        title="Modifier le pack"
        description={pack.name}
        actions={
          <div className="flex gap-2">
            <Link href={`/packs/${pack.slug}`} target="_blank" className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-soft">
              <ExternalLink className="h-4 w-4" /> Voir
            </Link>
            <DeletePackButton id={pack.id} />
          </div>
        }
      />
      <section className="mb-6 rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="mb-1 font-bold text-foreground">Photos du pack</h2>
        <p className="mb-4 text-sm text-muted">Importez des photos (la premiere sert de couverture).</p>
        <PhotosManager
          entityId={pack.id}
          images={pack.images}
          onAdd={addPackImage}
          onDelete={deletePackImage}
          onSetCover={setPackCoverImage}
        />
      </section>

      <PackEditor
        destinations={destinations}
        packId={pack.id}
        defaults={{
          name: pack.name,
          destinationId: pack.destinationId,
          subtitle: pack.subtitle ?? "",
          description: pack.description,
          durationDays: pack.durationDays,
          durationNights: pack.durationNights,
          basePersons: pack.basePersons,
          maxPersons: pack.maxPersons,
          price: pack.price,
          extraPersonPrice: pack.extraPersonPrice,
          status: pack.status,
          meetingPoint: pack.meetingPoint ?? "",
          startTime: pack.startTime ?? "",
          physicalLevel: pack.physicalLevel ?? "",
          clothingRecommendations: pack.clothingRecommendations ?? "",
          documentsToBring: pack.documentsToBring ?? "",
          cancellationPolicy: pack.cancellationPolicy ?? "",
          includedItems: pack.includedItems.map((i) => ({ label: i.label, details: i.details ?? "", included: i.included })),
          programDays: pack.programDays.map((d) => ({
            title: d.title,
            description: d.description ?? "",
            activities: d.activities.map((a) => ({ timeLabel: a.timeLabel ?? "", title: a.title, description: a.description ?? "" })),
          })),
        }}
      />
    </div>
  );
}
