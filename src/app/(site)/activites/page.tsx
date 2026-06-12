import Link from "next/link";
import { Sparkles, Clock, Users, Star, MapPin, Compass } from "lucide-react";
import { getActivities, type ActivityCardData } from "@/lib/activity-queries";
import { getAllDestinations } from "@/lib/queries";
import { SmartImage } from "@/components/ui/smart-image";
import { EmptyState } from "@/components/ui/empty-state";
import { activityCategoryMeta } from "@/lib/enums";
import { formatPrice, cn } from "@/lib/utils";

export const metadata = {
  title: "Activités & expériences",
  description: "Excursions, visites de sites, expériences culturelles et sorties nature dans les villes couvertes par KoraStay, avec un guide certifie.",
};

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const city = str(sp.city);
  const category = str(sp.category);

  const [activities, destinations] = await Promise.all([
    getActivities({ city, category }),
    getAllDestinations(),
  ]);
  const destWith = destinations.filter((d) => d.isActive);

  return (
    <div>
      <section className="gradient-hero">
        <div className="container-page py-9 text-center md:py-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
            <Sparkles className="h-3.5 w-3.5" /> KoraStay Activités
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Vivez des expériences inoubliables
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted md:text-base">
            Excursions, visites, culture et nature. Chaque activité se reserve avec un guide certifie KoraStay.
          </p>
        </div>
      </section>

      <div className="container-page py-7 md:py-10">
        {/* Filtres */}
        <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
          <Link href="/activites" className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-medium", !category ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border")}>
            Toutes
          </Link>
          {Object.entries(activityCategoryMeta).map(([value, m]) => (
            <Link key={value} href={`/activites?category=${value}${city ? `&city=${city}` : ""}`} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-medium", category === value ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border")}>
              {m.label}
            </Link>
          ))}
        </div>
        <div className="no-scrollbar mb-7 flex gap-2 overflow-x-auto pb-1">
          <Link href={category ? `/activites?category=${category}` : "/activites"} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium", !city ? "border-brand-400 bg-brand-50 text-brand-700" : "border-border text-muted")}>
            Toutes les villes
          </Link>
          {destWith.map((d) => (
            <Link key={d.slug} href={`/activites?city=${d.slug}${category ? `&category=${category}` : ""}`} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium", city === d.slug ? "border-brand-400 bg-brand-50 text-brand-700" : "border-border text-muted")}>
              {d.name}
            </Link>
          ))}
        </div>

        {activities.length === 0 ? (
          <EmptyState icon={Compass} title="Aucune activité" description="Aucune activité ne correspond a ces critères pour le moment." />
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {activities.map((a, i) => (
              <ActivityCard key={a.id} activity={a} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityCard({ activity: a, priority }: { activity: ActivityCardData; priority?: boolean }) {
  const cat = activityCategoryMeta[a.category]?.label ?? a.category;
  return (
    <Link href={`/activites/${a.slug}`} className="group block overflow-hidden rounded-3xl border border-border bg-surface shadow-soft transition-shadow hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden">
        <SmartImage src={a.images[0]?.url} alt={a.name} seed={`act-${a.slug}`} priority={priority} imgClassName="transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-ink shadow-soft">{cat}</span>
      </div>
      <div className="p-3 md:p-4">
        <div className="flex items-start justify-between gap-1.5">
          <h3 className="line-clamp-1 text-[14px] font-bold text-foreground md:text-base">{a.name}</h3>
          {a.ratingCount > 0 && (
            <span className="flex shrink-0 items-center gap-0.5 text-[12px] font-semibold"><Star className="h-3 w-3 fill-gold-500 text-gold-500" />{a.ratingAverage.toFixed(1)}</span>
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted"><MapPin className="h-3 w-3" /> {a.city}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.durationHours}h</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {a.minPersons}-{a.maxPersons}</span>
        </div>
        <p className="mt-2 text-[14px] text-foreground">
          <span className="font-extrabold">{formatPrice(a.pricePerPerson)}</span>
          <span className="text-sm text-muted"> / personne</span>
        </p>
      </div>
    </Link>
  );
}
