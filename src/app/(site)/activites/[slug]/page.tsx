import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, Users, MapPin, Star, CheckCircle2, Mountain, Info } from "lucide-react";
import { getActivityBySlug, getCityGuides } from "@/lib/activity-queries";
import { getCurrentUser } from "@/lib/auth";
import { PhotoGallery } from "@/components/public/photo-gallery";
import { ActivityBookingWidget } from "@/components/public/activity-booking-widget";
import { Badge } from "@/components/ui/badge";
import { activityCategoryMeta } from "@/lib/enums";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getActivityBySlug(slug);
  return { title: a?.name ?? "Activite", description: a?.shortDescription ?? undefined };
}

export default async function ActivityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  if (!activity || activity.status !== "PUBLISHED") notFound();

  const [user, guides] = await Promise.all([getCurrentUser(), getCityGuides(activity.city)]);
  const cat = activityCategoryMeta[activity.category]?.label ?? activity.category;
  const included = (activity.included ?? "").split(/\n+/).map((s) => s.trim()).filter(Boolean);

  return (
    <div className="pb-10">
      <div className="relative lg:hidden">
        <Link href="/activites" className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur" aria-label="Retour">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="container-page pt-0 lg:pt-6">
        <div className="mb-4 hidden lg:block">
          <nav className="mb-2 flex items-center gap-1 text-sm text-muted">
            <Link href="/activites" className="hover:text-foreground">Activites</Link>
            <span>/</span><span className="text-foreground">{activity.name}</span>
          </nav>
        </div>

        <div className="-mx-5 lg:mx-0">
          <PhotoGallery images={activity.images} seedPrefix={`act-${activity.slug}`} name={activity.name} />
        </div>

        <div className="mt-4 lg:hidden">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{activity.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted"><MapPin className="h-4 w-4" /> {activity.city}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0">
            <div className="hidden lg:block">
              <Badge tone="brand">{cat}</Badge>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">{activity.name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {activity.city}</span>
                {activity.ratingCount > 0 && <span className="flex items-center gap-1 font-semibold text-foreground"><Star className="h-4 w-4 fill-gold-500 text-gold-500" /> {activity.ratingAverage.toFixed(1)} ({activity.ratingCount})</span>}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-y border-border py-4 text-sm">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-muted" /> {activity.durationHours} h</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-muted" /> {activity.minPersons} a {activity.maxPersons} personnes</span>
              {activity.difficulty && <span className="flex items-center gap-1.5"><Mountain className="h-4 w-4 text-muted" /> {activity.difficulty}</span>}
              <span className="lg:hidden"><Badge tone="brand">{cat}</Badge></span>
            </div>

            <section className="border-b border-border py-7">
              <h2 className="mb-3 text-xl font-bold text-foreground">A propos de cette activite</h2>
              <p className="whitespace-pre-line leading-relaxed text-foreground/90">{activity.description}</p>
            </section>

            {included.length > 0 && (
              <section className="border-b border-border py-7">
                <h2 className="mb-4 text-xl font-bold text-foreground">Ce qui est inclus</h2>
                <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {included.map((it, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/90"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {it}</li>
                  ))}
                </ul>
              </section>
            )}

            {activity.meetingPoint && (
              <section className="py-7">
                <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-foreground"><Info className="h-5 w-5 text-brand-600" /> Point de rendez-vous</h2>
                <p className="text-foreground/90">{activity.meetingPoint}</p>
              </section>
            )}
          </div>

          {/* Reservation */}
          <aside className="lg:relative">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
              {user ? (
                <ActivityBookingWidget
                  activityId={activity.id}
                  pricePerPerson={activity.pricePerPerson}
                  minPersons={activity.minPersons}
                  maxPersons={activity.maxPersons}
                  guides={guides}
                  defaultName={`${user.firstName} ${user.lastName}`}
                  defaultEmail={user.email}
                  defaultPhone={user.phone ?? ""}
                />
              ) : (
                <div className="rounded-3xl border border-border bg-surface p-6 text-center shadow-card">
                  <p className="font-bold text-foreground">A partir de {activity.pricePerPerson.toLocaleString("fr-FR")} F CFA / pers.</p>
                  <p className="mt-1 text-sm text-muted">Connectez-vous pour reserver cette activite avec un guide.</p>
                  <Link href={`/login?redirectTo=/activites/${activity.slug}`} className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-brand-500 px-5 py-3 font-semibold text-white hover:bg-brand-600">
                    Se connecter pour reserver
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
