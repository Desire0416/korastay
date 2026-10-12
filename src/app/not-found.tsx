import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Motif, MotifBand } from "@/components/brand/motif";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";

// 404 v2 : hors du layout (site), donc logo en <img> (le composant Logo
// depend du provider i18n client).
export default async function NotFound() {
  const { locale, dict } = await getI18n();
  const t = dict.pages.notFound;
  return (
    <div className="grain relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <Motif variant="bogolan" fade="radial" className="text-sand-500/25" />
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <Link href={localePath("/", locale)} aria-label="KoraStay">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.svg" alt="KoraStay" className="h-9 w-auto" />
        </Link>
        <div className="relative mt-12 flex h-48 w-40 items-center justify-center rounded-arch border border-terracotta/35">
          <span className="font-display text-7xl italic text-terracotta">404</span>
        </div>
        <h1 className="mt-10 font-display text-[2.2rem] font-normal leading-tight text-foreground">{t.title}</h1>
        <p className="mt-3 max-w-md leading-relaxed text-muted">{t.text}</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href={localePath("/", locale)}><Home className="h-4 w-4" /> {t.home}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={localePath("/residences", locale)}><Compass className="h-4 w-4" /> {t.explore}</Link>
          </Button>
        </div>
      </div>
      <MotifBand className="relative text-terracotta" />
    </div>
  );
}
