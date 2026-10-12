import Link from "next/link";
import { Handshake, Compass, Car, UtensilsCrossed, Camera, TrendingUp, ShieldCheck, Wallet, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { becomePartnerAction } from "@/server/actions/auth";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";
import { Motif, Ornament } from "@/components/brand/motif";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { alternatesFor } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.pages.partners.metaTitle, description: dict.pages.partners.metaDescription, alternates: alternatesFor("/partners") };
}

const TYPE_ICONS = [Compass, Car, UtensilsCrossed, Camera];
const BENEFIT_ICONS = [TrendingUp, Wallet, ShieldCheck];

export default async function PartnersPage() {
  const [user, { locale, dict }] = await Promise.all([getCurrentUser(), getI18n()]);
  const t = dict.pages.partners;
  const isPartner = user?.role === "PARTNER";
  const isStaff = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <>
      <section className="grain relative overflow-hidden border-b border-border/70">
        <Motif variant="bogolan" fade="bottom" className="text-sand-500/[0.14]" />
        <div className="container-page relative py-14 text-center md:py-20">
          <p className="eyebrow flex items-center justify-center gap-3 text-terracotta">
            <Ornament side="left" />
            {t.eyebrow}
            <Ornament side="right" />
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance font-display text-[2.6rem] font-normal leading-[1.04] tracking-[-0.02em] text-foreground md:text-display-md lg:text-display-lg">
            {t.title} <em className="italic text-terracotta">{t.accent}</em>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16.5px] leading-relaxed text-muted">{t.subtitle}</p>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {t.types.map((label, i) => {
              const TypeIcon = TYPE_ICONS[i] ?? Handshake;
              return (
                <div key={label} className="flex flex-col items-center rounded-[1.25rem] bg-surface px-3 py-5 shadow-soft">
                  <span className="flex h-12 w-11 items-center justify-center rounded-arch-sm bg-terracotta text-white">
                    <TypeIcon className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-foreground">{label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-[2rem] font-normal text-foreground">{t.benefitsTitle}</h2>
            <div className="mt-7 space-y-5">
              {t.benefits.map((b, i) => {
                const BenefitIcon = BENEFIT_ICONS[i] ?? TrendingUp;
                return (
                  <div key={b.title} className="flex gap-4">
                    <span className="flex h-12 w-11 shrink-0 items-center justify-center rounded-arch-sm bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-200/60">
                      <BenefitIcon className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                    <div>
                      <h3 className="font-display text-lg text-foreground">{b.title}</h3>
                      <p className="text-[15px] leading-relaxed text-muted">{b.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <h2 className="mb-5 mt-12 font-display text-[1.75rem] font-normal text-foreground">{t.faqTitle}</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {t.faq.map((item, i) => (
                <AccordionItem key={i} value={`p-${i}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface p-7 pt-9 shadow-card sm:p-9 sm:pt-11 lg:self-start">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 overflow-hidden">
              <div className="motif motif-kente text-terracotta/70" />
            </div>
            {!user ? (
              // Visiteur sans compte : la candidature EST la creation du compte partenaire.
              <RegisterForm defaultType="PARTNER" lockType title={t.formTitle} subtitle={t.formSubtitle} />
            ) : isPartner ? (
              <div className="py-4 text-center">
                <span className="mx-auto flex h-16 w-14 items-center justify-center rounded-arch-sm bg-brand-50 text-brand-600">
                  <Handshake className="h-6 w-6" />
                </span>
                <h2 className="mt-5 font-display text-2xl text-foreground">{t.spaceTitle}</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{t.spaceText}</p>
                <Button asChild size="lg" className="mt-6">
                  <Link href={localePath("/partner", locale)}>{t.spaceCta} <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            ) : isStaff ? (
              <div className="py-4 text-center">
                <h2 className="font-display text-2xl text-foreground">{t.staffTitle}</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{t.staffText}</p>
                <Button asChild size="lg" className="mt-6">
                  <Link href={localePath("/admin/partners", locale)}>{t.staffCta} <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            ) : (
              <div className="py-2">
                <h2 className="font-display text-2xl text-foreground">{t.activateTitle}</h2>
                <p className="mb-6 mt-2 text-sm leading-relaxed text-muted">{t.activateText.replace("{name}", user.firstName)}</p>
                <form action={becomePartnerAction} className="space-y-4">
                  <div>
                    <label htmlFor="partnerType" className="mb-1.5 block text-sm font-semibold text-foreground">{t.typeLabel}</label>
                    <select
                      id="partnerType"
                      name="partnerType"
                      required
                      defaultValue=""
                      className="h-12 w-full rounded-xl border border-ink/15 bg-white px-4 text-[15px] text-foreground transition-colors hover:border-ink/30 focus-visible:border-terracotta focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-terracotta/10"
                    >
                      <option value="" disabled>{t.typePlaceholder}</option>
                      {t.options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    {t.activateCta} <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
