import Link from "next/link";
import { Sparkles, Wand2, ArrowRight } from "lucide-react";
import { getPacks, getAllDestinations } from "@/lib/queries";
import { getUserFavoriteIds } from "@/server/actions/favorites";
import { PackCard } from "@/components/public/pack-card";
import { MobilePackCard } from "@/components/public/mobile/mobile-cards";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Packs Découverte",
  description: "Des séjours touristiques accompagnes clE en main : hébergement, transport et guide local certifie KoraStay.",
};

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function PacksPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const destination = str(sp.destination);

  const [packs, destinations, favorites] = await Promise.all([
    getPacks({ destination }),
    getAllDestinations(),
    getUserFavoriteIds(),
  ]);

  const destWithPacks = destinations.filter((d) => d._count.packs > 0);

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero">
        <div className="container-page py-9 text-center md:py-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-200 bg-gold-50 px-3 py-1 text-sm font-semibold text-gold-700">
            <Sparkles className="h-3.5 w-3.5" /> KoraStay Découverte
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Des séjours clE en main, sans rien organiser
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted md:text-base">
            Hébergement vérifié, transport en ville et guide local certifie : il ne vous reste qu'a profiter.
          </p>
        </div>
      </section>

      <div className="container-page py-10">
        {/* Filtres destination */}
        <div className="no-scrollbar mb-7 flex gap-2 overflow-x-auto pb-1">
          <Link href="/packs" className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors", !destination ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border")}>
            Toutes les destinations
          </Link>
          {destWithPacks.map((d) => (
            <Link key={d.slug} href={`/packs?destination=${d.slug}`} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors", destination === d.slug ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border")}>
              {d.name}
            </Link>
          ))}
        </div>

        {/* Grille packs - mobile (compact 2 colonnes) */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-3">
            {packs.map((p) => (
              <MobilePackCard key={p.id} pack={p} favorited={favorites.packs.has(p.id)} />
            ))}
          </div>
          <Link href="/packs/custom" className="mt-4 flex items-center gap-3 rounded-3xl border-2 border-dashed border-brand-300 bg-brand-50/40 p-4 active:scale-[0.99]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white">
              <Wand2 className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-bold text-brand-900">Pack personnalisé</h3>
              <p className="text-[12px] text-brand-800/80">Composez votre séjour sur mesure.</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-brand-600" />
          </Link>
        </div>

        {/* Grille packs - desktop (inchangee) */}
        <div className="hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-3">
          {packs.map((p) => (
            <PackCard key={p.id} pack={p} favorited={favorites.packs.has(p.id)} />
          ))}

          {/* Carte pack personnalise */}
          <Link href="/packs/custom" className="group flex flex-col items-start justify-between rounded-3xl border-2 border-dashed border-brand-300 bg-brand-50/40 p-6 transition-colors hover:bg-brand-50">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white">
              <Wand2 className="h-6 w-6" />
            </span>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-brand-900">Pack personnalisé</h3>
              <p className="mt-1 text-sm text-brand-800/80">
                Composez votre séjour sur mesure : destination, activités, options. Nous nous occupons du reste.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
              Composer mon pack <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
