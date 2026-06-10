import { requireRole } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/account-queries";
import { ConnectedShell } from "@/components/dashboard/connected-shell";
import { PARTNER_NAV } from "@/lib/navigation";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"], "/login?redirectTo=/partner");
  const notifCount = await getUnreadNotificationCount(user.id);
  return (
    <ConnectedShell user={user} spaceLabel="Espace partenaire" items={PARTNER_NAV} notifCount={notifCount}>
      {children}
    </ConnectedShell>
  );
}
