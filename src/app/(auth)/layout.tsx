import Link from "next/link";
import { ShieldCheck, Star, MapPinned, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Motif, MotifBand, Ornament } from "@/components/brand/motif";
import { I18nProvider } from "@/components/i18n/provider";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";

const TRUST_ICONS = [ShieldCheck, Star, MapPinned];

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { locale, dict } = await getI18n();
  const p = dict.auth.panel;

  return (
    <I18nProvider dict={dict}>
      <div className="flex min-h-dvh">
        {/* Panneau de marque (desktop) */}
        <aside className="grain relative hidden w-[46%] flex-col justify-between overflow-hidden bg-ink-800 text-white lg:flex">
          <Motif variant="bogolan" fade="bottom" className="text-white/[0.05]" />
          <div aria-hidden="true" className="absolute -right-32 top-1/4 h-[26rem] w-[26rem] rounded-full bg-terracotta/25 blur-3xl" />
          <div aria-hidden="true" className="absolute -left-24 bottom-16 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />

          <div className="relative p-12">
            <Logo variant="light" />
          </div>

          <div className="relative px-12">
            <p className="eyebrow flex items-center gap-3 text-gold-300">
              <Ornament side="left" />
              {p.eyebrow}
            </p>
            <h1 className="mt-5 text-balance font-display text-[3rem] font-normal leading-[1.04] tracking-[-0.02em] xl:text-[3.5rem]">
              {p.title} <em className="italic text-gold-300">{p.accent}</em>
            </h1>
            <p className="mt-5 max-w-md text-[16.5px] leading-relaxed text-white/70">{p.text}</p>
            <ul className="mt-10 space-y-4">
              {p.trust.map((text, i) => {
                const TrustIcon = TRUST_ICONS[i] ?? ShieldCheck;
                return (
                  <li key={text} className="flex items-center gap-4 text-white/90">
                    <span className="flex h-11 w-10 items-center justify-center rounded-arch-sm border border-gold-300/30 bg-white/5 text-gold-300">
                      <TrustIcon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                    {text}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="relative">
            <p className="px-12 pb-6 text-sm text-white/45">&copy; {new Date().getFullYear()} KoraStay</p>
            <MotifBand className="text-terracotta" />
          </div>
        </aside>

        {/* Formulaire */}
        <main className="relative flex w-full flex-col lg:w-[54%]">
          <Motif variant="dots" fade="radial" className="text-sand-500/20" />
          <div className="relative flex items-center justify-between p-6 lg:justify-end lg:px-10">
            <div className="lg:hidden">
              <Logo />
            </div>
            <Link href={localePath("/", locale)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> {p.back}
            </Link>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-6 pb-14 pt-4">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </main>
      </div>
    </I18nProvider>
  );
}
