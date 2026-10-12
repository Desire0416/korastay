import Link from "next/link";
import { Compass } from "lucide-react";
import { getActivities } from "@/lib/activity-queries";
import { getAllDestinations } from "@/lib/queries";
import { ActivityCard } from "@/components/public/activity-card";
import { PageHero } from "@/components/public/page-hero";
import { EmptyState } from "@/components/ui/empty-state";
import { activityCategoryMeta } from "@/lib/enums";
import { enumLabel } from "@/lib/dictionaries/enums";
import { cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { alternatesFor } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: dict.activities.metaTitle,
    description: dict.activities.metaDescription,
    alternates: alternatesFor("/activites"),
  };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const chip = (active: boolean, small = false) =>
  cn(
    "shrink-0 rounded-full border font-semibold transition-colors",
    small ? "px-3.5 py-1.5 text-[13px]" : "px-4 py-2 text-sm",
    active ? "border-ink bg-ink text-white" : "border-ink/15 bg-white/60 text-foreground hover:border-ink/40"
  );

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const city = str(sp.city);
  const category = str(sp.category);

  const [activities, destinations, { locale, dict }] = await Promise.all([
    getActivities({ city, category }),
    getAllDestinations(),
    getI18n(),
  ]);
  const t = dict.activities;
  const destWith = destinations.filter((d) => d.isActive);

  const href = (params: { city?: string; category?: string }) => {
    const qs = new URLSearchParams();
    if (params.category) qs.set("category", params.category);
    if (params.city) qs.set("city", params.city);
    const q = qs.toString();
    return localePath(q ? `/activites?${q}` : "/activites", locale);
  };

  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} accent={t.accent} description={t.subtitle}>
        <div className="space-y-3">
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
            <Link href={href({ city })} className={chip(!category)}>
              {t.allCategories}
            </Link>
            {Object.keys(activityCategoryMeta).map((value) => (
              <Link key={value} href={href({ city, category: value })} className={chip(category === value)}>
                {enumLabel(dict.enums.activityCategory, value)}
              </Link>
            ))}
          </div>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
            <Link href={href({ category })} className={chip(!city, true)}>
              {dict.search.allCities}
            </Link>
            {destWith.map((d) => (
              <Link key={d.slug} href={href({ city: d.slug, category })} className={chip(city === d.slug, true)}>
                {d.name}
              </Link>
            ))}
          </div>
        </div>
      </PageHero>

      <div className="container-page py-10 md:py-14">
        {activities.length === 0 ? (
          <EmptyState icon={Compass} title={t.emptyTitle} description={t.emptyDesc} />
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
            {activities.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
