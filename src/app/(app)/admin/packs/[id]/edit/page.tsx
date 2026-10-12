import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink, Images } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { PackEditor } from "@/components/dashboard/pack-editor";
import { DeletePackButton } from "@/components/dashboard/delete-pack-button";
import { PhotosManager } from "@/components/dashboard/photos-manager";
import { Button } from "@/components/ui/button";
import { card, cardTitle } from "@/components/dashboard/styles";
import { addPackImage, deletePackImage, setPackCoverImage } from "@/server/actions/admin";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.catalog.pack.editMeta };
}

export default async function EditPackPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const [pack, destinations, { locale, dict }] = await Promise.all([
    prisma.pack.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        includedItems: { orderBy: { sortOrder: "asc" } },
        programDays: { orderBy: { sortOrder: "asc" }, include: { activities: { orderBy: { sortOrder: "asc" } } } },
      },
    }),
    prisma.destination.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    getI18n(),
  ]);
  if (!pack) notFound();
  const t = dict.dashAdmin.catalog.pack;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={localePath("/admin/packs", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.backPacks}
      </Link>
      <PageHeader
        title={t.editTitle}
        description={pack.name}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={localePath(`/packs/${pack.slug}`, locale)} target="_blank"><ExternalLink className="h-4 w-4" /> {t.view}</Link>
            </Button>
            <DeletePackButton id={pack.id} />
          </>
        }
      />
      <section className={`${card} mb-6 p-5 sm:p-6`}>
        <h2 className={`${cardTitle} mb-1`}>
          <Images className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.photosTitle}
        </h2>
        <p className="mb-5 text-sm text-muted">{t.photosText}</p>
        <PhotosManager entityId={pack.id} images={pack.images} onAdd={addPackImage} onDelete={deletePackImage} onSetCover={setPackCoverImage} />
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
