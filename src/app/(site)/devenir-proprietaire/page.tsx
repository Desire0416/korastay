import Link from "next/link";
import { Home, TrendingUp, ShieldCheck, Calendar, Wallet, BadgeCheck, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { becomeOwnerAction } from "@/server/actions/auth";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/public/section-heading";
import { Motif, Ornament } from "@/components/brand/motif";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { alternatesFor } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: dict.pages.owner.metaTitle,
    description: dict.pages.owner.metaDescription,
    alternates: alternatesFor("/devenir-proprietaire"),
  };
}

const BENEFIT_ICONS = [TrendingUp, Calendar, Wallet, ShieldCheck];

export default async function OwnerLandingPage() {
  const [user, { locale, dict }] = await Promise.all([getCurrentUser(), getI18n()]);
  const t = dict.pages.owner;
  const isOwner = user?.role === "OWNER" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <>
      <section className="grain relative overflow-hidden bg-terracotta text-white">
        <Motif variant="bogolan" fade="bottom" className="text-white/[0.08]" />
        <div className="container-page relative grid grid-cols-1 items-start gap-12 py-14 md:py-20 lg:grid-cols-[1fr_1fr]">
          <div className="lg:pt-8">
            <p className="eyebrow flex items-center gap-3 text-gold-200">
              <Ornament side="left" />
              {t.eyebrow}
            </p>
            <h1 className="mt-5 text-balance font-display text-[2.6rem] font-normal leading-[1.04] tracking-[-0.02em] md:text-display-md lg:text-display-lg">
              {t.title} <em className="italic text-gold-200">{t.accent}</em>
            </h1>
            <p className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-white/80">{t.subtitle}</p>
            <div className="mt-8 flex max-w-lg items-center gap-4 rounded-[1.25rem] bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur">
              <span className="flex h-12 w-11 shrink-0 items-center justify-center rounded-arch-sm bg-white text-brand-600">
                <BadgeCheck className="h-6 w-6" />
              </span>
              <p className="text-sm leading-relaxed text-white/90">{t.badge}</p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-surface p-7 text-foreground shadow-float sm:p-9">
            {!user ? (
              // Visiteur sans compte : la demande EST la creation du compte proprietaire.
              <RegisterForm defaultType="OWNER" lockType title={t.formTitle} subtitle={t.formSubtitle} />
            ) : isOwner ? (
              <div className="py-4 text-center">
                <span className="mx-auto flex h-16 w-14 items-center justify-center rounded-arch-sm bg-brand-50 text-brand-600">
                  <Home className="h-6 w-6" />
                </span>
                <h2 className="mt-5 font-display text-2xl">{t.readyTitle}</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{t.readyText}</p>
                <Button asChild size="lg" className="mt-6">
                  <Link href={localePath("/owner", locale)}>{t.readyCta} <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            ) : (
              <div className="py-2">
                <h2 className="font-display text-2xl">{t.activateTitle}</h2>
                <p className="mb-6 mt-2 text-sm leading-relaxed text-muted">{t.activateText.replace("{name}", user.firstName)}</p>
                <form action={becomeOwnerAction}>
                  <Button type="submit" size="lg" className="w-full">
                    {t.activateCta} <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
                <p className="mt-3 text-center text-xs text-muted">{t.activateNote}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-page py-20 md:py-24">
        <SectionHeading align="center" title={t.stepsTitle} accent={t.stepsAccent} />
        <ol className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div aria-hidden="true" className="absolute left-[12%] right-[12%] top-11 hidden h-3.5 lg:block">
            <div className="motif motif-chevron text-terracotta/35" />
          </div>
          {t.steps.map((s, i) => (
            <li key={s.title} className="relative flex flex-col items-center text-center">
              <span className="flex h-[5.5rem] w-[4.75rem] items-center justify-center rounded-arch-sm border border-terracotta/30 bg-background font-display text-4xl italic text-terracotta">
                0{i + 1}
              </span>
              <h3 className="mt-5 font-display text-xl text-foreground">{s.title}</h3>
              <p className="mt-2 max-w-[16rem] text-[15px] leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.benefits.map((b, i) => {
            const BenefitIcon = BENEFIT_ICONS[i] ?? TrendingUp;
            return (
              <div key={b.title} className="rounded-[1.75rem] bg-sand-100 p-7">
                <BenefitIcon className="h-6 w-6 text-terracotta" strokeWidth={1.7} />
                <h3 className="mt-4 font-display text-xl text-foreground">{b.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{b.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
