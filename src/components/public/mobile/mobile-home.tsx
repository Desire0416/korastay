"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, Home as HomeIcon, Compass, Sparkles, Check, Quote, Star,
  ShieldCheck, Smartphone, Headset, Handshake, KeyRound, type LucideIcon,
} from "lucide-react";
import { HeroSearch } from "../hero-search";
import { DestinationCard } from "../destination-card";
import { ActivityCard } from "../activity-card";
import { MobileResidenceCard, MobilePackCard } from "./mobile-cards";
import { CountUp } from "../count-up";
import { Motif, Ornament } from "@/components/brand/motif";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";
import { cn, initials } from "@/lib/utils";
import type { ResidenceCardData, CommunityStats } from "@/lib/queries";
import type { ActivityCardData } from "@/lib/activity-queries";

type Destination = React.ComponentProps<typeof DestinationCard>["destination"];
type Pack = React.ComponentProps<typeof MobilePackCard>["pack"];
type Review = {
  id: string;
  comment: string | null;
  rating: number;
  author: { firstName: string; lastName: string };
  residence: { city: string } | null;
};

interface MobileHomeProps {
  residences: ResidenceCardData[];
  destinations: Destination[];
  packs: Pack[];
  activities: ActivityCardData[];
  reviews: Review[];
  stats: { residences: number; destinations: number; packs: number };
  community: CommunityStats | null;
  favorites: { residences: Set<string>; packs: Set<string> };
}

type TabKey = "residences" | "packs" | "activities";
const TABS: { key: TabKey; icon: LucideIcon; badge?: boolean }[] = [
  { key: "residences", icon: HomeIcon },
  { key: "packs", icon: Compass, badge: true },
  { key: "activities", icon: Sparkles },
];

const WHY_ICONS = [ShieldCheck, Smartphone, Headset, Handshake];

