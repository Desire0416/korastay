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
import { Badge } from "@/components/ui/badge";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pack = await getPackBySlug(slug);
  return { title: pack?.name ?? "Pack", description: pack?.subtitle ?? "" };
}

export default async function PackDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pack = await getPackBySlug(slug);
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

  return (
    <div className="pb-24 lg:pb-0">
      <JsonLd data={jsonLd} />
      <div className="relative lg:hidden">
        <Link href="/packs" className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur" aria-label="Retour">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="absolute right-4 top-4 z-10">
          <FavoriteButton packId={pack.id} initialFavorited={favorites.packs.has(pack.id)} />
        </div>
      </div>

      <div className="container-page pt-0 lg:pt-6">
        <div className="mb-4 hidden items-end justify-between lg:flex">
          <div>
            <nav className="mb-2 flex items-center gap-1 text-sm text-muted">
              <Link href="/packs" className="hover:text-foreground">Packs Découverte</Link>
              <span>/</span><span className="text-foreground">{pack.name}</span>
            </nav>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">{pack.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted">
              {pack.destination && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {pack.destination.name}</span>}
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {pack.durationDays}j / {pack.durationNights}n</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {pack.basePersons} a {pack.maxPersons} personnes</span>
              {pack.ratingCount > 0 && <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-gold-500 text-gold-500" /> {pack.ratingAverage.toFixed(1)}</span>}
            </div>
          </div>
          <FavoriteButton packId={pack.id} initialFavorited={favorites.packs.has(pack.id)} variant="inline" />
        </div>

        <div className="-mx-5 lg:mx-0">
          <PhotoGallery images={pack.images} seedPrefix={`pack-${pack.slug}`} name={pack.name} />
        </div>

        <div className="mt-4 lg:hidden">
          <h1 className="text-2xl font-bold text-foreground">{pack.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted">
            <Badge tone="gold"><Clock className="h-3 w-3" /> {pack.durationDays}j / {pack.durationNights}n</Badge>
            {pack.destination && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {pack.destination.name}</span>}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            <section className="border-b border-border pb-7">
              <h2 className="mb-3 text-xl font-bold text-foreground">A propos de ce pack</h2>
              <p className="leading-relaxed text-foreground/90">{pack.description}</p>
              {pack.destination?.slug && (
                <div className="mt-5 flex flex-col items-start justify-between gap-3 rounded-3xl border-2 border-dashed border-brand-300 bg-brand-50/40 p-5 sm:flex-row sm:items-center">
                  <p className="text-sm font-medium text-brand-900">Ce pack ne vous convient pas ? Composez le votre a {pack.destination.name}.</p>
                  <Link href={`/packs/custom?city=${pack.destination.slug}`} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
                    <Sparkles className="h-4 w-4" /> Composer mon pack
                  </Link>
                </div>
              )}
            </section>

            {/* Inclus / non inclus */}
            <section className="grid grid-cols-1 gap-6 border-b border-border py-7 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-bold text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-success" /> Inclus
                </h3>
                <ul className="space-y-2">
                  {included.map((i) => (
                    <li key={i.id} className="flex items-start gap-2 text-sm text-foreground/90">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span><span className="font-semibold">{i.label}</span>{i.details ? ` - ${i.details}` : ""}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {notIncluded.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-foreground">
                    <XCircle className="h-5 w-5 text-muted" /> Non inclus
                  </h3>
                  <ul className="space-y-2">
                    {notIncluded.map((i) => (
                      <li key={i.id} className="flex items-start gap-2 text-sm text-muted">
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> {i.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Programme */}
            <section className="border-b border-border py-7">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-foreground">
                <Calendar className="h-5 w-5 text-brand-600" /> Programme jour par jour
              </h2>
              <div className="space-y-6">
                {pack.programDays.map((day) => (
                  <div key={day.id} className="relative pl-8">
                    <span className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">{day.dayNumber}</span>
                    <div className="absolute left-[13px] top-7 h-full w-px bg-border" />
                    <h3 className="font-bold text-foreground">{day.title}</h3>
                    {day.description && <p className="text-sm text-muted">{day.description}</p>}
                    <ul className="mt-2 space-y-1.5">
                      {day.activities.map((a) => (
                        <li key={a.id} className="text-sm text-foreground/90">
                          {a.timeLabel && <span className="font-semibold text-brand-600">{a.timeLabel} : </span>}
                          {a.title}{a.description ? ` - ${a.description}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Infos pratiques */}
            <section className="border-b border-border py-7">
              <h2 className="mb-4 text-xl font-bold text-foreground">Informations pratiques</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {pack.physicalLevel && <Practical icon={Backpack} label="Niveau physique" value={pack.physicalLevel} />}
                {pack.clothingRecommendations && <Practical icon={Shirt} label="Tenue conseillee" value={pack.clothingRecommendations} />}
                {pack.documentsToBring && <Practical icon={FileText} label="A apporter" value={pack.documentsToBring} />}
                {pack.meetingPoint && <Practical icon={MapPin} label="Point de rendez-vous" value={pack.meetingPoint} />}
              </div>
            </section>

            {/* Annulation */}
            {pack.cancellationPolicy && (
              <section className="py-7">
                <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-foreground">
                  <Info className="h-5 w-5 text-brand-600" /> Conditions d'annulation
                </h2>
                <p className="text-sm text-foreground/90">{pack.cancellationPolicy}</p>
              </section>
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
    <div className="flex items-start gap-3 rounded-2xl bg-surface-soft p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
      <div>
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className="text-sm text-muted">{value}</p>
      </div>
    </div>
  );
}
