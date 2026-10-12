import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Star, MapPin, Users, BedDouble, Bath, Home, ChevronLeft, ShieldCheck,
  ScrollText, Award, Sparkles, LogIn, LogOut, type LucideIcon,
} from "lucide-react";
import { getResidenceBySlug, getSimilarResidences } from "@/lib/queries";
import { getCityPacks } from "@/lib/custom-pack-queries";
import { PackCard } from "@/components/public/pack-card";
import { getUserFavoriteIds } from "@/server/actions/favorites";
import { PhotoGallery } from "@/components/public/photo-gallery";
import { BookingWidget } from "@/components/public/booking-widget";
import { FavoriteButton } from "@/components/public/favorite-button";
import { ResidenceCard } from "@/components/public/residence-card";
import { Motif, Ornament } from "@/components/brand/motif";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { RatingStars } from "@/components/ui/rating-stars";
import { JsonLd } from "@/components/seo/json-ld";
import { MapEmbed } from "@/components/public/map-embed";
import { formatDate, initials } from "@/lib/utils";
import { qualityLevelMeta } from "@/lib/enums";
import { enumLabel } from "@/lib/dictionaries/enums";
import { SITE_URL } from "@/lib/constants";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { alternatesFor } from "@/lib/seo";

const APP_URL = SITE_URL;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [residence, { dict }] = await Promise.all([getResidenceBySlug(slug), getI18n()]);
  if (!residence) return { title: dict.residenceDetail.notFound };
  const description = residence.shortDescription ?? residence.description.slice(0, 150);
  const image = residence.images[0]?.url;
  return {
    title: residence.name,
    description,
    alternates: alternatesFor(`/residences/${slug}`),
    openGraph: {
      title: residence.name,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

// Titre de section de la fiche (serif, filet en dessous).
function DetailHeading({ children, icon: HeadingIcon }: { children: React.ReactNode; icon?: LucideIcon }) {
  return (
    <h2 className="mb-5 flex items-center gap-3 font-display text-[1.65rem] font-normal leading-tight text-foreground">
      {HeadingIcon && <HeadingIcon className="h-5 w-5 text-terracotta" strokeWidth={1.7} />}
      {children}
    </h2>
  );
}

export default async function ResidenceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const residence = await getResidenceBySlug(slug);
  if (!residence || residence.status !== "PUBLISHED") notFound();

  const [favorites, similar, cityPacks, { locale, dict }] = await Promise.all([
    getUserFavoriteIds(),
    getSimilarResidences(residence.city, residence.id, 4),
    residence.destination?.slug ? getCityPacks(residence.destination.slug) : Promise.resolve([]),
    getI18n(),
  ]);
  const d = dict.residenceDetail;

  const typeLabel = enumLabel(dict.enums.residenceType, residence.type);
  const quality = residence.qualityLevel ? qualityLevelMeta[residence.qualityLevel] : null;
  const qualityLabel = enumLabel(dict.enums.quality, residence.qualityLevel);
  const place = `${residence.district ? `${residence.district}, ` : ""}${residence.city}`;

  const disabledRanges = [
    ...residence.reservations.map((r) => ({
      startDate: r.startDate.toISOString(),
      endDate: r.endDate.toISOString(),
    })),
    ...residence.availabilityBlocks.map((b) => ({
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
    })),
  ];

  const subRatings = [
    { label: d.ratingCleanliness, key: "cleanlinessRating" as const },
    { label: d.ratingLocation, key: "locationRating" as const },
    { label: d.ratingValue, key: "valueRating" as const },
    { label: d.ratingCommunication, key: "communicationRating" as const },
  ].map((s) => {
    const vals = residence.reviews.map((r) => r[s.key]).filter((v): v is number => v != null);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return { ...s, avg };
  });

  const facts: { icon: LucideIcon; value: number; label: string }[] = [
    { icon: Users, value: residence.capacity, label: d.guestsUnit },
    { icon: BedDouble, value: residence.bedrooms, label: d.bedroomsUnit },
    { icon: Home, value: residence.beds, label: d.bedsUnit },
    { icon: Bath, value: residence.bathrooms, label: d.bathroomsUnit },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: residence.name,
    description: residence.shortDescription ?? residence.description.slice(0, 200),
    address: {
      "@type": "PostalAddress",
      addressLocality: residence.city,
      addressRegion: residence.destination?.region ?? undefined,
      addressCountry: "CI",
    },
    ...(residence.latitude && residence.longitude
      ? { geo: { "@type": "GeoCoordinates", latitude: residence.latitude, longitude: residence.longitude } }
      : {}),
    priceRange: `${residence.pricePerNight} XOF`,
    url: `${APP_URL}/residences/${residence.slug}`,
    ...(residence.ratingCount > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: residence.ratingAverage, reviewCount: residence.ratingCount } }
      : {}),
  };

  const lat = residence.latitude ?? residence.destination?.latitude ?? null;
  const lng = residence.longitude ?? residence.destination?.longitude ?? null;

  return (
    <div className="pb-24 lg:pb-0">
      <JsonLd data={jsonLd} />
      {/* Boutons flottants (mobile) */}
      <div className="relative lg:hidden">
        <Link
          href={localePath("/residences", locale)}
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur"
          aria-label={d.back}
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="absolute right-4 top-4 z-10">
          <FavoriteButton residenceId={residence.id} initialFavorited={favorites.residences.has(residence.id)} />
        </div>
      </div>

      <div className="container-page pt-0 lg:pt-8">
        {/* En-tete (desktop) */}
        <div className="hidden lg:block">
          <nav className="mb-5 flex items-center gap-2 text-[13px] text-muted">
            <Link href={localePath("/residences", locale)} className="hover:text-ink">{d.breadcrumbResidences}</Link>
            <span className="text-sand-400">/</span>
            <Link href={localePath(`/residences?city=${residence.destination?.slug ?? ""}`, locale)} className="hover:text-ink">{residence.city}</Link>
            <span className="text-sand-400">/</span>
            <span className="truncate text-foreground">{residence.name}</span>
          </nav>
          <div className="mb-7 flex items-end justify-between gap-6">
            <div className="min-w-0">
              <p className="eyebrow flex items-center gap-3 text-[11px] text-terracotta">
                <Ornament side="left" />
                {qualityLabel ? `${qualityLabel} · ` : ""}{typeLabel}
              </p>
              <h1 className="mt-3 text-balance font-display text-[2.75rem] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
                {residence.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                {residence.ratingCount > 0 && (
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Star className="h-4 w-4 fill-gold-500 text-gold-500" />
                    {residence.ratingAverage.toFixed(1)}
                    <span className="font-normal text-muted">({residence.ratingCount} {d.reviewsWord})</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-muted">
                  <MapPin className="h-4 w-4" /> {place}
                </span>
                {residence.isVerified && <VerifiedBadge label={dict.card.verified} />}
              </div>
            </div>
            <FavoriteButton residenceId={residence.id} initialFavorited={favorites.residences.has(residence.id)} variant="inline" />
          </div>
        </div>

        {/* Galerie */}
        <div className="-mx-5 lg:mx-0">
          <PhotoGallery images={residence.images} seedPrefix={residence.slug} name={residence.name} />
        </div>

        {/* En-tete (mobile) */}
        <div className="mt-5 lg:hidden">
          <p className="eyebrow text-[10px] text-terracotta">
            {qualityLabel ? `${qualityLabel} · ` : ""}{typeLabel}
          </p>
          <h1 className="mt-1.5 font-display text-[1.9rem] font-normal leading-[1.1] text-foreground">{residence.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
            {residence.ratingCount > 0 && (
              <span className="flex items-center gap-1 font-semibold">
                <Star className="h-4 w-4 fill-gold-500 text-gold-500" />
                {residence.ratingAverage.toFixed(1)} <span className="font-normal text-muted">({residence.ratingCount})</span>
              </span>
            )}
            <span className="flex items-center gap-1 text-muted">
              <MapPin className="h-4 w-4" /> {place}
            </span>
            {residence.isVerified && <VerifiedBadge size="sm" label={dict.card.verified} />}
          </div>
        </div>

        {/* Corps */}
        <div className="mt-8 grid grid-cols-1 gap-12 lg:mt-12 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0">
            {/* Chiffres cles */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className="rounded-[1.25rem] border border-border bg-surface px-4 py-4">
                  <f.icon className="h-5 w-5 text-terracotta" strokeWidth={1.7} />
                  <p className="mt-3 font-display text-2xl leading-none text-foreground">{f.value}</p>
                  <p className="mt-1 text-[13px] text-muted">{f.label}</p>
                </div>
              ))}
            </div>

            {/* Hote + garanties */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-4 rounded-[1.25rem] border border-border bg-surface p-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{initials(residence.owner.firstName, residence.owner.lastName ?? "")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="eyebrow text-[10px] text-muted">{d.hostLabel}</p>
                  <p className="font-display text-lg text-foreground">{d.hostedBy.replace("{name}", residence.owner.firstName)}</p>
                </div>
              </div>
              {residence.isVerified ? (
                <div className="relative flex items-center gap-4 overflow-hidden rounded-[1.25rem] bg-brand-500 p-4 text-white">
                  <Motif variant="dots" className="text-white/10" />
                  <span className="relative flex h-12 w-11 shrink-0 items-center justify-center rounded-arch-sm bg-white/15">
                    <ShieldCheck className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <div className="relative">
                    <p className="font-semibold">{d.verifiedTitle}</p>
                    <p className="text-[13px] text-white/75">{d.verifiedSubtitle}</p>
                  </div>
                </div>
              ) : quality ? (
                <div className="flex items-center gap-4 rounded-[1.25rem] bg-gold-50 p-4 ring-1 ring-inset ring-gold-200/70">
                  <Award className="h-6 w-6 text-gold-700" strokeWidth={1.7} />
                  <div>
                    <p className="font-semibold text-gold-800">{d.qualityLevel.replace("{level}", qualityLabel)}</p>
                    <p className="text-xs text-gold-700">{"★".repeat(quality.stars)}</p>
                  </div>
                </div>
              ) : null}
            </div>
            {residence.isVerified && quality && (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                <Award className="h-4 w-4 text-gold-600" />
                {d.qualityLevel.replace("{level}", qualityLabel)} <span className="text-gold-600">{"★".repeat(quality.stars)}</span>
              </p>
            )}

            {/* Description */}
            <section className="mt-12 border-t border-border pt-10">
              <DetailHeading>{d.aboutTitle}</DetailHeading>
              <p className="whitespace-pre-line text-[15.5px] leading-[1.75] text-foreground/85">{residence.description}</p>
            </section>

            {/* Equipements */}
            {residence.amenities.length > 0 && (
              <section className="mt-12 border-t border-border pt-10">
                <DetailHeading>{d.amenitiesTitle}</DetailHeading>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {residence.amenities.map((ra) => (
                    <div key={ra.id} className="flex items-center gap-3 rounded-xl bg-sand-50 px-4 py-3 text-[15px] text-foreground/90 ring-1 ring-inset ring-sand-200">
                      <Icon name={ra.amenity.icon} className="h-5 w-5 text-brand-600" />
                      {dict.enums.amenity[ra.amenity.slug] ?? ra.amenity.name}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Arrivee / depart */}
            <section className="mt-12 border-t border-border pt-10">
              <DetailHeading>{d.availabilityTitle}</DetailHeading>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-4 rounded-[1.25rem] border border-border bg-surface p-4">
                  <LogIn className="h-5 w-5 text-terracotta" strokeWidth={1.7} />
                  <div>
                    <p className="eyebrow text-[10px] text-muted">{d.checkInLabel}</p>
                    <p className="font-display text-lg text-foreground">{d.fromTime.replace("{t}", residence.checkInTime)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-[1.25rem] border border-border bg-surface p-4">
                  <LogOut className="h-5 w-5 text-terracotta" strokeWidth={1.7} />
                  <div>
                    <p className="eyebrow text-[10px] text-muted">{d.checkOutLabel}</p>
                    <p className="font-display text-lg text-foreground">{d.beforeTime.replace("{t}", residence.checkOutTime)}</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">
                {d.availabilityText.replace("{in}", residence.checkInTime).replace("{out}", residence.checkOutTime)}
              </p>
            </section>

            {/* Reglement */}
            {residence.houseRules && (
              <section className="mt-12 border-t border-border pt-10">
                <DetailHeading icon={ScrollText}>{d.rulesTitle}</DetailHeading>
                <p className="whitespace-pre-line text-[15.5px] leading-[1.75] text-foreground/85">{residence.houseRules}</p>
              </section>
            )}

            {/* Avis */}
            <section className="mt-12 border-t border-border pt-10">
              <DetailHeading>{d.reviewsTitle}</DetailHeading>
              {residence.ratingCount > 0 ? (
                <div className="mb-8 grid grid-cols-1 gap-6 rounded-[1.5rem] bg-sand-100 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10">
                  <div className="text-center sm:text-left">
                    <p className="font-display text-6xl leading-none text-foreground">{residence.ratingAverage.toFixed(1)}</p>
                    <p className="mt-2 text-sm text-muted">
                      {d.outOf} · {residence.ratingCount} {d.reviewsWord}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                    {subRatings.map((s) => (
                      <div key={s.label}>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-muted">{s.label}</span>
                          <span className="font-bold text-foreground">{s.avg.toFixed(1)}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
                          <div className="h-full rounded-full bg-terracotta" style={{ width: `${(s.avg / 5) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted">{d.noReviews}. {d.beFirst}</p>
              )}

              {residence.reviews.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {residence.reviews.map((review) => (
                    <figure key={review.id} className="rounded-[1.25rem] border border-border bg-surface p-5">
                      <figcaption className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{initials(review.author.firstName, review.author.lastName)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {review.author.firstName} {review.author.lastName.charAt(0)}.
                          </p>
                          <p className="text-xs text-muted">{formatDate(review.createdAt, locale)}</p>
                        </div>
                        <span className="ml-auto"><RatingStars value={review.rating} showValue={false} size="sm" /></span>
                      </figcaption>
                      {review.comment && (
                        <blockquote className="mt-3 text-[15px] leading-relaxed text-foreground/85">{review.comment}</blockquote>
                      )}
                    </figure>
                  ))}
                </div>
              )}
            </section>

            {/* Localisation */}
            <section className="mt-12 border-t border-border pt-10">
              <DetailHeading>{d.locationTitle}</DetailHeading>
              {lat != null && lng != null ? (
                <>
                  <div className="overflow-hidden rounded-[1.5rem]">
                    <MapEmbed latitude={lat} longitude={lng} label={place} heightClass="h-80" />
                  </div>
                  <p className="mt-3 text-sm text-muted">{d.locationApprox}</p>
                </>
              ) : (
                <div className="grain relative flex h-56 items-center justify-center overflow-hidden rounded-[1.5rem] bg-ink-800 text-white">
                  <Motif variant="bogolan" className="text-white/[0.06]" />
                  <div className="relative text-center">
                    <MapPin className="mx-auto h-8 w-8 text-gold-400" />
                    <p className="mt-2 font-display text-xl">{place}</p>
                    <p className="text-sm text-white/70">{d.locationAfter}</p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Colonne reservation */}
          <aside className="lg:relative">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
              <BookingWidget
                residenceId={residence.id}
                slug={residence.slug}
                pricePerNight={residence.pricePerNight}
                cleaningFee={residence.cleaningFee}
                maxCapacity={residence.capacity}
                ratingAverage={residence.ratingAverage}
                ratingCount={residence.ratingCount}
                disabledRanges={disabledRanges}
              />
            </div>
          </aside>
        </div>

        {/* Packs & experiences de la ville */}
        <section className="mt-16 border-t border-border py-14">
          <p className="eyebrow flex items-center gap-3 text-[11px] text-terracotta">
            <Ornament side="left" />
            {dict.home.experiences.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-[2rem] font-normal leading-tight text-foreground">
            {d.cityPacksTitle.replace("{city}", residence.city)}
          </h2>
          <p className="mt-2 text-muted">{d.cityPacksSubtitle}</p>

          {cityPacks.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cityPacks.map((p) => (
                <PackCard key={p.id} pack={p} favorited={favorites.packs.has(p.id)} />
              ))}
            </div>
          )}

          <div className="relative mt-8 flex flex-col items-start justify-between gap-5 overflow-hidden rounded-[1.75rem] bg-gold-500 p-7 text-ink-900 sm:flex-row sm:items-center">
            <Motif variant="bogolan" className="text-ink-900/[0.08]" />
            <div className="relative">
              <p className="font-display text-xl">{d.noPackTitle}</p>
              <p className="mt-1 text-sm text-ink-900/75">{d.noPackText.replace("{city}", residence.city)}</p>
            </div>
            <Link
              href={localePath(`/packs/custom${residence.destination?.slug ? `?city=${residence.destination.slug}` : ""}`, locale)}
              className="relative inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-800"
            >
              <Sparkles className="h-4 w-4 text-gold-300" /> {d.composePack}
            </Link>
          </div>
        </section>

        {/* Similaires */}
        {similar.length > 0 && (
          <section className="border-t border-border py-14">
            <h2 className="mb-8 font-display text-[2rem] font-normal leading-tight text-foreground">
              {d.similarTitle.replace("{city}", residence.city)}
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((r) => (
                <ResidenceCard key={r.id} residence={r} favorited={favorites.residences.has(r.id)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
