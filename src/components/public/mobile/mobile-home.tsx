"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Home as HomeIcon, Compass, Sparkles, Clock, MapPin,
  ShieldCheck, Smartphone, Headset, Star, Quote,
  Eye, Users, KeyRound, Handshake, BedDouble, type LucideIcon,
} from "lucide-react";
import { HeroSearch } from "../hero-search";
import { DestinationCard } from "../destination-card";
import { MobileResidenceCard, MobilePackCard } from "./mobile-cards";
import { CountUp } from "../count-up";
import { SmartImage } from "@/components/ui/smart-image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { activityCategoryMeta } from "@/lib/enums";
import { cn, initials, formatPrice } from "@/lib/utils";
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

type TabKey = "residences" | "packs" | "activites";
const TABS: { key: TabKey; label: string; icon: LucideIcon; color: string; badge?: string }[] = [
  { key: "residences", label: "Location meublée", icon: HomeIcon, color: "text-brand-600" },
  { key: "packs", label: "Packs", icon: Compass, color: "text-gold-600", badge: "Populaire" },
  { key: "activites", label: "Activités", icon: Sparkles, color: "text-success" },
];

const TRUST = [
  { icon: ShieldCheck, title: "Locations meublées vérifiées", text: "Contrôlées par KoraStay." },
  { icon: Smartphone, title: "Paiement mobile", text: "Orange Money, Wave, carte." },
  { icon: Headset, title: "Assistance locale", text: "Avant, pendant, après." },
];

