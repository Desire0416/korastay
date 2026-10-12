import Link from "next/link";
import { ArrowRight, Mail, Phone, ShieldCheck, Smartphone, Headset } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Motif, MotifBand, Ornament } from "@/components/brand/motif";
import { Button } from "@/components/ui/button";
import { FOOTER_NAV } from "@/lib/navigation";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants";
import { navLabel, footerColumnLabel, localePath } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n.server";

const REASSURANCE_ICONS = [ShieldCheck, Smartphone, Headset];

// Pied de page v2 : bloc indigo (teinture indigo ouest-africaine) avec trame
// bogolan, frise de triangles terracotta en lisiere et grand appel a l'action.
export async function PublicFooter() {
  const { locale, dict } = await getI18n();
  const f = dict.footer;

  return (
    <footer className="mt-24 text-white md:mt-32">
      <MotifBand className="text-terracotta" />
      <div className="grain relative overflow-hidden bg-ink-800">
        <Motif variant="bogolan" fade="bottom" className="text-white/[0.045]" />
        <div aria-hidden="true" className="absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-brand-500/20 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-48 -left-32 h-[26rem] w-[26rem] rounded-full bg-terracotta/15 blur-3xl" />

        <div className="container-page relative">
          {/* Appel a l'action */}
          <div className="flex flex-col gap-8 border-b border-white/10 py-16 md:py-20 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow mb-5 flex items-center gap-3 text-gold-300">
                <Ornament side="left" />
                {f.ctaEyebrow}
              </p>
              <p className="text-balance font-display text-[2.25rem] font-normal leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[3.5rem]">
                {f.ctaTitle} <em className="italic text-gold-300">{f.ctaAccent}</em>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="accent" size="lg">
                <Link href={localePath("/residences", locale)}>
                  {f.ctaExplore} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline-light" size="lg">
                <Link href={localePath("/devenir-proprietaire", locale)}>{f.ctaHost}</Link>
              </Button>
            </div>
          </div>

          {/* Reassurance */}
          <div className="grid grid-cols-1 gap-6 border-b border-white/10 py-10 sm:grid-cols-3">
            {f.reassurance.map((item, i) => {
              const ItemIcon = REASSURANCE_ICONS[i] ?? ShieldCheck;
              return (
                <div key={item.title} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-arch-sm border border-gold-300/30 bg-white/5 text-gold-300">
                    <ItemIcon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-white/60">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Colonnes */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-14 md:grid-cols-6">
            <div className="col-span-2">
              <Logo variant="light" href={null} />
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">{f.tagline}</p>
              <div className="mt-6 space-y-2.5 text-sm">
                <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2.5 text-white/75 transition-colors hover:text-gold-300">
                  <Mail className="h-4 w-4" strokeWidth={1.6} /> {CONTACT_EMAIL}
                </a>
                <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="flex items-center gap-2.5 text-white/75 transition-colors hover:text-gold-300">
                  <Phone className="h-4 w-4" strokeWidth={1.6} /> {CONTACT_PHONE}
                </a>
              </div>
            </div>

            {FOOTER_NAV.map((col) => (
              <div key={col.title}>
                <h4 className="eyebrow text-gold-300/90">{footerColumnLabel(dict, col.title)}</h4>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={localePath(link.href, locale)}
                        className="text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {navLabel(dict, link.href, link.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-7 text-[13px] text-white/50 sm:flex-row">
            <p>&copy; {new Date().getFullYear()} KoraStay. {f.rights}</p>
            <p className="flex items-center gap-2">
              {f.madeInPrefix}
              <span className="inline-flex h-3 w-[18px] overflow-hidden rounded-[2px]" aria-hidden="true">
                <span className="flex-1 bg-[#FF8200]" />
                <span className="flex-1 bg-white" />
                <span className="flex-1 bg-[#009A44]" />
              </span>
              {f.madeIn}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
