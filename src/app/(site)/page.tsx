import Link from "next/link";
import {
  ShieldCheck, Smartphone, Headset, MapPinned, Star, ArrowRight,
  Briefcase, Home as HomeIcon, Compass, Handshake, Quote, Sparkles,
} from "lucide-react";
import { HeroSearch } from "@/components/public/hero-search";
import { ResidenceCard } from "@/components/public/residence-card";
import { PackCard } from "@/components/public/pack-card";
import { DestinationCard } from "@/components/public/destination-card";
import { PlatformStats } from "@/components/public/platform-stats";
import { SectionHeading } from "@/components/public/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getFeaturedResidences, getPopularDestinations, getPacks,
  getRecentReviews, getPlatformStats, getCommunityStats,
} from "@/lib/queries";
import { getFeaturedActivities } from "@/lib/activity-queries";
import { getUserFavoriteIds } from "@/server/actions/favorites";
import { getI18n } from "@/lib/i18n.server";
import { initials } from "@/lib/utils";
import { MobileHome } from "@/components/public/mobile/mobile-home";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, APP_DESCRIPTION, SITE_URL, CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants";

const CATEGORIES = [
  { label: "Location meublée", href: "/residences", icon: HomeIcon, desc: "Logements meublés contrôlés", color: "bg-brand-50 text-brand-600" },
  { label: "Packs Découverte", href: "/packs", icon: Compass, desc: "Séjours clE en main", color: "bg-gold-50 text-gold-600" },
  { label: "KoraStay Business", href: "/business", icon: Briefcase, desc: "Missions & entreprises", color: "bg-sky-50 text-info" },
  { label: "Devenir partenaire", href: "/partners", icon: Handshake, desc: "Guides, transport, resto", color: "bg-emerald-50 text-success" },
];

const WHY = [
  { icon: ShieldCheck, title: "Locations meublées vérifiées", text: "Chaque logement est contrôle selon des standards stricts de propreté, sécurité et équipement avant publication." },
  { icon: Smartphone, title: "Paiement mobile", text: "Réservez et payez en toute simplicité via Orange Money, Wave ou carte bancaire." },
  { icon: Headset, title: "Assistance locale", text: "Une équipe disponible avant, pendant et après votre séjour, partout en Côte d'Ivoire." },
  { icon: MapPinned, title: "Partenaires locaux", text: "Guides, transporteurs et restaurants sélectionnés pour une expérience authentique." },
];

const FAQ = [
  { q: "Comment savoir si une résidence est fiable ?", a: "Chaque résidence affichant le badge \"Résidence vérifiée KoraStay\" a ete contrôlée par notre équipe selon des critères de propreté, sécurité, équipement et conformite." },
  { q: "Quels moyens de paiement sont acceptes ?", a: "Orange Money, Wave, carte bancaire Visa/Mastercard et bientot MTN MoMo. Le paiement est securise et la reservation confirmee immediatement." },
  { q: "Puis-je annuler ma réservation ?", a: "Oui. Pour les résidences : remboursement intégral a plus de 72h du check-in, 50% entre 24 et 72h. Les conditions detaillees sont sur chaque fiche." },
  { q: "Qu'est-ce qu'un Pack Découverte ?", a: "Un séjour clE en main incluant hébergement vérifié, petit dejeuner, transport en ville et guide local certifie, pour découvrir une destination sans rien organiser." },
];

