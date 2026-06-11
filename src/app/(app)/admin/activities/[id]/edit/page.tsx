import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActivityByIdAdmin } from "@/lib/activity-queries";
import { addActivityImage, deleteActivityImage, setActivityCoverImage, deleteActivity } from "@/server/actions/activities";
import { PageHeader } from "@/components/dashboard/page-header";
import { ActivityForm } from "@/components/dashboard/activity-form";
import { PhotosManager } from "@/components/dashboard/photos-manager";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Editer l'activite - Admin" };

type SP = Record<string, string | string[] | undefined>;

export default async function EditActivityPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const sp = await searchParams;
  const [activity, destinations] = await Promise.all([
    getActivityByIdAdmin(id),
    prisma.destination.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!activity) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/activities" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Activites
      </Link>
      <PageHeader
        title="Editer l'activite"
        description={activity.name}
        actions={
          <div className="flex gap-2">
            {activity.status === "PUBLISHED" && (
              <Button asChild variant="outline" size="sm"><Link href={`/activites/${activity.slug}`} target="_blank"><ExternalLink className="h-4 w-4" /> Voir</Link></Button>
            )}
            <AdminActions actions={[{ label: "Supprimer", icon: "Trash2", fn: deleteActivity.bind(null, activity.id), variant: "ghost", confirm: "Supprimer cette activite ?", redirectTo: "/admin/activities" }]} />
          </div>
        }
      />

      {sp.created === "1" && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-success/30 bg-emerald-50 p-4 text-sm text-success">
          <CheckCircle2 className="h-5 w-5" /> Activite creee. Ajoutez des photos ci-dessous.
        </div>
      )}

      <section className="mb-6 rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <h2 className="mb-1 font-bold text-foreground">Photos de l'activite</h2>
        <p className="mb-4 text-sm text-muted">Importez des photos (la premiere sert de couverture).</p>
        <PhotosManager entityId={activity.id} images={activity.images} onAdd={addActivityImage} onDelete={deleteActivityImage} onSetCover={setActivityCoverImage} />
      </section>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
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
