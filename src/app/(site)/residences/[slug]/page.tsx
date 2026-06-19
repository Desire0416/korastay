import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Star, MapPin, Users, BedDouble, Bath, Home, ChevronLeft, ShieldCheck,
  Clock, ScrollText, CheckCircle2, Award, Sparkles,
} from "lucide-react";
import { getResidenceBySlug, getSimilarResidences } from "@/lib/queries";
import { getCityPacks } from "@/lib/custom-pack-queries";
import { PackCard } from "@/components/public/pack-card";
import { getUserFavoriteIds } from "@/server/actions/favorites";
import { PhotoGallery } from "@/components/public/photo-gallery";
import { BookingWidget } from "@/components/public/booking-widget";
import { FavoriteButton } from "@/components/public/favorite-button";
import { ResidenceCard } from "@/components/public/residence-card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { RatingStars } from "@/components/ui/rating-stars";
import { JsonLd } from "@/components/seo/json-ld";
import { MapEmbed } from "@/components/public/map-embed";
import { formatDate, initials } from "@/lib/utils";
import { residenceTypeMeta, qualityLevelMeta } from "@/lib/enums";
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

  const type = residenceTypeMeta[residence.type];
  const quality = residence.qualityLevel ? qualityLevelMeta[residence.qualityLevel] : null;

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
    { label: dict.residenceDetail.ratingCleanliness, key: "cleanlinessRating" as const },
    { label: dict.residenceDetail.ratingLocation, key: "locationRating" as const },
    { label: dict.residenceDetail.ratingValue, key: "valueRating" as const },
    { label: dict.residenceDetail.ratingCommunication, key: "communicationRating" as const },
  ].map((s) => {
    const vals = residence.reviews.map((r) => r[s.key]).filter((v): v is number => v != null);
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return { ...s, avg };
  });

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

  return (
    <div className="pb-24 lg:pb-0">
      <JsonLd data={jsonLd} />
      {/* Bouton retour flottant (mobile) */}
      <div className="relative lg:hidden">
        <Link
          href={localePath("/residences", locale)}
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur"
          aria-label={dict.residenceDetail.back}
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="absolute right-4 top-4 z-10">
          <FavoriteButton residenceId={residence.id} initialFavorited={favorites.residences.has(residence.id)} />
        </div>
      </div>

      <div className="container-page pt-0 lg:pt-6">
        {/* Fil d'ariane + titre (desktop) */}
        <div className="hidden lg:block">
          <nav className="mb-3 flex items-center gap-1 text-sm text-muted">
            <Link href={localePath("/residences", locale)} className="hover:text-foreground">{dict.residenceDetail.breadcrumbResidences}</Link>
            <span>/</span>
            <Link href={localePath(`/residences?city=${residence.destination?.slug ?? ""}`, locale)} className="hover:text-foreground">{residence.city}</Link>
            <span>/</span>
            <span className="text-foreground">{residence.name}</span>
          </nav>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">{residence.name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm">
                {residence.ratingCount > 0 && (
                  <span className="flex items-center gap-1 font-semibold">
                    <Star className="h-4 w-4 fill-gold-500 text-gold-500" />
                    {residence.ratingAverage.toFixed(1)} ({residence.ratingCount} {dict.residenceDetail.reviewsWord})
                  </span>
                )}
                <span className="flex items-center gap-1 text-muted">
                  <MapPin className="h-4 w-4" />
                  {residence.district ? `${residence.district}, ` : ""}{residence.city}
                </span>
                {residence.isVerified && <VerifiedBadge />}
              </div>
            </div>
            <FavoriteButton residenceId={residence.id} initialFavorited={favorites.residences.has(residence.id)} variant="inline" />
          </div>
        </div>

        {/* Galerie */}
        <div className="-mx-5 lg:mx-0">
          <PhotoGallery images={residence.images} seedPrefix={residence.slug} name={residence.name} />
        </div>

        {/* Titre mobile */}
        <div className="mt-4 lg:hidden">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{residence.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
            {residence.ratingCount > 0 && (
              <span className="flex items-center gap-1 font-semibold">
                <Star className="h-4 w-4 fill-gold-500 text-gold-500" />
                {residence.ratingAverage.toFixed(1)} ({residence.ratingCount})
              </span>
            )}
            <span className="flex items-center gap-1 text-muted">
              <MapPin className="h-4 w-4" />{residence.district ? `${residence.district}, ` : ""}{residence.city}
            </span>
            {residence.isVerified && <VerifiedBadge size="sm" />}
          </div>
        </div>

        {/* Corps */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            {/* Resume */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border pb-6">
              <div>
                <p className="text-lg font-bold text-foreground">{type?.label ?? residence.type}</p>
                <p className="text-sm text-muted">{dict.residenceDetail.hostedBy.replace("{name}", residence.owner.firstName)}</p>
              </div>
              <Separator orientation="vertical" className="hidden h-10 sm:block" />
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-foreground">
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-muted" /> {residence.capacity} {dict.residenceDetail.guestsUnit}</span>
                <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-muted" /> {residence.bedrooms} {dict.residenceDetail.bedroomsUnit}</span>
                <span className="flex items-center gap-1.5"><Home className="h-4 w-4 text-muted" /> {residence.beds} {dict.residenceDetail.bedsUnit}</span>
                <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-muted" /> {residence.bathrooms} {dict.residenceDetail.bathroomsUnit}</span>
              </div>
            </div>

            {/* Badges qualite */}
            {(quality || residence.isVerified) && (
              <div className="flex flex-wrap gap-3 border-b border-border py-6">
                {residence.isVerified && (
                  <div className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3">
                    <ShieldCheck className="h-6 w-6 text-brand-600" />
                    <div>
                      <p className="text-sm font-bold text-brand-800">{dict.residenceDetail.verifiedTitle}</p>
                      <p className="text-xs text-brand-700/70">{dict.residenceDetail.verifiedSubtitle}</p>
                    </div>
                  </div>
                )}
                {quality && (
                  <div className="flex items-center gap-3 rounded-2xl bg-gold-50 px-4 py-3">
                    <Award className="h-6 w-6 text-gold-600" />
                    <div>
                      <p className="text-sm font-bold text-gold-700">{dict.residenceDetail.qualityLevel.replace("{level}", quality.label)}</p>
                      <p className="text-xs text-gold-700/70">{"★".repeat(quality.stars)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <section className="border-b border-border py-7">
              <h2 className="mb-3 text-xl font-bold text-foreground">{dict.residenceDetail.aboutTitle}</h2>
              <p className="whitespace-pre-line leading-relaxed text-foreground/90">{residence.description}</p>
            </section>

            {/* Equipements */}
            <section className="border-b border-border py-7">
              <h2 className="mb-4 text-xl font-bold text-foreground">{dict.residenceDetail.amenitiesTitle}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {residence.amenities.map((ra) => (
                  <div key={ra.id} className="flex items-center gap-3 text-foreground/90">
                    <Icon name={ra.amenity.icon} className="h-5 w-5 text-brand-600" />
                    {ra.amenity.name}
                  </div>
                ))}
              </div>
            </section>

            {/* Calendrier disponibilites */}
            <section className="border-b border-border py-7">
              <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-foreground">
                <Clock className="h-5 w-5 text-brand-600" /> {dict.residenceDetail.availabilityTitle}
              </h2>
              <p className="mb-2 text-sm text-muted">
                {dict.residenceDetail.availabilityText.replace("{in}", residence.checkInTime).replace("{out}", residence.checkOutTime)}
              </p>
            </section>

            {/* Reglement */}
            {residence.houseRules && (
              <section className="border-b border-border py-7">
                <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-foreground">
                  <ScrollText className="h-5 w-5 text-brand-600" /> {dict.residenceDetail.rulesTitle}
                </h2>
                <p className="whitespace-pre-line leading-relaxed text-foreground/90">{residence.houseRules}</p>
              </section>
            )}

            {/* Avis */}
            <section className="border-b border-border py-7">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                <Star className="h-5 w-5 fill-gold-500 text-gold-500" />
                {residence.ratingCount > 0
                  ? dict.residenceDetail.reviewsSummary.replace("{avg}", residence.ratingAverage.toFixed(1)).replace("{n}", String(residence.ratingCount))
                  : dict.residenceDetail.noReviews}
              </h2>

              {residence.ratingCount > 0 && (
                <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
                  {subRatings.map((s) => (
                    <div key={s.label}>
                      <p className="text-xs text-muted">{s.label}</p>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-soft">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${(s.avg / 5) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-foreground">{s.avg.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {residence.reviews.map((review) => (
                  <div key={review.id} className="rounded-3xl border border-border p-5">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{initials(review.author.firstName, review.author.lastName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-foreground">{review.author.firstName} {review.author.lastName}</p>
                        <p className="text-xs text-muted">{formatDate(review.createdAt)}</p>
                      </div>
                      <span className="ml-auto"><RatingStars value={review.rating} showValue={false} size="sm" /></span>
                    </div>
                    {review.comment && <p className="mt-3 text-sm leading-relaxed text-foreground/90">{review.comment}</p>}
                  </div>
                ))}
              </div>
              {residence.reviews.length === 0 && (
                <p className="text-muted">{dict.residenceDetail.beFirst}</p>
              )}
            </section>

            {/* Localisation */}
            <section className="py-7">
              <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-foreground">
                <MapPin className="h-5 w-5 text-brand-600" /> {dict.residenceDetail.locationTitle}
              </h2>
              {(() => {
                const lat = residence.latitude ?? residence.destination?.latitude ?? null;
                const lng = residence.longitude ?? residence.destination?.longitude ?? null;
                if (lat != null && lng != null) {
                  return (
                    <>
                      <MapEmbed latitude={lat} longitude={lng} label={`${residence.district ? residence.district + ", " : ""}${residence.city}`} heightClass="h-72" />
                      <p className="mt-2 text-xs text-muted">{dict.residenceDetail.locationApprox}</p>
                    </>
                  );
                }
                return (
                  <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-3xl border border-border gradient-brand text-white">
                    <div className="relative text-center">
                      <MapPin className="mx-auto h-8 w-8 text-gold-400" />
                      <p className="mt-2 font-bold">{residence.district ? `${residence.district}, ` : ""}{residence.city}</p>
                      <p className="text-sm text-white/70">{dict.residenceDetail.locationAfter}</p>
                    </div>
                  </div>
                );
              })()}
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
        <section className="border-t border-border py-10">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            {dict.residenceDetail.cityPacksTitle.replace("{city}", residence.city)}
          </h2>
          <p className="mt-1 text-muted">{dict.residenceDetail.cityPacksSubtitle}</p>

          {cityPacks.length > 0 && (
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cityPacks.map((p) => (
                <PackCard key={p.id} pack={p} favorited={favorites.packs.has(p.id)} />
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-col items-start justify-between gap-4 rounded-3xl border-2 border-dashed border-brand-300 bg-brand-50/40 p-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-bold text-brand-900">{dict.residenceDetail.noPackTitle}</p>
              <p className="text-sm text-brand-800/80">{dict.residenceDetail.noPackText.replace("{city}", residence.city)}</p>
            </div>
            <Link
              href={localePath(`/packs/custom${residence.destination?.slug ? `?city=${residence.destination.slug}` : ""}`, locale)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-600"
            >
              <Sparkles className="h-4 w-4" /> {dict.residenceDetail.composePack}
            </Link>
          </div>
        </section>

        {/* Similaires */}
        {similar.length > 0 && (
          <section className="border-t border-border py-10">
            <h2 className="mb-6 font-display text-2xl font-semibold text-foreground">
              {dict.residenceDetail.similarTitle.replace("{city}", residence.city)}
            </h2>
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
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
