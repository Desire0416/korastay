import Link from "next/link";
import { Plus, Pencil, Compass, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAllActivitiesAdmin } from "@/lib/activity-queries";
import { toggleActivityPublish } from "@/server/actions/activities";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { SmartImage } from "@/components/ui/smart-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { activityCategoryMeta } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Activites - Admin" };

export default async function AdminActivitiesPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const activities = await getAllActivitiesAdmin();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Activites"
        description="Catalogue d'activites et experiences (reservees avec un guide)."
        actions={<Button asChild><Link href="/admin/activities/new"><Plus className="h-4 w-4" /> Nouvelle activite</Link></Button>}
      />

      {activities.length === 0 ? (
        <EmptyState icon={Compass} title="Aucune activite" description="Creez votre premiere activite." action={<Button asChild><Link href="/admin/activities/new">Nouvelle activite</Link></Button>} />
      ) : (
        <div className="space-y-3">
          {activities.map((a) => (
            <div key={a.id} className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-4 shadow-soft">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-2xl"><SmartImage src={a.images[0]?.url} alt={a.name} seed={`act-${a.slug}`} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-foreground">{a.name}</h3>
                  <Badge tone={a.status === "PUBLISHED" ? "success" : "neutral"}>{a.status === "PUBLISHED" ? "Publiee" : "Brouillon"}</Badge>
                  <Badge tone="brand">{activityCategoryMeta[a.category]?.label ?? a.category}</Badge>
                </div>
                <p className="text-xs text-muted">{a.city} · {a.durationHours}h · {formatPrice(a.pricePerPerson)}/pers.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {a.status === "PUBLISHED" && <Link href={`/activites/${a.slug}`} target="_blank" className="text-muted hover:text-brand-600"><ExternalLink className="h-4 w-4" /></Link>}
                <Button asChild variant="outline" size="sm"><Link href={`/admin/activities/${a.id}/edit`}><Pencil className="h-3.5 w-3.5" /> Editer</Link></Button>
                <AdminActions actions={[{ label: a.status === "PUBLISHED" ? "Depublier" : "Publier", fn: toggleActivityPublish.bind(null, a.id), variant: a.status === "PUBLISHED" ? "ghost" : "soft" }]} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
