import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUnreadNotificationCount } from "@/lib/account-queries";
import { ConnectedShell } from "@/components/dashboard/connected-shell";
import { partnerNavFor } from "@/lib/navigation";
import { partnerTypeMeta } from "@/lib/enums";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"], "/login?redirectTo=/partner");
  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: user.id },
    select: { type: true, verificationStatus: true, onboardingCompletedAt: true },
  });

  // Tout partenaire pas encore onboarde est dirige vers l'onboarding, qui
  // affiche l'etat adequat : "en cours de validation" tant que l'admin n'a pas
  // verifie le profil, puis le formulaire de configuration une fois verifie.
  if (profile && !profile.onboardingCompletedAt) {
    redirect("/partner-onboarding");
  }

  const notifCount = await getUnreadNotificationCount(user.id);
  const spaceLabel = profile ? `Espace ${partnerTypeMeta[profile.type]?.label.toLowerCase() ?? "partenaire"}` : "Espace partenaire";

  return (
    <ConnectedShell user={user} spaceLabel={spaceLabel} items={partnerNavFor(profile?.type)} notifCount={notifCount}>
      {children}
    </ConnectedShell>
  );
}