function SectionHead({
  eyebrow,
  title,
  accent,
  href,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  href?: string;
}) {
  const dict = useI18n();
  return (
    <div className="mb-4 flex items-end justify-between gap-3 px-5">
      <div className="min-w-0">
        {eyebrow && (
          <p className="eyebrow mb-1.5 flex items-center gap-2 text-[10px] text-terracotta">
            <Ornament side="left" />
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-[1.6rem] leading-[1.1] text-foreground">
          {title} {accent && <em className="italic text-terracotta">{accent}</em>}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          aria-label={dict.home.mobile.viewAria.replace("{title}", `${title} ${accent ?? ""}`.trim())}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink active:scale-95"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function Rail({ children }: { children: React.ReactNode }) {
  return (
    <div className="no-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-px-5 px-5 pb-1">
      {children}
    </div>
  );
}

export function MobileHome({ residences, destinations, packs, activities, reviews, stats, community, favorites }: MobileHomeProps) {
  const dict = useI18n();
  const h = dict.home;
  const [tab, setTab] = React.useState<TabKey>("residences");

  const communityTiles = community
    ? [
        { value: community.visits, label: h.stats.visits },
        { value: community.travelers, label: h.stats.travelers },
        { value: community.owners, label: h.stats.owners },
        { value: community.guides, label: h.stats.guides },
        { value: community.partners, label: h.stats.partners },
        { value: stats.residences, label: h.stats.residences },
      ]
    : [];

  return (
    <div className="md:hidden">
      {/* ===== Hero ===== */}
      <section className="grain relative overflow-hidden px-5 pb-6 pt-7">
        <Motif variant="bogolan" fade="bottom" className="text-sand-500/[0.16]" />
        <div aria-hidden="true" className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-400/80" />
        <div className="relative">
          <p className="eyebrow flex items-center gap-2 text-[10px] text-terracotta">
            <Ornament side="left" />
            {h.hero.eyebrow}
          </p>
          <h1 className="mt-4 text-balance font-display text-[2.4rem] font-normal leading-[1.02] tracking-[-0.02em] text-foreground">
            {h.hero.title} <em className="italic text-terracotta">{h.hero.accent}</em>
          </h1>
          <div className="mt-6">
            <HeroSearch destinations={destinations.map((d) => ({ name: d.name, slug: d.slug }))} variant="compact" pill />
          </div>
          <ul className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5">
            {h.hero.trust.map((t) => (
              <li key={t} className="flex shrink-0 items-center gap-1.5 rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-[12px] font-semibold text-foreground/80">
                <Check className="h-3 w-3 text-brand-500" strokeWidth={3} />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== Onglets ===== */}
      <div className="sticky top-[var(--header-h)] z-20 flex border-b border-border bg-background/95 px-2 backdrop-blur-lg">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-pressed={active}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-2 py-3.5 text-[13px] font-semibold transition-colors",
                active ? "text-ink" : "text-muted"
              )}
            >
              <motion.span
                className="relative inline-flex"
                whileTap={{ scale: 0.8 }}
                animate={active ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <t.icon className={cn("h-[18px] w-[18px]", active ? "text-terracotta" : "text-muted")} strokeWidth={1.8} />
              </motion.span>
              {h.mobile.tabs[t.key]}
              {t.badge && (
                <span className="rounded bg-terracotta px-1 py-px text-[8.5px] font-bold uppercase tracking-wide text-white">
                  {h.mobile.popular}
                </span>
              )}
              {active && <motion.span layoutId="mh-tab-underline" className="absolute inset-x-4 -bottom-px h-[2px] rounded-full bg-ink" />}
            </button>
          );
        })}
      </div>

      {/* ===== Onglet LOGEMENTS ===== */}
      {tab === "residences" && (
        <div>
          {residences.length > 0 && (
            <section className="pt-7">
              <SectionHead
                eyebrow={h.residences.eyebrow}
                title={h.residences.title}
                accent={h.residences.accent}
                href={localePath("/residences", dict.locale)}
              />
              <Rail>
                {residences.map((r, i) => (
                  <div key={r.id} className="w-[58vw] max-w-[230px] shrink-0 snap-start">
                    <MobileResidenceCard residence={r} favorited={favorites.residences.has(r.id)} priority={i < 2} />
                  </div>
                ))}
              </Rail>
            </section>
          )}

          {destinations.length > 0 && (
            <section className="pt-10">
              <SectionHead
                eyebrow={h.destinations.eyebrow}
                title={h.destinations.title}
                href={localePath("/destinations", dict.locale)}
              />
              <Rail>
                {destinations.map((d) => (
                  <div key={d.slug} className="w-[34vw] max-w-[150px] shrink-0 snap-start">
                    <DestinationCard destination={d} shape="arch" />
                  </div>
                ))}
              </Rail>
            </section>
          )}

          {packs.length > 0 && (
            <section className="pt-10">
              <SectionHead
                eyebrow={h.experiences.eyebrow}
                title={h.experiences.title}
                accent={h.experiences.accent}
                href={localePath("/packs", dict.locale)}
              />
              <Rail>
                {packs.slice(0, 6).map((p) => (
                  <div key={p.id} className="w-[46vw] max-w-[190px] shrink-0 snap-start">
                    <MobilePackCard pack={p} favorited={favorites.packs.has(p.id)} />
                  </div>
                ))}
              </Rail>
            </section>
          )}

          {/* Comment ca marche */}
          <section className="px-5 pt-12">
            <p className="eyebrow mb-1.5 flex items-center gap-2 text-[10px] text-terracotta">
              <Ornament side="left" />
              {h.how.eyebrow}
            </p>
            <h2 className="font-display text-[1.6rem] leading-[1.1] text-foreground">
              {h.how.title} <em className="italic text-terracotta">{h.how.accent}</em>
            </h2>
            <ol className="mt-5 space-y-3">
              {h.how.steps.map((step, i) => (
                <li key={step.title} className="flex gap-4 rounded-[1.25rem] border border-border bg-surface p-4">
                  <span className="flex h-12 w-10 shrink-0 items-center justify-center rounded-arch-sm border border-terracotta/30 font-display text-lg italic text-terracotta">
                    0{i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-[17px] text-foreground">{step.title}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Pourquoi KoraStay */}
          <section className="relative mt-12 overflow-hidden bg-sand-100 px-5 py-10">
            <Motif variant="bogolan" fade="bottom" className="text-sand-500/20" />
            <div className="relative">
              <h2 className="font-display text-[1.6rem] leading-[1.1] text-foreground">
                {h.why.title} <em className="italic text-terracotta">{h.why.accent}</em>
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {h.why.items.map((item, i) => {
                  const WhyIcon = WHY_ICONS[i] ?? ShieldCheck;
                  return (
                    <div key={item.title} className="rounded-[1.25rem] bg-surface p-4 shadow-soft">
                      <span className="flex h-10 w-9 items-center justify-center rounded-arch-sm bg-brand-500 text-white">
                        <WhyIcon className="h-4 w-4" strokeWidth={1.8} />
                      </span>
                      <p className="mt-3 text-[13.5px] font-bold leading-snug text-foreground">{item.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Proprietaire */}
          <section className="px-5 pt-10">
            <Link
              href={localePath("/devenir-proprietaire", dict.locale)}
              className="grain relative block overflow-hidden rounded-[1.5rem] bg-terracotta p-6 text-white active:scale-[0.99]"
            >
              <Motif variant="bogolan" fade="bottom" className="text-white/[0.08]" />
              <div className="relative">
                <KeyRound className="h-6 w-6 text-gold-300" strokeWidth={1.7} />
                <p className="mt-4 font-display text-[1.45rem] leading-tight">
                  {h.owner.title} <em className="italic text-gold-200">{h.owner.accent}</em>
                </p>
                <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-ink">
                  {h.owner.cta} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </section>

          {/* Temoignages */}
          {reviews.length > 0 && (
            <section className="pt-12">
              <SectionHead eyebrow={h.testimonials.eyebrow} title={h.testimonials.title} accent={h.testimonials.accent} />
              <Rail>
                {reviews.map((r) => (
                  <figure key={r.id} className="w-[78vw] max-w-[300px] shrink-0 snap-start rounded-[1.25rem] border border-border bg-surface p-5 shadow-soft">
                    <Quote className="h-6 w-6 fill-terracotta/15 text-terracotta" strokeWidth={1.3} />
                    <blockquote className="mt-3 line-clamp-5 font-display text-[15px] leading-relaxed text-foreground">« {r.comment} »</blockquote>
                    <figcaption className="mt-4 flex items-center gap-2.5">
                      <Avatar className="h-8 w-8"><AvatarFallback className="text-2xs">{initials(r.author.firstName, r.author.lastName)}</AvatarFallback></Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-bold text-foreground">{r.author.firstName} {r.author.lastName.charAt(0)}.</p>
                        <p className="flex items-center gap-1 text-[11px] text-muted">
                          <Star className="h-3 w-3 fill-gold-500 text-gold-500" /> {r.rating}/5{r.residence ? ` · ${r.residence.city}` : ""}
                        </p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </Rail>
            </section>
          )}

          {/* Chiffres (masquables par l'admin) + FAQ */}
          <section className="px-5 pb-6 pt-12">
            {community && (
              <div className="mb-5 grid grid-cols-3 gap-px overflow-hidden rounded-[1.25rem] border border-border bg-border text-center">
                {communityTiles.map((s, i) => (
                  <div key={s.label} className={cn("py-4", i === 0 ? "bg-terracotta text-white" : "bg-surface")}>
                    <CountUp value={s.value} className="block font-display text-xl tabular-nums" />
                    <p className={cn("eyebrow mt-1 text-[8.5px]", i === 0 ? "text-white/85" : "text-muted")}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}
            <Link
              href={localePath("/faq", dict.locale)}
              className="flex items-center justify-between rounded-[1.25rem] bg-ink px-5 py-4 text-white active:scale-[0.99]"
            >
              <span>
                <span className="eyebrow block text-[9.5px] text-gold-300">{h.faq.eyebrow}</span>
                <span className="mt-0.5 block font-display text-[17px]">{h.faq.title} {h.faq.accent}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-gold-300" />
            </Link>
          </section>
        </div>
      )}

      {/* ===== Onglet PACKS ===== */}
      {tab === "packs" && (
        <section className="px-5 pb-6 pt-7">
          <h2 className="font-display text-[1.6rem] leading-[1.1] text-foreground">
            {h.experiences.title} <em className="italic text-terracotta">{h.experiences.accent}</em>
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{h.experiences.desc}</p>
          {packs.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">{h.mobile.noPacks}</p>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3">
              {packs.map((p) => (
                <MobilePackCard key={p.id} pack={p} favorited={favorites.packs.has(p.id)} />
              ))}
            </div>
          )}
          <Link
            href={localePath("/packs/custom", dict.locale)}
            className="relative mt-5 block overflow-hidden rounded-[1.25rem] bg-gold-500 p-5 text-ink-900 active:scale-[0.99]"
          >
            <Motif variant="bogolan" className="text-ink-900/[0.08]" />
            <p className="relative font-display text-lg">{h.experiences.custom.title}</p>
            <p className="relative mt-1 text-[13px] text-ink-900/75">{h.experiences.custom.text}</p>
            <span className="relative mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold">
              {h.experiences.custom.cta} <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
          <Link
            href={localePath("/packs", dict.locale)}
            className="mt-3 flex items-center justify-between rounded-[1.25rem] border border-border bg-surface px-5 py-4 text-[14px] font-semibold text-foreground active:bg-sand-50"
          >
            {h.experiences.seePacks}
            <ArrowRight className="h-4 w-4 text-muted" />
          </Link>
        </section>
      )}

      {/* ===== Onglet ACTIVITES ===== */}
      {tab === "activities" && (
        <section className="px-5 pb-6 pt-7">
          <h2 className="font-display text-[1.6rem] leading-[1.1] text-foreground">{h.experiences.activitiesLabel}</h2>
          {activities.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">{h.mobile.noActivities}</p>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6">
              {activities.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </div>
          )}
          <Link
            href={localePath("/activites", dict.locale)}
            className="mt-6 flex items-center justify-between rounded-[1.25rem] border border-border bg-surface px-5 py-4 text-[14px] font-semibold text-foreground active:bg-sand-50"
          >
            {h.experiences.seeActivities}
            <ArrowRight className="h-4 w-4 text-muted" />
          </Link>
        </section>
      )}

    </div>
  );
}
