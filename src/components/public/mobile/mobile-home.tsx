import * as React from "react";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Home as HomeIcon, Compass, Briefcase,
  ShieldCheck, Smartphone, Headset, Star, Quote,
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

const TABS = [
  { label: "Residences", href: "/residences", icon: HomeIcon },
  { label: "Packs", href: "/packs", icon: Compass, badge: "Populaire" },
  { label: "Business", href: "/business", icon: Briefcase },
];

const TRUST = [
  { icon: ShieldCheck, title: "Residences verifiees", text: "Controlees par KoraStay." },
  { icon: Smartphone, title: "Paiement mobile", text: "Orange Money, Wave, carte." },
  { icon: Headset, title: "Assistance locale", text: "Avant, pendant, apres." },
];

function SectionHead({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3 px-5">
      <div className="min-w-0">
        <h2 className="text-[20px] font-bold leading-tight tracking-tight text-foreground">{title}</h2>
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
  return (
    <div className="md:hidden">
      {/* Recherche collante facon application */}
      <div className="sticky top-[var(--header-h)] z-20 border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur-lg">
        <HeroSearch destinations={destinations.map((d) => ({ name: d.name, slug: d.slug }))} variant="compact" pill />
      </div>

      {/* Onglets categories facon application */}
      <div className="flex border-b border-border px-2">
        {TABS.map((t, i) => {
          const active = i === 0;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11.5px] font-semibold transition-colors",
                active ? "text-foreground" : "text-muted active:text-foreground"
              )}
            >
              <span className="relative">
                <t.icon className={cn("h-[26px] w-[26px]", active ? "text-brand-600" : "text-muted")} strokeWidth={1.6} />
                {t.badge && (
                  <span className="absolute -right-5 -top-1.5 rounded-md bg-brand-600 px-1 py-px text-[8px] font-bold uppercase tracking-wide text-white shadow-soft">
                    {t.badge}
                  </span>
                )}
              </span>
              <span className="whitespace-nowrap">{t.label}</span>
              {active && <span className="absolute inset-x-3 -bottom-px h-[2.5px] rounded-full bg-foreground" />}
            </Link>
          );
        })}
      </div>

      {/* Residences populaires */}
      {residences.length > 0 && (
        <section className="pt-5">
          <SectionHead title="Residences populaires" subtitle="Les mieux notees, verifiees KoraStay" href="/residences" />
          <div className="no-scrollbar -mx-0 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
            {residences.map((r, i) => (
              <div key={r.id} className="w-[64vw] max-w-[255px] shrink-0 snap-start">
                <MobileResidenceCard residence={r} favorited={favorites.residences.has(r.id)} priority={i < 2} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Destinations */}
      {destinations.length > 0 && (
        <section className="pt-7">
          <SectionHead title="Destinations" subtitle="Ou KoraStay vous accueille" href="/destinations" />
          <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
            {destinations.map((d) => (
              <div key={d.slug} className="w-32 shrink-0 snap-start">
                <DestinationCard destination={d} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Packs */}
      {packs.length > 0 && (
        <section className="pt-7">
          <SectionHead title="Packs Decouverte" subtitle="Sejours cle en main, guide inclus" href="/packs" />
          <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
            {packs.slice(0, 6).map((p) => (
              <div key={p.id} className="w-[56vw] max-w-[215px] shrink-0 snap-start">
                <MobilePackCard pack={p} favorited={favorites.packs.has(p.id)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Confiance */}
      <section className="px-5 pt-8">
        <div className="rounded-3xl border border-border bg-surface p-4 shadow-soft">
          <h2 className="mb-3 font-display text-[17px] font-semibold text-foreground">Voyagez l&apos;esprit tranquille</h2>
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

      {/* CTA business + proprietaire */}
      <section className="space-y-3 px-5 pt-7">
        <Link href="/business" className="relative flex items-center justify-between gap-3 overflow-hidden rounded-3xl bg-ink p-4 text-white active:scale-[0.99]">
          <div className="gradient-hero absolute inset-0 opacity-40" />
          <div className="relative min-w-0">
            <Briefcase className="h-6 w-6 text-gold-400" />
            <h3 className="mt-2 font-display text-[16px] font-semibold">KoraStay Business</h3>
            <p className="text-[12px] text-white/80">Hebergements fiables et facturables pour vos equipes.</p>
          </div>
          <ArrowUpRight className="relative h-5 w-5 shrink-0 text-white/80" />
        </Link>
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
              <div key={r.id} className="w-[78vw] max-w-[300px] shrink-0 snap-start rounded-3xl border border-border bg-surface p-4 shadow-soft">
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

      {/* Liens utiles */}
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
  );
}
