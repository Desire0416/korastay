"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Home as HomeIcon, Compass, Briefcase,
  ShieldCheck, Smartphone, Headset, Star, Quote, Check, type LucideIcon,
} from "lucide-react";
import { HeroSearch } from "../hero-search";
import { DestinationCard } from "../destination-card";
import { MobileResidenceCard, MobilePackCard } from "./mobile-cards";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";
import type { ResidenceCardData } from "@/lib/queries";

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
  reviews: Review[];
  stats: { residences: number; destinations: number; packs: number };
  favorites: { residences: Set<string>; packs: Set<string> };
}

type TabKey = "residences" | "packs" | "business";
const TABS: { key: TabKey; label: string; icon: LucideIcon; color: string; badge?: string }[] = [
  { key: "residences", label: "Residences", icon: HomeIcon, color: "text-brand-600" },
  { key: "packs", label: "Packs", icon: Compass, color: "text-gold-600", badge: "Populaire" },
  { key: "business", label: "Business", icon: Briefcase, color: "text-info" },
];

const TRUST = [
  { icon: ShieldCheck, title: "Residences verifiees", text: "Controlees par KoraStay." },
  { icon: Smartphone, title: "Paiement mobile", text: "Orange Money, Wave, carte." },
  { icon: Headset, title: "Assistance locale", text: "Avant, pendant, apres." },
];

const BUSINESS_BENEFITS = [
  "Contrats cadres & facturation centralisee",
  "Assistance dediee 7j/7",
  "Rapports mensuels detailles",
  "Residences verifiees partout en Cote d'Ivoire",
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

export function MobileHome({ residences, destinations, packs, reviews, stats, favorites }: MobileHomeProps) {
  const [tab, setTab] = React.useState<TabKey>("residences");

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
              <SectionHead title="Residences populaires" subtitle="Les mieux notees, verifiees KoraStay" href="/residences" />
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
              <SectionHead title="Packs Decouverte" subtitle="Sejours cle en main, guide inclus" href="/packs" />
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
                <h3 className="mt-2 font-display text-[16px] font-semibold text-brand-900">Vous etes proprietaire ?</h3>
                <p className="text-[12px] text-brand-800/80">Publiez votre residence et recevez des reservations.</p>
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

          {/* Stats + FAQ */}
          <section className="px-5 pb-4 pt-8">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { v: `${stats.residences}+`, l: "Residences" },
                { v: stats.destinations, l: "Destinations" },
                { v: `${stats.packs}+`, l: "Packs" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border border-border bg-surface py-3">
                  <p className="font-display text-xl font-semibold text-foreground">{s.v}</p>
                  <p className="text-[11px] text-muted">{s.l}</p>
                </div>
              ))}
            </div>
            <Link href="/faq" className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-[14px] font-semibold text-foreground active:bg-surface-soft">
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
            <h2 className="text-[19px] font-bold tracking-tight text-foreground">Packs Decouverte</h2>
            <p className="text-[13px] text-muted">Sejours cle en main : hebergement, transport et guide local.</p>
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

      {/* ===== Onglet BUSINESS ===== */}
      {tab === "business" && (
        <section className="px-5 pb-4 pt-5">
          <div className="relative overflow-hidden rounded-3xl bg-ink p-5 text-white">
            <div className="gradient-hero absolute inset-0 opacity-40" />
            <div className="relative">
              <Briefcase className="h-7 w-7 text-gold-400" />
              <h2 className="mt-2 font-display text-xl font-semibold">KoraStay Business</h2>
              <p className="mt-1 text-[13px] text-white/85">Hebergements fiables et facturables pour vos equipes en mission.</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2.5">
            {BUSINESS_BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-[14px] text-foreground">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {b}
              </li>
            ))}
          </ul>
          <Link href="/business" className="mt-5 flex items-center justify-center gap-2 rounded-full bg-brand-500 py-3.5 font-semibold text-white active:scale-[0.99]">
            Demander un devis <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}
    </div>
  );
}
