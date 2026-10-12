import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, CheckCircle2, Images } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActivityByIdAdmin } from "@/lib/activity-queries";
import { addActivityImage, deleteActivityImage, setActivityCoverImage, deleteActivity } from "@/server/actions/activities";
import { PageHeader } from "@/components/dashboard/page-header";
import { ActivityForm } from "@/components/dashboard/activity-form";
import { PhotosManager } from "@/components/dashboard/photos-manager";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { Button } from "@/components/ui/button";
import { card, cardTitle } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.catalog.activity.editMeta };
}

type SP = Record<string, string | string[] | undefined>;

export default async function EditActivityPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const sp = await searchParams;
  const [activity, destinations, { locale, dict }] = await Promise.all([
    getActivityByIdAdmin(id),
    prisma.destination.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: "asc" } }),
    getI18n(),
  ]);
  if (!activity) notFound();
  const t = dict.dashAdmin.catalog.activity;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={localePath("/admin/activities", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader
        title={t.editTitle}
        description={activity.name}
        actions={
          <>
            {activity.status === "PUBLISHED" && (
              <Button asChild variant="outline" size="sm">
                <Link href={localePath(`/activites/${activity.slug}`, locale)} target="_blank"><ExternalLink className="h-4 w-4" /> {t.view}</Link>
              </Button>
            )}
            <AdminActions
              actions={[{ label: t.delete, icon: "Trash2", fn: deleteActivity.bind(null, activity.id), variant: "ghost", confirm: t.confirmDelete, redirectTo: "/admin/activities" }]}
            />
          </>
        }
      />

      {sp.created === "1" && (
        <div className="mb-5 flex items-center gap-3 rounded-[1.25rem] bg-brand-50 p-4 text-sm text-brand-800 ring-1 ring-inset ring-brand-200/70">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" /> {t.created}
        </div>
      )}

      <section className={`${card} mb-6 p-5 sm:p-6`}>
        <h2 className={`${cardTitle} mb-1`}>
          <Images className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.photosTitle}
        </h2>
        <p className="mb-5 text-sm text-muted">{t.photosText}</p>
        <PhotosManager entityId={activity.id} images={activity.images} onAdd={addActivityImage} onDelete={deleteActivityImage} onSetCover={setActivityCoverImage} />
      </section>

      <div className={`${card} p-6 sm:p-8`}>
        <ActivityForm
          id={activity.id}
          destinations={destinations}
          defaults={{
            name: activity.name,
            category: activity.category,
            city: activity.city,
            description: activity.description,
            shortDescription: activity.shortDescription ?? "",
            durationHours: activity.durationHours,
            pricePerPerson: activity.pricePerPerson,
            minPersons: activity.minPersons,
            maxPersons: activity.maxPersons,
            difficulty: activity.difficulty ?? "",
            included: activity.included ?? "",
            meetingPoint: activity.meetingPoint ?? "",
            isPublished: activity.status === "PUBLISHED",
          }}
        />
      </div>
    </div>
  );
}