function SectionHead({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 px-5">
      <div className="min-w-0">
        <h2 className="text-[19px] font-bold leading-tight tracking-tight text-foreground">{title}</h2>
        {subtitle && <p className="truncate text-[13px] text-muted">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} aria-label={`Voir : ${title}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground active:scale-95">
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function MobileHome({ residences, destinations, packs, activities, reviews, stats, community, favorites }: MobileHomeProps) {
  const [tab, setTab] = React.useState<TabKey>("residences");

  // Tuiles de stats (affichees seulement si l'admin a active la section).
  const communityTiles = community
    ? [
        { value: community.visits, icon: Eye, label: "Visites" },
        { value: community.travelers, icon: Users, label: "Voyageurs" },
        { value: community.owners, icon: KeyRound, label: "Propriétaires" },
        { value: community.guides, icon: Compass, label: "Guides" },
        { value: community.partners, icon: Handshake, label: "Partenaires" },
        { value: stats.residences, icon: BedDouble, label: "Locations" },
      ]
    : [];

  return (
    <div className="md:hidden">
      {/* Recherche collante facon application */}
      <div className="sticky top-[var(--header-h)] z-20 border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur-lg">
        <HeroSearch destinations={destinations.map((d) => ({ name: d.name, slug: d.slug }))} variant="compact" pill />
      </div>

      {/* Onglets categories (bascule de contenu sur place) */}
      <div className="flex border-b border-border px-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11.5px] font-semibold transition-colors",
                active ? "text-foreground" : "text-muted"
              )}
            >
              <motion.span
                className="relative inline-flex"
                whileTap={{ scale: 0.7 }}
                animate={active ? { scale: [1, 1.25, 0.95, 1] } : { scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <t.icon className={cn("h-[26px] w-[26px]", t.color)} strokeWidth={1.7} />
                {t.badge && (
                  <span className="absolute -right-5 -top-1.5 rounded-md bg-brand-600 px-1 py-px text-[8px] font-bold uppercase tracking-wide text-white shadow-soft">
                    {t.badge}
                  </span>
                )}
              </motion.span>
              <span className="whitespace-nowrap">{t.label}</span>
              {active && <motion.span layoutId="mh-tab-underline" className="absolute inset-x-3 -bottom-px h-[2.5px] rounded-full bg-foreground" />}
            </button>
          );
        })}
      </div>

      {/* ===== Onglet RESIDENCES ===== */}
      {tab === "residences" && (
        <div>
          {residences.length > 0 && (
            <section className="pt-5">
              <SectionHead title="Locations meublées populaires" subtitle="Les mieux notées, vérifiées KoraStay" href="/residences" />
              <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
                {residences.map((r, i) => (
                  <div key={r.id} className="w-[52vw] max-w-[195px] shrink-0 snap-start">
                    <MobileResidenceCard residence={r} favorited={favorites.residences.has(r.id)} priority={i < 2} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {destinations.length > 0 && (
            <section className="pt-7">
              <SectionHead title="Destinations" subtitle="Ou KoraStay vous accueille" href="/destinations" />
              <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
                {destinations.map((d) => (
                  <div key={d.slug} className="w-28 shrink-0 snap-start">
                    <DestinationCard destination={d} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {packs.length > 0 && (
            <section className="pt-7">
              <SectionHead title="Packs Découverte" subtitle="Séjours clé en main, guide inclus" href="/packs" />
              <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
                {packs.slice(0, 6).map((p) => (
                  <div key={p.id} className="w-[46vw] max-w-[170px] shrink-0 snap-start">
                    <MobilePackCard pack={p} favorited={favorites.packs.has(p.id)} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Confiance */}
          <section className="px-5 pt-8">
            <div className="rounded-3xl border border-border bg-surface p-4 shadow-soft">
              <h2 className="mb-3 text-[16px] font-bold text-foreground">Voyagez l&apos;esprit tranquille</h2>
              <div className="space-y-3">
                {TRUST.map((t) => (
                  <div key={t.title} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <t.icon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-foreground">{t.title}</p>
                      <p className="text-[12px] text-muted">{t.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA proprietaire */}
          <section className="px-5 pt-7">
            <Link href="/devenir-proprietaire" className="relative flex items-center justify-between gap-3 overflow-hidden rounded-3xl border border-border bg-brand-50 p-4 active:scale-[0.99]">
              <div className="min-w-0">
                <HomeIcon className="h-6 w-6 text-brand-600" />
                <h3 className="mt-2 font-display text-[16px] font-semibold text-brand-900">Vous etes propriétaire ?</h3>
                <p className="text-[12px] text-brand-800/80">Publiez votre résidence et recevez des réservations.</p>
              </div>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-brand-600" />
            </Link>
          </section>

          {/* Temoignages */}
          {reviews.length > 0 && (
            <section className="pt-8">
              <SectionHead title="Ils ont voyage avec KoraStay" />
              <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
                {reviews.map((r) => (
                  <div key={r.id} className="w-[76vw] max-w-[290px] shrink-0 snap-start rounded-3xl border border-border bg-surface p-4 shadow-soft">
                    <Quote className="h-5 w-5 text-brand-200" />
                    <p className="mt-2 line-clamp-4 text-[13px] leading-relaxed text-foreground">{r.comment}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Avatar className="h-8 w-8"><AvatarFallback className="text-2xs">{initials(r.author.firstName, r.author.lastName)}</AvatarFallback></Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-bold text-foreground">{r.author.firstName} {r.author.lastName}</p>
                        <p className="flex items-center gap-1 text-[11px] text-muted">
                          <Star className="h-3 w-3 fill-gold-500 text-gold-500" /> {r.rating}/5{r.residence ? ` · ${r.residence.city}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* KoraStay en chiffres (masquable par l'admin) + FAQ */}
          <section className="px-5 pb-4 pt-8">
            {community && (
              <>
                <h2 className="mb-3 px-1 text-[16px] font-bold text-foreground">KoraStay en chiffres</h2>
                <div className="mb-4 grid grid-cols-3 gap-2.5 text-center">
                  {communityTiles.map((s) => (
                    <div key={s.label} className="rounded-2xl border border-border bg-surface py-3">
                      <s.icon className="mx-auto h-4 w-4 text-brand-600" />
                      <CountUp
                        value={s.value}
                        className="mt-1 block font-display text-lg font-semibold tabular-nums text-foreground"
                      />
                      <p className="text-[10.5px] leading-tight text-muted">{s.label}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            <Link href="/faq" className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-[14px] font-semibold text-foreground active:bg-surface-soft">
              Questions frequentes
              <ArrowRight className="h-4 w-4 text-muted" />
            </Link>
          </section>
        </div>
      )}

      {/* ===== Onglet PACKS ===== */}
      {tab === "packs" && (
        <section className="px-5 pb-4 pt-5">
          <div className="mb-3">
            <h2 className="text-[19px] font-bold tracking-tight text-foreground">Packs Découverte</h2>
            <p className="text-[13px] text-muted">Séjours clé en main : hébergement, transport et guide local.</p>
          </div>
          {packs.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">Aucun pack disponible pour le moment.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {packs.map((p) => (
                <MobilePackCard key={p.id} pack={p} favorited={favorites.packs.has(p.id)} />
              ))}
            </div>
          )}
          <Link href="/packs" className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-[14px] font-semibold text-foreground active:bg-surface-soft">
            Voir tous les packs
            <ArrowRight className="h-4 w-4 text-muted" />
          </Link>
        </section>
      )}

      {/* ===== Onglet ACTIVITES ===== */}
      {tab === "activites" && (
        <section className="px-5 pb-4 pt-5">
          <div className="mb-3">
            <h2 className="text-[19px] font-bold tracking-tight text-foreground">Activités &amp; expériences</h2>
            <p className="text-[13px] text-muted">Excursions, visites et sorties nature, avec guide certifié.</p>
          </div>
          {activities.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">Aucune activité disponible pour le moment.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {activities.map((a) => (
                <Link
                  key={a.id}
                  href={`/activites/${a.slug}`}
                  className="group block overflow-hidden rounded-3xl border border-border bg-surface shadow-soft active:scale-[0.99]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <SmartImage src={a.images[0]?.url} alt={a.name} seed={`act-${a.slug}`} />
                    <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-ink shadow-soft">
                      {activityCategoryMeta[a.category]?.label ?? a.category}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-1 text-[13.5px] font-bold text-foreground">{a.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-muted"><MapPin className="h-3 w-3" /> {a.city}</p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.durationHours}h</span>
                      {a.ratingCount > 0 && (
                        <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-gold-500 text-gold-500" /> {a.ratingAverage.toFixed(1)}</span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[13.5px]">
                      <span className="font-extrabold text-foreground">{formatPrice(a.pricePerPerson)}</span>
                      <span className="text-muted"> / pers.</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Link href="/activites" className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-[14px] font-semibold text-foreground active:bg-surface-soft">
            Voir toutes les activités
            <ArrowRight className="h-4 w-4 text-muted" />
          </Link>
        </section>
      )}
    </div>
  );
}
