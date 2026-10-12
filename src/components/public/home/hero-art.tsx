import Link from "next/link";
import { Star } from "lucide-react";
import { ArchImage } from "@/components/brand/arch-image";
import { Motif } from "@/components/brand/motif";
import { SmartImage } from "@/components/ui/smart-image";
import { formatPrice } from "@/lib/utils";

interface HeroArtProps {
  main: { src?: string | null; alt: string; seed: string };
  secondary: { src?: string | null; alt: string; seed: string };
  featured?: {
    href: string;
    name: string;
    city: string;
    image?: string | null;
    rating: number;
    ratingCount: number;
    price: number;
  } | null;
  circleText: string;
  floatingLabel: string;
  perNight: string;
}

// Composition du hero v2 : deux arches photo superposees, disque soleil,
// badge circulaire tournant et carte d'un logement mis en avant.
// Les images viennent de la base (destinations / logements), pas d'asset fixe.
export function HeroArt({ main, secondary, featured, circleText, floatingLabel, perNight }: HeroArtProps) {
  return (
    <div className="relative mx-auto aspect-[9/10] w-full max-w-[560px]">
      {/* Disque soleil + trame derriere l'arche principale */}
      <div aria-hidden="true" className="absolute right-[4%] top-[2%] h-[38%] w-[38%] rounded-full bg-gold-400/90" />
      <div aria-hidden="true" className="mask-radial absolute -left-[6%] top-[18%] h-[60%] w-[60%]">
        <div className="motif motif-dots text-terracotta/40" />
      </div>

      <ArchImage
        src={main.src}
        alt={main.alt}
        seed={main.seed}
        priority
        outline
        sizes="(max-width: 1024px) 70vw, 380px"
        className="absolute right-[6%] top-[8%] h-[80%] w-[62%] shadow-card-hover"
      />

      <div className="absolute bottom-[4%] left-[2%] h-[50%] w-[38%] rounded-arch-sm shadow-card-hover ring-[10px] ring-background">
        <ArchImage
          src={secondary.src}
          alt={secondary.alt}
          seed={secondary.seed}
          small
          sizes="(max-width: 1024px) 40vw, 220px"
          className="h-full w-full"
        />
      </div>

      {/* Badge circulaire */}
      <div className="absolute left-[24%] top-[4%] h-28 w-28 rounded-full bg-background p-1 shadow-card">
        <svg viewBox="0 0 100 100" aria-hidden="true" className="h-full w-full text-ink motion-safe:animate-[spin_28s_linear_infinite]">
          <defs>
            <path id="hero-circle" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
          </defs>
          <text className="fill-current text-[10.5px] font-bold uppercase tracking-[0.2em]">
            <textPath href="#hero-circle">{circleText}{circleText}</textPath>
          </text>
        </svg>
        <span className="absolute inset-0 m-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 shadow-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/icon.svg" alt="" className="h-7 w-7 brightness-0 invert" />
        </span>
      </div>

      {/* Carte logement flottante */}
      {featured && (
        <Link
          href={featured.href}
          className="group absolute bottom-[10%] right-0 flex w-[17rem] items-center gap-3 rounded-2xl border border-white/60 bg-white/95 p-2.5 pr-4 shadow-float backdrop-blur transition-transform duration-300 hover:-translate-y-1"
        >
          <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
            <SmartImage src={featured.image} alt={featured.name} seed={`hero-${featured.name}`} sizes="64px" />
          </span>
          <span className="min-w-0">
            <span className="eyebrow block text-[9.5px] text-terracotta">{floatingLabel}</span>
            <span className="mt-0.5 block truncate font-display text-[15px] leading-tight text-foreground">
              {featured.name}
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-xs text-muted">
              {featured.ratingCount > 0 && (
                <>
                  <Star className="h-3 w-3 fill-gold-500 text-gold-500" />
                  <span className="font-semibold text-foreground">{featured.rating.toFixed(1)}</span>
                  <span>·</span>
                </>
              )}
              <span className="truncate">
                <span className="font-semibold text-foreground">{formatPrice(featured.price)}</span> {perNight}
              </span>
            </span>
          </span>
        </Link>
      )}

      {/* Petite trame kente en coin */}
      <div aria-hidden="true" className="absolute bottom-[30%] right-[2%] h-16 w-16 overflow-hidden rounded-lg">
        <Motif variant="kente" className="text-terracotta/50" />
      </div>
    </div>
  );
}
