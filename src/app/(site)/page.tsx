import Link from "next/link";
import {
  ShieldCheck, Smartphone, Headset, Handshake, ArrowRight, Check, Quote, Star,
  Briefcase, KeyRound, Wand2,
} from "lucide-react";
import { HeroSearch } from "@/components/public/hero-search";
import { ResidenceCard } from "@/components/public/residence-card";
import { PackCard } from "@/components/public/pack-card";
import { ActivityCard } from "@/components/public/activity-card";
import { DestinationCard } from "@/components/public/destination-card";
import { PlatformStats } from "@/components/public/platform-stats";
import { SectionHeading } from "@/components/public/section-heading";
import { HeroArt } from "@/components/public/home/hero-art";
import { Motif, MotifBand, Ornament } from "@/components/brand/motif";
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
import { localePath } from "@/lib/i18n";
import { initials } from "@/lib/utils";
import { MobileHome } from "@/components/public/mobile/mobile-home";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, APP_DESCRIPTION, SITE_URL, CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants";
import { alternatesFor } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: { absolute: dict.home.meta.title },
    description: dict.home.meta.description,
    alternates: alternatesFor("/"),
  };
}

const WHY_ICONS = [ShieldCheck, Smartphone, Headset, Handshake];

export default async function HomePage() {
  const [residences, destinations, packs, activities, reviews, stats, community, favorites, { locale, dict }] =
    await Promise.all([
      getFeaturedResidences(6),
      getPopularDestinations(6),
      getPacks(),
      getFeaturedActivities(4),
      getRecentReviews(3),
      getPlatformStats(),
      getCommunityStats().catch(() => null),
      getUserFavoriteIds(),
      getI18n(),
    ]);
  const h = dict.home;

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
    inLanguage: locale === "en" ? "en-US" : "fr-FR",
    description: APP_DESCRIPTION,
  };

  // Visuels du hero tires de la base : une destination photographiee (arche
  // principale) et le premier logement mis en avant (arche + carte flottante).
  const heroDestination = destinations.find((d) => d.heroImageUrl) ?? destinations[0];
  const star = residences[0];
  const heroMain = {
    src: heroDestination?.heroImageUrl,
    alt: heroDestination?.name ?? APP_NAME,
    seed: `hero-${heroDestination?.slug ?? "main"}`,
  };
  const heroSecondary = {
    src: star?.images[0]?.url,
    alt: star?.name ?? APP_NAME,
    seed: `hero-${star?.slug ?? "secondary"}`,
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

      {/* ===== EXPERIENCE DESKTOP ===== */}
      <div className="hidden md:block">
        {/* ===== HERO ===== */}
        <section className="grain relative overflow-hidden">
          <Motif variant="bogolan" fade="bottom" className="text-sand-500/[0.14]" />
          <div aria-hidden="true" className="absolute -right-32 -top-48 h-[34rem] w-[34rem] rounded-full bg-terracotta/10 blur-3xl" />
          <div aria-hidden="true" className="absolute -left-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-brand-500/[0.07] blur-3xl" />

          <div className="container-page relative grid items-center gap-10 pb-14 pt-12 lg:grid-cols-[1.08fr_1fr] lg:gap-14 lg:pb-20 lg:pt-16">
            <div>
              <p className="eyebrow flex items-center gap-3 text-terracotta">
                <Ornament side="left" />
                {h.hero.eyebrow}
              </p>
              <h1 className="mt-6 text-balance font-display text-display-md font-normal text-foreground lg:text-display-lg xl:text-display-xl">
                {h.hero.title} <em className="italic text-terracotta">{h.hero.accent}</em>
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted">{h.hero.subtitle}</p>

              <div className="mt-9">
                <HeroSearch
                  destinations={destinations.map((d) => ({ name: d.name, slug: d.slug }))}
                  chips="light"
                  align="left"
                />
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
                {h.hero.trust.map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <HeroArt
              main={heroMain}
              secondary={heroSecondary}
              featured={
                star
                  ? {
                      href: localePath(`/residences/${star.slug}`, locale),
                      name: star.name,
                      city: star.city,
                      image: star.images[0]?.url,
                      rating: star.ratingAverage,
                      ratingCount: star.ratingCount,
                      price: star.pricePerNight,
                    }
                  : null
              }
              circleText={h.hero.circleText}
              floatingLabel={h.hero.floatingLabel}
              perNight={h.hero.perNight}
            />
          </div>

          {/* Chiffres d'offre */}
          <div className="container-page relative pb-16">
            <div className="grid grid-cols-3 divide-x divide-ink/10 border-y border-ink/10">
              {[
                { value: `${stats.residences}+`, label: h.hero.stats.stays },
                { value: stats.destinations, label: h.hero.stats.destinations },
                { value: `${stats.packs}+`, label: h.hero.stats.packs },
              ].map((s) => (
                <div key={s.label} className="flex items-baseline justify-center gap-3 py-6">
                  <span className="font-display text-4xl text-foreground lg:text-5xl">{s.value}</span>
                  <span className="eyebrow text-[10.5px] text-muted">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== DESTINATIONS ===== */}
        {destinations.length > 0 && (
          <section className="container-page py-20 lg:py-24">
            <SectionHeading
              eyebrow={h.destinations.eyebrow}
              title={h.destinations.title}
              accent={h.destinations.accent}
              description={h.destinations.desc}
              href={localePath("/destinations", locale)}
              hrefLabel={dict.common.seeAll}
            />
            <div className="grid grid-cols-3 gap-x-6 gap-y-10 lg:grid-cols-6">
              {destinations.map((d, i) => (
                <Reveal key={d.slug} delay={i * 0.05}>
                  <DestinationCard destination={d} shape="arch" />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ===== LOGEMENTS ===== */}
        {residences.length > 0 && (
          <section className="container-page py-12 lg:py-16">
            <SectionHeading
              eyebrow={h.residences.eyebrow}
              title={h.residences.title}
              accent={h.residences.accent}
              description={h.residences.desc}
              href={localePath("/residences", locale)}
              hrefLabel={dict.common.seeAll}
            />
            <div className="grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
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
        )}

        {/* ===== EXPERIENCES (packs + activites) ===== */}
        <section className="mt-16 lg:mt-24">
          <MotifBand variant="diamonds" className="text-gold-500" />
          <div className="grain relative overflow-hidden bg-ink-800 py-20 text-white lg:py-28">
            <Motif variant="kente" fade="bottom" className="text-white/[0.04]" />
            <div aria-hidden="true" className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-terracotta/20 blur-3xl" />
            <div className="container-page relative">
              <SectionHeading
                tone="light"
                eyebrow={h.experiences.eyebrow}
                title={h.experiences.title}
                accent={h.experiences.accent}
                description={h.experiences.desc}
                href={localePath("/packs", locale)}
                hrefLabel={h.experiences.seePacks}
              />

              {packs.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {packs.slice(0, 3).map((p) => (
                    <PackCard key={p.id} pack={p} favorited={favorites.packs.has(p.id)} tone="dark" />
                  ))}
                </div>
              )}

              {activities.length > 0 && (
                <div className="mt-20">
                  <div className="mb-8 flex items-end justify-between gap-4 border-b border-white/10 pb-5">
                    <h3 className="font-display text-2xl text-white lg:text-3xl">{h.experiences.activitiesLabel}</h3>
                    <Link
                      href={localePath("/activites", locale)}
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-gold-300 hover:text-gold-200"
                    >
                      {h.experiences.seeActivities}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
                    {activities.map((a) => (
                      <ActivityCard key={a.id} activity={a} tone="dark" />
                    ))}
                  </div>
                </div>
              )}

              {/* Pack sur mesure */}
              <div className="relative mt-20 flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[2rem] bg-gold-500 p-8 text-ink-900 sm:flex-row sm:items-center lg:p-10">
                <Motif variant="bogolan" className="text-ink-900/[0.08]" />
                <div className="relative flex items-start gap-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-arch-sm bg-ink-900 text-gold-300">
                    <Wand2 className="h-6 w-6" strokeWidth={1.6} />
                  </span>
                  <div>
                    <p className="font-display text-2xl lg:text-[1.75rem]">{h.experiences.custom.title}</p>
                    <p className="mt-1 max-w-xl text-[15px] text-ink-900/75">{h.experiences.custom.text}</p>
                  </div>
                </div>
                <Button asChild variant="dark" size="lg" className="relative">
                  <Link href={localePath("/packs/custom", locale)}>
                    {h.experiences.custom.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <MotifBand variant="diamonds" className="rotate-180 text-gold-500" />
        </section>

        {/* ===== COMMENT CA MARCHE ===== */}
        <section className="container-page py-20 lg:py-28">
          <SectionHeading
            align="center"
            eyebrow={h.how.eyebrow}
            title={h.how.title}
            accent={h.how.accent}
          />
          <ol className="relative grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {/* Fil de chevrons reliant les etapes */}
            <div aria-hidden="true" className="absolute left-[16%] right-[16%] top-11 hidden h-3.5 md:block">
              <div className="motif motif-chevron text-terracotta/35" />
            </div>
            {h.how.steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08}>
                <li className="relative flex flex-col items-center text-center">
                  <span className="relative flex h-[5.5rem] w-[4.75rem] items-center justify-center rounded-arch-sm border border-terracotta/30 bg-background">
                    <span className="font-display text-4xl italic text-terracotta">0{i + 1}</span>
                  </span>
                  <h3 className="mt-6 font-display text-2xl text-foreground">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted">{step.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* ===== POURQUOI KORASTAY ===== */}
        <section className="relative overflow-hidden bg-sand-100 py-20 lg:py-28">
          <Motif variant="bogolan" fade="x" className="text-sand-500/20" />
          <div className="container-page relative grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionHeading
                className="mb-0 sm:mb-0"
                eyebrow={h.why.eyebrow}
                title={h.why.title}
                accent={h.why.accent}
                description={h.why.desc}
              />
              <Button asChild variant="dark" size="lg" className="mt-9">
                <Link href={localePath("/quality", locale)}>
                  {h.why.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {h.why.items.map((item, i) => {
                const WhyIcon = WHY_ICONS[i] ?? ShieldCheck;
                return (
                  <Reveal key={item.title} delay={i * 0.06} className={i % 2 === 1 ? "sm:translate-y-8" : undefined}>
                    <div className="h-full rounded-[1.75rem] border border-sand-300/60 bg-surface p-7 shadow-soft">
                      <span className="flex h-14 w-12 items-center justify-center rounded-arch-sm bg-brand-500 text-white">
                        <WhyIcon className="h-5 w-5" strokeWidth={1.7} />
                      </span>
                      <h3 className="mt-5 font-display text-xl text-foreground">{item.title}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-muted">{item.text}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== KORASTAY EN CHIFFRES (masquable par l'admin) ===== */}
        {community && <PlatformStats community={community} offer={stats} />}

        {/* ===== PROPRIETAIRES + BUSINESS ===== */}
        <section className="container-page grid grid-cols-1 gap-6 py-20 lg:grid-cols-2 lg:py-24">
          {[
            { d: h.owner, href: "/devenir-proprietaire", icon: KeyRound, dark: false },
            { d: h.business, href: "/business", icon: Briefcase, dark: true },
          ].map(({ d, href, icon: BlockIcon, dark }) => (
            <div
              key={href}
              className={
                dark
                  ? "grain relative overflow-hidden rounded-[2rem] bg-ink-800 p-9 text-white lg:p-12"
                  : "grain relative overflow-hidden rounded-[2rem] bg-terracotta p-9 text-white lg:p-12"
              }
            >
              <Motif variant={dark ? "kente" : "bogolan"} fade="bottom" className="text-white/[0.07]" />
              <div className="relative">
                <span className="flex h-14 w-12 items-center justify-center rounded-arch-sm bg-white/10 text-gold-300 ring-1 ring-white/15">
                  <BlockIcon className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <p className="eyebrow mt-8 text-gold-300">{d.eyebrow}</p>
                <h3 className="mt-3 text-balance font-display text-[2rem] leading-[1.1] lg:text-[2.4rem]">
                  {d.title} <em className="italic text-gold-200">{d.accent}</em>
                </h3>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75">{d.text}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {d.points.map((pt) => (
                    <li key={pt} className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-[13px] font-medium text-white/90">
                      {pt}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={dark ? "accent" : "white"} size="lg" className="mt-9">
                  <Link href={localePath(href, locale)}>
                    {d.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </section>

        {/* ===== TEMOIGNAGES ===== */}
        {reviews.length > 0 && (
          <section className="container-page py-12 lg:py-16">
            <SectionHeading
              align="center"
              eyebrow={h.testimonials.eyebrow}
              title={h.testimonials.title}
              accent={h.testimonials.accent}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {reviews.map((r, i) => (
                <Reveal key={r.id} delay={i * 0.06}>
                  <figure className="flex h-full flex-col rounded-[1.75rem] border border-border bg-surface p-8 shadow-soft">
                    <div className="flex items-center justify-between">
                      <Quote className="h-8 w-8 fill-terracotta/15 text-terracotta" strokeWidth={1.3} />
                      <span className="flex items-center gap-0.5" aria-label={`${r.rating}/5`}>
                        {Array.from({ length: 5 }, (_, k) => (
                          <Star key={k} className={k < r.rating ? "h-3.5 w-3.5 fill-gold-500 text-gold-500" : "h-3.5 w-3.5 text-sand-300"} />
                        ))}
                      </span>
                    </div>
                    <blockquote className="mt-5 flex-1 font-display text-[1.2rem] leading-relaxed text-foreground">
                      « {r.comment} »
                    </blockquote>
                    <figcaption className="mt-7 flex items-center gap-3 border-t border-border pt-5">
                      <Avatar>
                        <AvatarFallback>{initials(r.author.firstName, r.author.lastName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {r.author.firstName} {r.author.lastName.charAt(0)}.
                        </p>
                        {r.residence && <p className="text-xs text-muted">{r.residence.city}</p>}
                      </div>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ===== FAQ ===== */}
        <section className="container-page py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
              <SectionHeading
                className="mb-0 sm:mb-0"
                eyebrow={h.faq.eyebrow}
                title={h.faq.title}
                accent={h.faq.accent}
                description={h.faq.desc}
              />
              <div className="relative mt-9 overflow-hidden rounded-[1.75rem] bg-brand-500 p-7 text-white">
                <Motif variant="dots" className="text-white/10" />
                <p className="relative font-display text-xl">{h.faq.moreTitle}</p>
                <div className="relative mt-5 flex flex-wrap gap-3">
                  <Button asChild variant="white" size="md">
                    <Link href={localePath("/contact", locale)}>{h.faq.moreCta}</Link>
                  </Button>
                  <Button asChild variant="outline-light" size="md">
                    <Link href={localePath("/faq", locale)}>{h.faq.allFaq}</Link>
                  </Button>
                </div>
              </div>
            </div>
            <Accordion type="single" collapsible defaultValue="faq-0" className="space-y-3">
              {h.faq.items.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </div>
    </>
  );
}
