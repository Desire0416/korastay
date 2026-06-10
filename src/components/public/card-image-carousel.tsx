"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/ui/smart-image";

interface CardImageCarouselProps {
  images: { url: string; altText?: string | null }[];
  seedPrefix: string;
  aspectClass?: string;
  priority?: boolean;
}

export function CardImageCarousel({
  images,
  seedPrefix,
  aspectClass = "aspect-[4/3]",
  priority,
}: CardImageCarouselProps) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const list = images.length ? images : [{ url: "", altText: "" }];

  function scrollTo(index: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(index, list.length - 1));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    setActive(clamped);
  }

  function onScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== active) setActive(idx);
  }

  return (
    <div className={cn("group/carousel relative overflow-hidden rounded-3xl", aspectClass)}>
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="no-scrollbar snap-x-mandatory flex h-full w-full overflow-x-auto"
      >
        {list.map((img, i) => (
          <div key={i} className="snap-start-always relative h-full w-full flex-none">
            <SmartImage
              src={img.url}
              alt={img.altText ?? ""}
              seed={`${seedPrefix}-${i}`}
              priority={priority && i === 0}
              imgClassName="transition-transform duration-500 group-hover/carousel:scale-[1.03]"
            />
          </div>
        ))}
      </div>

      {list.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); scrollTo(active - 1); }}
            aria-label="Image precedente"
            className={cn(
              "absolute left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft transition-opacity md:flex",
              active === 0 ? "pointer-events-none opacity-0" : "opacity-0 group-hover/carousel:opacity-100"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); scrollTo(active + 1); }}
            aria-label="Image suivante"
            className={cn(
              "absolute right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft transition-opacity md:flex",
              active === list.length - 1 ? "pointer-events-none opacity-0" : "opacity-0 group-hover/carousel:opacity-100"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="pointer-events-none absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
            {list.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full bg-white transition-all duration-300",
                  i === active ? "w-4 opacity-100" : "w-1.5 opacity-60"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
