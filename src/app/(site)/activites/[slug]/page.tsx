import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, Users, MapPin, Star, CheckCircle2, Mountain, Info, LogIn, type LucideIcon } from "lucide-react";
import { getActivityBySlug, getCityGuides } from "@/lib/activity-queries";
import { getCurrentUser } from "@/lib/auth";
import { PhotoGallery } from "@/components/public/photo-gallery";
import { ActivityBookingWidget } from "@/components/public/activity-booking-widget";
import { Ornament } from "@/components/brand/motif";
import { Button } from "@/components/ui/button";
import { enumLabel } from "@/lib/dictionaries/enums";
import { formatPrice } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [a, { dict }] = await Promise.all([getActivityBySlug(slug), getI18n()]);
  return {
    title: a?.name ?? dict.activities.notFound,
    description: a?.shortDescription ?? undefined,
    alternates: alternatesFor(`/activites/${slug}`),
  };
}

export default async function ActivityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  if (!activity || activity.status !== "PUBLISHED") notFound();

  const [user, guides, { locale, dict }] = await Promise.all([getCurrentUser(), getCityGuides(activity.city), getI18n()]);
  const t = dict.activities;
  const cat = enumLabel(dict.enums.activityCategory, activity.category);
  const included = (activity.included ?? "").split(/\n+/).map((s) => s.trim()).filter(Boolean);

  const facts: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Clock, label: t.duration, value: dict.card.hours.replace("{n}", String(activity.durationHours)) },
    {
      icon: Users,
      label: t.groupSize,
      value: t.personsRange.replace("{min}", String(activity.minPersons)).replace("{max}", String(activity.maxPersons)),
    },
    ...(activity.difficulty ? [{ icon: Mountain, label: t.difficulty, value: activity.difficulty }] : []),
  ];

  return (
    <div className="pb-10">
      <div className="relative lg:hidden">
        <Link href={localePath("/activites", locale)} className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur" aria-label={dict.residenceDetail.back}>
          <ChevronLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="container-page pt-0 lg:pt-8">
        {/* En-tete (desktop) */}
        <div className="mb-7 hidden lg:block">
          <nav className="mb-5 flex items-center gap-2 text-[13px] text-muted">
            <Link href={localePath("/activites", locale)} className="hover:text-ink">{t.breadcrumb}</Link>
            <span className="text-sand-400">/</span>
            <span className="truncate text-foreground">{activity.name}</span>
          </nav>
          <p className="eyebrow flex items-center gap-3 text-[11px] text-terracotta">
            <Ornament side="left" />
            {cat} · {activity.city}
          </p>
          <h1 className="mt-3 text-balance font-display text-[2.75rem] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">{activity.name}</h1>
          {activity.ratingCount > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Star className="h-4 w-4 fill-gold-500 text-gold-500" /> {activity.ratingAverage.toFixed(1)}
              <span className="font-normal text-muted">({activity.ratingCount})</span>
            </p>
          )}
        </div>

        <div className="-mx-5 lg:mx-0">
          <PhotoGallery images={activity.images} seedPrefix={`act-${activity.slug}`} name={activity.name} />
        </div>

        {/* En-tete (mobile) */}
        <div className="mt-5 lg:hidden">
          <p className="eyebrow text-[10px] text-terracotta">{cat}</p>
          <h1 className="mt-1.5 font-display text-[1.9rem] font-normal leading-[1.1] text-foreground">{activity.name}</h1>
          <p className="mt-2 flex items-center gap-1 text-sm text-muted"><MapPin className="h-4 w-4" /> {activity.city}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-12 lg:mt-12 lg:grid-cols-[1fr_420px]">
          <div className="min-w-0">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.label} className="rounded-[1.25rem] border border-border bg-surface px-4 py-4">
                  <f.icon className="h-5 w-5 text-terracotta" strokeWidth={1.7} />
                  <p className="eyebrow mt-3 text-[9.5px] text-muted">{f.label}</p>
                  <p className="mt-1 font-display text-lg leading-snug text-foreground">{f.value}</p>
                </div>
              ))}
            </div>

            <section className="mt-12 border-t border-border pt-10">
              <h2 className="mb-5 font-display text-[1.65rem] font-normal leading-tight text-foreground">{t.aboutTitle}</h2>
              <p className="whitespace-pre-line text-[15.5px] leading-[1.75] text-foreground/85">{activity.description}</p>
            </section>

            {included.length > 0 && (
              <section className="mt-12 border-t border-border pt-10">
                <h2 className="mb-5 font-display text-[1.65rem] font-normal leading-tight text-foreground">{t.includedTitle}</h2>
                <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {included.map((it, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl bg-brand-50 px-4 py-3 text-[15px] text-foreground/90 ring-1 ring-inset ring-brand-200/60">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {it}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {activity.meetingPoint && (
              <section className="mt-12 border-t border-border pt-10">
                <h2 className="mb-4 flex items-center gap-3 font-display text-[1.65rem] font-normal leading-tight text-foreground">
                  <Info className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.meetingPoint}
                </h2>
                <p className="text-[15.5px] leading-relaxed text-foreground/85">{activity.meetingPoint}</p>
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
                <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-surface p-7 pt-8 text-center shadow-card">
                  <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 overflow-hidden">
                    <div className="motif motif-kente text-terracotta/70" />
                  </div>
                  <p className="font-display text-2xl text-foreground">
                    {t.fromPrice.replace("{price}", formatPrice(activity.pricePerPerson))}
                  </p>
                  <p className="mt-2 text-sm text-muted">{t.loginText}</p>
                  <Button asChild size="lg" className="mt-6 w-full">
                    <Link href={`${localePath("/login", locale)}?redirectTo=${encodeURIComponent(localePath(`/activites/${activity.slug}`, locale))}`}>
                      <LogIn className="h-4 w-4" /> {t.loginCta}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
