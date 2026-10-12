import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, Sparkles, Briefcase } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/brand/logo";
import { Motif } from "@/components/brand/motif";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LogoutButton } from "@/components/auth/logout-button";
import { PartnerOnboardingForm } from "@/components/dashboard/partner-onboarding-form";
import { partnerTypeMeta } from "@/lib/enums";
import { statusText } from "@/lib/dictionaries/enums";
import { parseJsonArray } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashPartner.onboarding.metaTitle, robots: { index: false } };
}

export default async function PartnerOnboardingPage() {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"], "/login?redirectTo=/partner-onboarding");
  const [profile, { locale, dict }] = await Promise.all([prisma.partnerProfile.findUnique({ where: { userId: user.id } }), getI18n()]);
  const t = dict.dashPartner.onboarding;

  // Deja configure -> tableau de bord.
  if (profile?.onboardingCompletedAt) redirect(localePath("/partner", locale));

  return (
    <div className="min-h-screen bg-background">
      <header className="relative border-b border-border bg-surface">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <LogoutButton label={t.logout} className="text-sm font-semibold text-muted hover:text-ink" />
        </div>
      </header>

      <main className="container-page max-w-3xl py-10 sm:py-14">
        {!profile ? (
          <EmptyState
            icon={Briefcase}
            title={dict.dashPartner.home.noProfileTitle}
            description={dict.dashPartner.home.noProfileText}
            action={<Button asChild><Link href={localePath("/contact", locale)}>{dict.dashPartner.home.contact}</Link></Button>}
          />
        ) : profile.verificationStatus !== "VERIFIED" ? (
          <div className="relative overflow-hidden rounded-[1.75rem] bg-ink p-8 text-center text-white shadow-card sm:p-10">
            <Motif variant="bogolan" fade="radial" className="text-white/[0.06]" />
            <div className="relative">
              <span className="mx-auto flex h-16 w-14 items-center justify-center rounded-arch-sm bg-gold-400 text-ink-900">
                <Clock className="h-6 w-6" />
              </span>
              <h1 className="mt-5 font-display text-[1.9rem] leading-tight">{t.reviewTitle}</h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/75">
                {t.reviewText.split("{name}")[0]}
                <strong className="text-white">{profile.businessName}</strong>
                {t.reviewText.split("{name}")[1]}
              </p>
              <Button asChild variant="outline-light" className="mt-6">
                <Link href={localePath("/", locale)}>{t.backHome}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-3 py-1 text-sm font-semibold text-terracotta-700 ring-1 ring-inset ring-sand-300">
                <Sparkles className="h-3.5 w-3.5" /> {statusText(dict, partnerTypeMeta[profile.type]?.label ?? profile.type)}
              </span>
              <h1 className="mt-4 font-display text-[2.1rem] leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[2.5rem]">{t.title}</h1>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{t.subtitle}</p>
            </div>
            <PartnerOnboardingForm
              type={profile.type}
              defaults={{
                businessName: profile.businessName,
                description: profile.description ?? "",
                phone: profile.phone ?? user.phone ?? "",
                whatsapp: profile.whatsapp ?? "",
                city: profile.city ?? user.city ?? "",
                zonesCovered: parseJsonArray(profile.zonesCovered).join(", "),
                languages: parseJsonArray(profile.languages).join(", "),
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}
