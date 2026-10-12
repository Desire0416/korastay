import Link from "next/link";
import { Heart, Compass, Award, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/public/page-hero";
import { SectionHeading } from "@/components/public/section-heading";
import { Motif } from "@/components/brand/motif";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { alternatesFor } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.pages.about.metaTitle, description: dict.pages.about.metaDescription, alternates: alternatesFor("/about") };
}

const VALUE_ICONS = [Award, Compass, Sparkles, Heart];

export default async function AboutPage() {
  const { locale, dict } = await getI18n();
  const t = dict.pages.about;

  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} accent={t.accent} description={t.subtitle} />

      <section className="container-page py-16 md:py-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-border bg-surface p-9 shadow-soft lg:p-11">
            <p className="eyebrow text-terracotta">{t.missionTitle}</p>
            <p className="mt-5 font-display text-[1.45rem] leading-relaxed text-foreground">{t.missionText}</p>
          </div>
          <div className="grain relative overflow-hidden rounded-[2rem] bg-ink-800 p-9 text-white lg:p-11">
            <Motif variant="kente" fade="bottom" className="text-white/[0.06]" />
            <p className="eyebrow relative text-gold-300">{t.visionTitle}</p>
            <p className="relative mt-5 font-display text-[1.45rem] leading-relaxed">{t.visionText}</p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-sand-100 py-20 md:py-24">
        <Motif variant="bogolan" fade="x" className="text-sand-500/20" />
        <div className="container-page relative">
          <SectionHeading align="center" eyebrow={t.valuesEyebrow} title={t.valuesTitle} accent={t.valuesAccent} />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.values.map((v, i) => {
              const ValueIcon = VALUE_ICONS[i] ?? Award;
              return (
                <div key={v.title} className="rounded-[1.75rem] bg-surface p-7 shadow-soft">
                  <span className="flex h-14 w-12 items-center justify-center rounded-arch-sm bg-terracotta text-white">
                    <ValueIcon className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <h3 className="mt-5 font-display text-xl text-foreground">{v.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{v.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-20 md:py-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-500 px-8 py-14 text-center text-white">
          <Motif variant="bogolan" fade="bottom" className="text-white/[0.08]" />
          <h2 className="relative font-display text-[2.2rem] leading-tight md:text-5xl">
            {t.joinTitle} <em className="italic text-gold-300">{t.joinAccent}</em>
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-white/80">{t.joinText}</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="white" size="lg">
              <Link href={localePath("/residences", locale)}>{t.joinExplore} <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link href={localePath("/devenir-proprietaire", locale)}>{t.joinHost}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