export default async function HomePage() {
  const [residences, destinations, packs, activities, reviews, stats, community, favorites, { dict }] =
    await Promise.all([
      getFeaturedResidences(6),
      getPopularDestinations(6),
      getPacks(),
      getFeaturedActivities(6),
      getRecentReviews(3),
      getPlatformStats(),
      getCommunityStats().catch(() => null),
      getUserFavoriteIds(),
      getI18n(),
    ]);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description: APP_DESCRIPTION,
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE,
    areaServed: { "@type": "Country", name: "Côte d'Ivoire" },
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: SITE_URL,
    inLanguage: "fr-FR",
    description: APP_DESCRIPTION,
  };

  return (
    <>
      <JsonLd data={orgJsonLd} />
      <JsonLd data={websiteJsonLd} />
      {/* ===== EXPERIENCE MOBILE (application) ===== */}
      <MobileHome
        residences={residences}
        destinations={destinations}
        packs={packs}
        activities={activities}
        reviews={reviews}
        stats={stats}
        community={community}
        favorites={favorites}
      />

      {/* ===== EXPERIENCE DESKTOP (inchangee) ===== */}
      <div className="hidden md:block">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Arriere-plan : placez votre photo dans public/hero.jpg */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 gradient-brand" />
          <div
            className="absolute inset-0 bg-cover bg-center motion-safe:animate-[hero-zoom_28s_ease-in-out_infinite_alternate]"
            style={{ backgroundImage: "url('/hero.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink/80" />
        </div>

        <div className="container-page relative pb-16 pt-16 sm:pt-20 md:pb-28 md:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-sm font-semibold text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              {dict.home.heroBadge}
            </span>
            <h1 className="mt-5 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl">
              {dict.home.heroTitleLine1}{" "}
              <span className="text-gold-300">{dict.home.heroTitleHighlight}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-base text-white/85 sm:text-lg">
              {dict.home.heroSubtitle}
            </p>
          </div>

          <div className="mt-9 flex justify-center">
            <HeroSearch
              destinations={destinations.map((d) => ({ name: d.name, slug: d.slug }))}
            />
          </div>

          <div className="mx-auto mt-10 flex max-w-lg items-center justify-center gap-8 text-center">
            {[
              { value: `${stats.residences}+`, label: "Locations" },
              { value: stats.destinations, label: "Destinations" },
              { value: `${stats.packs}+`, label: "Packs" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl font-semibold text-white">{s.value}</p>
                <p className="text-sm text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="container-page py-10">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat.href} delay={i * 0.05}>
              <Link
                href={cat.href}
                className="group flex h-full flex-col gap-3 rounded-3xl border border-border bg-surface p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${cat.color}`}>
                  <cat.icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-bold text-foreground">{cat.label}</p>
                  <p className="text-sm text-muted">{cat.desc}</p>
                </div>
                <ArrowRight className="mt-auto h-4 w-4 text-brand-500 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== KORASTAY EN CHIFFRES (masquable par l'admin) ===== */}
      {community && <PlatformStats community={community} offer={stats} />}

      {/* ===== DESTINATIONS ===== */}
      <section className="container-page py-10">
        <SectionHeading
          eyebrow="Explorer"
          title="Destinations populaires"
          description="De Daloa a Assinie, découvrez les villes ou KoraStay vous accueille."
          href="/destinations"
        />
        <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-6 md:overflow-visible md:px-0">
          {destinations.map((d) => (
            <div key={d.slug} className="w-40 shrink-0 snap-start md:w-auto">
              <DestinationCard destination={d} />
            </div>
          ))}
        </div>
      </section>

      {/* ===== RESIDENCES VEDETTES ===== */}
      <section className="container-page py-10">
        <SectionHeading
          eyebrow="Sélection"
          title="Locations meublées vedettes"
          description="Les logements les mieux notes, vérifiés par KoraStay."
          href="/residences"
        />
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {residences.map((r, i) => (
            <ResidenceCard
              key={r.id}
              residence={r}
              favorited={favorites.residences.has(r.id)}
              priority={i < 3}
            />
          ))}
        </div>
      </section>

      {/* ===== PACKS ===== */}
      <section className="container-page py-10">
        <SectionHeading
          eyebrow="KoraStay Découverte"
          title="Packs touristiques accompagnes"
          description="Des séjours clE en main avec hébergement, transport et guide local."
          href="/packs"
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {packs.slice(0, 3).map((p) => (
            <PackCard key={p.id} pack={p} favorited={favorites.packs.has(p.id)} />
          ))}
        </div>
      </section>

      {/* ===== POURQUOI KORASTAY ===== */}
      <section className="bg-surface py-16">
        <div className="container-page">
          <SectionHeading
            align="center"
            eyebrow="Pourquoi KoraStay"
            title="Voyagez l'esprit tranquille"
            description="Une plateforme pensee pour la confiance, du premier clic au retour de séjour."
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="h-full rounded-3xl border border-border bg-background p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white">
                    <item.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-bold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BUSINESS + PROPRIETAIRE ===== */}
      <section className="container-page grid grid-cols-1 gap-5 py-14 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-4xl bg-ink p-8 text-white sm:p-10">
          <div className="gradient-hero absolute inset-0 opacity-40" />
          <div className="relative">
            <Briefcase className="h-9 w-9 text-gold-400" />
            <h3 className="mt-4 font-display text-2xl font-semibold">KoraStay Business</h3>
            <p className="mt-2 max-w-sm text-white/80">
              Hébergements fiables et facturables pour vos équipes en mission.
              Contrats cadres, assistance dediee et rapports mensuels.
            </p>
            <Button asChild variant="accent" className="mt-6">
              <Link href="/business">Demander un devis <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-4xl border border-border bg-brand-50 p-8 sm:p-10">
          <HomeIcon className="h-9 w-9 text-brand-600" />
          <h3 className="mt-4 font-display text-2xl font-semibold text-brand-900">
            Vous etes propriétaire ?
          </h3>
          <p className="mt-2 max-w-sm text-brand-800/80">
            Publiez votre résidence, gérez votre calendrier et vos revenus, et
            recevez des réservations vérifiées partout en Côte d'Ivoire.
          </p>
          <Button asChild className="mt-6">
            <Link href="/devenir-proprietaire">Rejoindre le réseau <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* ===== TEMOIGNAGES ===== */}
      {reviews.length > 0 && (
        <section className="container-page py-10">
          <SectionHeading
            align="center"
            eyebrow="Temoignages"
            title="Ils ont voyage avec KoraStay"
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
                <Quote className="h-7 w-7 text-brand-200" />
                <p className="mt-3 text-[15px] leading-relaxed text-foreground">{r.comment}</p>
                <div className="mt-5 flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{initials(r.author.firstName, r.author.lastName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {r.author.firstName} {r.author.lastName}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <Star className="h-3 w-3 fill-gold-500 text-gold-500" />
                      {r.rating}/5 {r.residence ? `- ${r.residence.city}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== FAQ ===== */}
      <section className="container-page py-14">
        <div className="mx-auto max-w-3xl">
          <SectionHeading align="center" eyebrow="FAQ" title="Questions frequentes" />
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="mt-6 text-center text-sm text-muted">
            Une autre question ?{" "}
            <Link href="/contact" className="font-semibold text-brand-600">Contactez-nous</Link>
          </p>
        </div>
      </section>
      </div>
    </>
  );
}
