import Link from "next/link";
import { Wand2, ArrowRight } from "lucide-react";
import { getPacks, getAllDestinations } from "@/lib/queries";
import { getUserFavoriteIds } from "@/server/actions/favorites";
import { PackCard } from "@/components/public/pack-card";
import { MobilePackCard } from "@/components/public/mobile/mobile-cards";
import { PageHero } from "@/components/public/page-hero";
import { Motif } from "@/components/brand/motif";
import { cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { alternatesFor } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: dict.packs.metaTitle,
    description: dict.packs.metaDescription,
    alternates: alternatesFor("/packs"),
  };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const chip = (active: boolean) =>
  cn(
    "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
    active ? "border-ink bg-ink text-white" : "border-ink/15 bg-white/60 text-foreground hover:border-ink/40"
  );

export default async function PacksPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const destination = str(sp.destination);

  const [packs, destinations, favorites, { locale, dict }] = await Promise.all([
    getPacks({ destination }),
    getAllDestinations(),
    getUserFavoriteIds(),
    getI18n(),
  ]);

  const destWithPacks = destinations.filter((d) => d._count.packs > 0);

  return (
    <>
      <PageHero
        eyebrow={dict.home.experiences.eyebrow}
        title={dict.packs.heroTitle}
        accent={dict.packs.heroAccent}
        description={dict.packs.heroSubtitle}
      >
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
          <Link href={localePath("/packs", locale)} className={chip(!destination)}>
            {dict.packs.allDestinations}
          </Link>
          {destWithPacks.map((d) => (
            <Link key={d.slug} href={localePath(`/packs?destination=${d.slug}`, locale)} className={chip(destination === d.slug)}>
              {d.name}
            </Link>
          ))}
        </div>
      </PageHero>

      <div className="container-page py-10 md:py-14">
        {/* Mobile : grille compacte 2 colonnes */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-3">
            {packs.map((p) => (
              <MobilePackCard key={p.id} pack={p} favorited={favorites.packs.has(p.id)} />
            ))}
          </div>
          <Link
            href={localePath("/packs/custom", locale)}
            className="relative mt-5 flex items-center gap-4 overflow-hidden rounded-[1.25rem] bg-gold-500 p-5 text-ink-900 active:scale-[0.99]"
          >
            <Motif variant="bogolan" className="text-ink-900/[0.08]" />
            <span className="relative flex h-12 w-11 shrink-0 items-center justify-center rounded-arch-sm bg-ink-900 text-gold-300">
              <Wand2 className="h-5 w-5" />
            </span>
            <div className="relative min-w-0 flex-1">
              <h3 className="font-display text-lg">{dict.packs.customTitle}</h3>
              <p className="text-[13px] text-ink-900/75">{dict.packs.customTextShort}</p>
            </div>
            <ArrowRight className="relative h-5 w-5 shrink-0" />
          </Link>
        </div>

        {/* Desktop */}
        <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
          {packs.map((p) => (
            <PackCard key={p.id} pack={p} favorited={favorites.packs.has(p.id)} />
          ))}

          {/* Carte pack sur mesure */}
          <Link
            href={localePath("/packs/custom", locale)}
            className="grain group relative flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-[1.75rem] bg-gold-500 p-8 text-ink-900 transition-shadow hover:shadow-card-hover"
          >
            <Motif variant="bogolan" fade="bottom" className="text-ink-900/[0.09]" />
            <span className="relative flex h-16 w-14 items-center justify-center rounded-arch-sm bg-ink-900 text-gold-300">
              <Wand2 className="h-6 w-6" strokeWidth={1.6} />
            </span>
            <div className="relative">
              <h3 className="font-display text-[2rem] leading-[1.1]">{dict.packs.customTitle}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-900/75">{dict.packs.customTextLong}</p>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
                {dict.residenceDetail.composePack}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
