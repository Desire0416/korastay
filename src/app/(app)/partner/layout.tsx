import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUnreadNotificationCount } from "@/lib/account-queries";
import { ConnectedShell } from "@/components/dashboard/connected-shell";
import { partnerNavFor } from "@/lib/navigation";
import { partnerTypeMeta } from "@/lib/enums";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { statusText } from "@/lib/dictionaries/enums";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"], "/login?redirectTo=/partner");
  const { locale, dict } = await getI18n();
  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: user.id },
    select: { type: true, verificationStatus: true, onboardingCompletedAt: true },
  });

  // Tout partenaire pas encore onboarde est dirige vers l'onboarding, qui
  // affiche l'etat adequat : "en cours de validation" tant que l'admin n'a pas
  // verifie le profil, puis le formulaire de configuration une fois verifie.
  if (profile && !profile.onboardingCompletedAt) {
    redirect(localePath("/partner-onboarding", locale));
  }

  const notifCount = await getUnreadNotificationCount(user.id);
  const typeLabel = profile ? partnerTypeMeta[profile.type]?.label : undefined;
  const spaceLabel = typeLabel
    ? dict.dash.partnerSpace.replace("{type}", statusText(dict, typeLabel))
    : dict.dash.spaces.PARTNER;

  return (
    <ConnectedShell user={user} spaceLabel={spaceLabel} items={partnerNavFor(profile?.type)} notifCount={notifCount}>
      {children}
    </ConnectedShell>
  );
}
