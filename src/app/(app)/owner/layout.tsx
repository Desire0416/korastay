import { requireRole } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/account-queries";
import { ConnectedShell } from "@/components/dashboard/connected-shell";
import { OWNER_NAV } from "@/lib/navigation";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"], "/login?redirectTo=/owner");
  const notifCount = await getUnreadNotificationCount(user.id);
  return (
    <ConnectedShell user={user} spaceLabel="Espace proprietaire" items={OWNER_NAV} notifCount={notifCount}>
      {children}
    </ConnectedShell>
  );
}
