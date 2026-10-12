import Link from "next/link";
import { Plus, Pencil, Compass, ExternalLink, MapPin, Clock } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getAllActivitiesAdmin } from "@/lib/activity-queries";
import { toggleActivityPublish } from "@/server/actions/activities";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { SmartImage } from "@/components/ui/smart-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { card } from "@/components/dashboard/styles";
import { activityCategoryMeta } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.catalog.activities.metaTitle };
}

export default async function AdminActivitiesPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const [activities, { locale, dict }] = await Promise.all([getAllActivitiesAdmin(), getI18n()]);
  const t = dict.dashAdmin.catalog.activities;
  const newHref = localePath("/admin/activities/new", locale);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={t.title}
        description={t.subtitle}
        actions={<Button asChild variant="terracotta"><Link href={newHref}><Plus className="h-4 w-4" /> {t.add}</Link></Button>}
      />

      {activities.length === 0 ? (
        <EmptyState icon={Compass} title={t.emptyTitle} description={t.emptyText} action={<Button asChild><Link href={newHref}>{t.add}</Link></Button>} />
      ) : (
        <div className="space-y-3">
          {activities.map((a) => {
            const published = a.status === "PUBLISHED";
            return (
              <div key={a.id} className={`${card} flex flex-wrap items-center gap-4 p-4`}>
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-arch-sm">
                  <SmartImage src={a.images[0]?.url} alt={a.name} seed={`act-${a.slug}`} sizes="64px" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg leading-tight text-foreground">{a.name}</h3>
                    <Badge tone={published ? "success" : "neutral"} size="sm">{published ? t.published : t.draft}</Badge>
                    <Badge tone="terracotta" size="sm">{dict.enums.activityCategory[a.category] ?? activityCategoryMeta[a.category]?.label ?? a.category}</Badge>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {a.city}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {a.durationHours} h</span>
                    <span className="font-semibold text-foreground">{t.perPerson.replace("{price}", formatPrice(a.pricePerPerson))}</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {published && (
                    <Link href={localePath(`/activites/${a.slug}`, locale)} target="_blank" className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-sand-50 hover:text-ink">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link href={localePath(`/admin/activities/${a.id}/edit`, locale)}><Pencil className="h-3.5 w-3.5" /> {t.edit}</Link>
                  </Button>
                  <AdminActions actions={[{ label: published ? t.unpublish : t.publish, fn: toggleActivityPublish.bind(null, a.id), variant: published ? "ghost" : "soft" }]} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
