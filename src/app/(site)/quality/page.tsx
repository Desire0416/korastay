import { ShieldCheck, Star, BadgeCheck, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { SectionHeading } from "@/components/public/section-heading";
import { Motif } from "@/components/brand/motif";
import { cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { alternatesFor } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.pages.quality.metaTitle, description: dict.pages.quality.metaDescription, alternates: alternatesFor("/quality") };
}

const LEVEL_STARS = [2, 3, 4];
const LEVEL_STYLE = [
  "border-border bg-surface",
  "border-brand-200 bg-brand-50/60",
  "border-gold-300 bg-gold-50/70",
];

export default async function QualityPage() {
  const { dict } = await getI18n();
  const t = dict.pages.quality;

  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} accent={t.accent} description={t.subtitle} />

      {/* Processus */}
      <section className="container-page py-16 md:py-24">
        <SectionHeading align="center" eyebrow={t.eyebrow} title={t.processTitle} />
        <ol className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div aria-hidden="true" className="absolute left-[12%] right-[12%] top-11 hidden h-3.5 lg:block">
            <div className="motif motif-chevron text-terracotta/35" />
          </div>
          {t.process.map((p, i) => (
            <li key={p.title} className="relative flex flex-col items-center text-center">
              <span className="flex h-[5.5rem] w-[4.75rem] items-center justify-center rounded-arch-sm border border-terracotta/30 bg-background font-display text-4xl italic text-terracotta">
                0{i + 1}
              </span>
              <h3 className="mt-5 font-display text-xl text-foreground">{p.title}</h3>
              <p className="mt-2 max-w-[16rem] text-[15px] leading-relaxed text-muted">{p.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Niveaux */}
      <section className="relative overflow-hidden bg-sand-100 py-20 md:py-24">
        <Motif variant="bogolan" fade="x" className="text-sand-500/20" />
        <div className="container-page relative">
          <SectionHeading align="center" title={t.levelsTitle} />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {t.levels.map((l, i) => (
              <div key={l.title} className={cn("rounded-[1.75rem] border p-7", LEVEL_STYLE[i])}>
                <div className="flex items-center gap-1">
                  {Array.from({ length: LEVEL_STARS[i] ?? 2 }).map((_, k) => (
                    <Star key={k} className="h-5 w-5 fill-gold-500 text-gold-500" />
                  ))}
                </div>
                <h3 className="mt-4 font-display text-2xl text-foreground">{l.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{l.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipements + badge */}
      <section className="container-page py-20 md:py-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-[2rem] font-normal leading-tight text-foreground">{t.equipmentTitle}</h2>
            <ul className="mt-7 grid grid-cols-1 gap-2.5">
              {t.equipment.map((e) => (
                <li key={e} className="flex items-start gap-3 rounded-xl bg-surface px-4 py-3 text-[15px] text-foreground/90 ring-1 ring-inset ring-border">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" /> {e}
                </li>
              ))}
            </ul>
          </div>
          <div className="grain relative overflow-hidden rounded-[2rem] bg-brand-500 p-10 text-white">
            <Motif variant="bogolan" fade="bottom" className="text-white/[0.08]" />
            <span className="relative flex h-16 w-14 items-center justify-center rounded-arch-sm bg-white/15">
              <BadgeCheck className="h-7 w-7 text-gold-300" />
            </span>
            <h3 className="relative mt-6 font-display text-[1.9rem] leading-tight">{t.badgeTitle}</h3>
            <p className="relative mt-3 leading-relaxed text-white/80">{t.badgeText}</p>
            <ShieldCheck aria-hidden="true" className="absolute -bottom-10 -right-10 h-56 w-56 text-white/[0.06]" strokeWidth={1} />
          </div>
        </div>
      </section>
    </>
  );
}
