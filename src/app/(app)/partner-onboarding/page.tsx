import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { PartnerOnboardingForm } from "@/components/dashboard/partner-onboarding-form";
import { partnerTypeMeta } from "@/lib/enums";
import { parseJsonArray } from "@/lib/utils";

export const metadata = { title: "Configuration partenaire - KoraStay" };

export default async function PartnerOnboardingPage() {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"], "/login?redirectTo=/partner-onboarding");
  const profile = await prisma.partnerProfile.findUnique({ where: { userId: user.id } });

  // Deja configure -> dashboard.
  if (profile?.onboardingCompletedAt) redirect("/partner");

  return (
    <div className="min-h-screen bg-surface-soft/40">
      <header className="border-b border-border bg-surface">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <LogoutButton className="text-sm font-semibold text-muted hover:text-foreground" />
        </div>
      </header>

      <main className="container-page max-w-3xl py-10">
        {!profile ? (
          <EmptyCard
            title="Profil partenaire en cours de création"
            text="Votre profil partenaire n'est pas encore configure par notre équipe. Contactez KoraStay pour finaliser votre inscription."
          />
        ) : profile.verificationStatus !== "VERIFIED" ? (
          <div className="rounded-3xl border border-gold-200 bg-gold-50/60 p-8 text-center shadow-soft">
            <Clock className="mx-auto h-10 w-10 text-gold-600" />
            <h1 className="mt-3 text-xl font-bold text-gold-800">Profil en cours de validation</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-gold-800/80">
              Votre profil <strong>{profile.businessName}</strong> est en cours de vérification par l'équipe KoraStay.
              Vous pourrez completer votre configuration des qu'il sera valide.
            </p>
            <Button asChild variant="outline" className="mt-5"><Link href="/">Retour a l'accueil</Link></Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
                <Sparkles className="h-3.5 w-3.5" /> {partnerTypeMeta[profile.type]?.label}
              </span>
              <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">Finalisez votre configuration</h1>
              <p className="mt-2 text-muted">
                Dernière étape avant d'acceder a votre espace : completez vos informations et joignez vos justificatifs.
              </p>
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

function EmptyCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center shadow-soft">
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-muted">{text}</p>
      <Button asChild className="mt-5"><Link href="/contact">Contacter KoraStay</Link></Button>
    </div>
  );
}
