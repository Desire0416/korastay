import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock, Users, MapPin, ChevronLeft, CheckCircle2, XCircle, Calendar,
  Info, Backpack, Shirt, FileText, Star, Sparkles,
} from "lucide-react";
import { getPackBySlug } from "@/lib/queries";
import { getUserFavoriteIds } from "@/server/actions/favorites";
import { PhotoGallery } from "@/components/public/photo-gallery";
import { PackBookingWidget } from "@/components/public/pack-booking-widget";
import { FavoriteButton } from "@/components/public/favorite-button";
import { JsonLd } from "@/components/seo/json-ld";
import { Ornament, Motif } from "@/components/brand/motif";
import { SITE_URL } from "@/lib/constants";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { alternatesFor } from "@/lib/seo";

const APP_URL = SITE_URL;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [pack, { dict }] = await Promise.all([getPackBySlug(slug), getI18n()]);
  return { title: pack?.name ?? dict.packs.metaFallback, description: pack?.subtitle ?? "", alternates: alternatesFor(`/packs/${slug}`) };
}

export default async function PackDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [pack, { locale, dict }] = await Promise.all([getPackBySlug(slug), getI18n()]);
  if (!pack || pack.status !== "PUBLISHED") notFound();

  const favorites = await getUserFavoriteIds();
  const included = pack.includedItems.filter((i) => i.included);
  const notIncluded = pack.includedItems.filter((i) => !i.included);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pack.name,
    description: pack.description.slice(0, 200),
    url: `${APP_URL}/packs/${pack.slug}`,
    touristType: "Leisure",
    offers: { "@type": "Offer", price: pack.price, priceCurrency: "XOF" },
    ...(pack.destination ? { itinerary: { "@type": "Place", name: pack.destination.name } } : {}),
  };

  const durationLabel = `${pack.durationDays}${dict.card.dayShort} / ${pack.durationNights}${dict.card.nightShort}`;
  const personsLabel = dict.packs.personsRange
    .replace("{base}", String(pack.basePersons))
    .replace("{max}", String(pack.maxPersons));

  return (
    <div className="pb-24 lg:pb-0">
      <JsonLd data={jsonLd} />
      <div className="relative lg:hidden">
        <Link href={localePath("/packs", locale)} className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur" aria-label={dict.residenceDetail.back}>
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="absolute right-4 top-4 z-10">
          <FavoriteButton packId={pack.id} initialFavorited={favorites.packs.has(pack.id)} />
        </div>
      </div>

      <div className="container-page pt-0 lg:pt-8">
        {/* En-tete (desktop) */}
        <div className="mb-7 hidden items-end justify-between gap-6 lg:flex">
          <div className="min-w-0">
            <nav className="mb-5 flex items-center gap-2 text-[13px] text-muted">
              <Link href={localePath("/packs", locale)} className="hover:text-ink">{dict.packs.metaTitle}</Link>
              <span className="text-sand-400">/</span>
              <span className="truncate text-foreground">{pack.name}</span>
            </nav>
            <p className="eyebrow flex items-center gap-3 text-[11px] text-terracotta">
              <Ornament side="left" />
              {pack.destination?.name ?? dict.home.experiences.eyebrow}
            </p>
            <h1 className="mt-3 text-balance font-display text-[2.75rem] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">{pack.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {durationLabel}</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {personsLabel}</span>
              {pack.ratingCount > 0 && (
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Star className="h-4 w-4 fill-gold-500 text-gold-500" /> {pack.ratingAverage.toFixed(1)}
                </span>
              )}
            </div>
          </div>
          <FavoriteButton packId={pack.id} initialFavorited={favorites.packs.has(pack.id)} variant="inline" />
        </div>

        <div className="-mx-5 lg:mx-0">
          <PhotoGallery images={pack.images} seedPrefix={`pack-${pack.slug}`} name={pack.name} />
        </div>

        {/* En-tete (mobile) */}
        <div className="mt-5 lg:hidden">
          {pack.destination && <p className="eyebrow text-[10px] text-terracotta">{pack.destination.name}</p>}
          <h1 className="mt-1.5 font-display text-[1.9rem] font-normal leading-[1.1] text-foreground">{pack.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {durationLabel}</span>
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {personsLabel}</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-12 lg:mt-12 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0">
            <section>
              <h2 className="mb-5 font-display text-[1.65rem] font-normal leading-tight text-foreground">{dict.packs.aboutTitle}</h2>
              <p className="whitespace-pre-line text-[15.5px] leading-[1.75] text-foreground/85">{pack.description}</p>
            </section>

            {/* Inclus / non inclus */}
            <section className="mt-12 grid grid-cols-1 gap-4 border-t border-border pt-10 sm:grid-cols-2">
              <div className="rounded-[1.25rem] bg-brand-50 p-6 ring-1 ring-inset ring-brand-200/60">
                <h3 className="mb-4 flex items-center gap-2 font-display text-xl text-brand-800">
                  <CheckCircle2 className="h-5 w-5 text-brand-500" /> {dict.packs.included}
                </h3>
                <ul className="space-y-2.5">
                  {included.map((i) => (
                    <li key={i.id} className="flex items-start gap-2.5 text-[15px] text-foreground/90">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                      <span><span className="font-semibold">{i.label}</span>{i.details ? ` · ${i.details}` : ""}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {notIncluded.length > 0 && (
                <div className="rounded-[1.25rem] bg-sand-50 p-6 ring-1 ring-inset ring-sand-200">
                  <h3 className="mb-4 flex items-center gap-2 font-display text-xl text-foreground">
                    <XCircle className="h-5 w-5 text-muted" /> {dict.packs.notIncluded}
                  </h3>
                  <ul className="space-y-2.5">
                    {notIncluded.map((i) => (
                      <li key={i.id} className="flex items-start gap-2.5 text-[15px] text-muted">
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> {i.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Programme jour par jour */}
            {pack.programDays.length > 0 && (
              <section className="mt-12 border-t border-border pt-10">
                <h2 className="mb-8 flex items-center gap-3 font-display text-[1.65rem] font-normal leading-tight text-foreground">
                  <Calendar className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {dict.packs.program}
                </h2>
                <ol>
                  {pack.programDays.map((day, idx) => (
                    <li key={day.id} className="relative flex gap-5 pb-9 last:pb-0">
                      {idx < pack.programDays.length - 1 && (
                        <span aria-hidden="true" className="absolute bottom-0 left-[19px] top-12 border-l border-dashed border-terracotta/40" />
                      )}
                      <span className="relative flex h-12 w-10 shrink-0 items-center justify-center rounded-arch-sm bg-terracotta font-display text-lg italic text-white">
                        {day.dayNumber}
                      </span>
                      <div className="min-w-0 pt-1.5">
                        <h3 className="font-display text-xl text-foreground">{day.title}</h3>
                        {day.description && <p className="mt-1 text-[15px] leading-relaxed text-muted">{day.description}</p>}
                        {day.activities.length > 0 && (
                          <ul className="mt-3 space-y-2 rounded-xl bg-sand-50 p-4 ring-1 ring-inset ring-sand-200">
                            {day.activities.map((a) => (
                              <li key={a.id} className="flex gap-3 text-sm text-foreground/90">
                                {a.timeLabel && <span className="w-[5.5rem] shrink-0 font-semibold text-terracotta">{a.timeLabel}</span>}
                                <span>{a.title}{a.description ? ` · ${a.description}` : ""}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Infos pratiques */}
            {(pack.physicalLevel || pack.clothingRecommendations || pack.documentsToBring || pack.meetingPoint) && (
              <section className="mt-12 border-t border-border pt-10">
                <h2 className="mb-5 font-display text-[1.65rem] font-normal leading-tight text-foreground">{dict.packs.practicalInfo}</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {pack.physicalLevel && <Practical icon={Backpack} label={dict.packs.physicalLevel} value={pack.physicalLevel} />}
                  {pack.clothingRecommendations && <Practical icon={Shirt} label={dict.packs.clothing} value={pack.clothingRecommendations} />}
                  {pack.documentsToBring && <Practical icon={FileText} label={dict.packs.toBring} value={pack.documentsToBring} />}
                  {pack.meetingPoint && <Practical icon={MapPin} label={dict.packs.meetingPoint} value={pack.meetingPoint} />}
                </div>
              </section>
            )}

            {/* Annulation */}
            {pack.cancellationPolicy && (
              <section className="mt-12 border-t border-border pt-10">
                <h2 className="mb-4 flex items-center gap-3 font-display text-[1.65rem] font-normal leading-tight text-foreground">
                  <Info className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {dict.packs.cancellation}
                </h2>
                <p className="text-[15px] leading-relaxed text-foreground/85">{pack.cancellationPolicy}</p>
              </section>
            )}

            {/* Pack sur mesure */}
            {pack.destination?.slug && (
              <div className="relative mt-12 flex flex-col items-start justify-between gap-5 overflow-hidden rounded-[1.5rem] bg-gold-500 p-6 text-ink-900 sm:flex-row sm:items-center">
                <Motif variant="bogolan" className="text-ink-900/[0.08]" />
                <p className="relative font-display text-lg leading-snug">{dict.packs.notSuited.replace("{city}", pack.destination.name)}</p>
                <Link href={localePath(`/packs/custom?city=${pack.destination.slug}`, locale)} className="relative inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-ink-800">
                  <Sparkles className="h-4 w-4 text-gold-300" /> {dict.residenceDetail.composePack}
                </Link>
              </div>
            )}
          </div>

          <aside className="lg:relative">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
              <PackBookingWidget
                packId={pack.id}
                slug={pack.slug}
                price={pack.price}
                basePersons={pack.basePersons}
                maxPersons={pack.maxPersons}
                extraPersonPrice={pack.extraPersonPrice}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Practical({ icon: Icon, label, value }: { icon: typeof Info; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 rounded-[1.25rem] border border-border bg-surface p-5">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" strokeWidth={1.7} />
      <div>
        <p className="eyebrow text-[10px] text-muted">{label}</p>
        <p className="mt-1 text-[15px] leading-relaxed text-foreground">{value}</p>
      </div>
    </div>
  );
}
