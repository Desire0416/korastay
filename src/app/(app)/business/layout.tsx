import { requireRole } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/account-queries";
import { ConnectedShell } from "@/components/dashboard/connected-shell";
import { BUSINESS_NAV } from "@/lib/navigation";

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"], "/login?redirectTo=/business/dashboard");
  const notifCount = await getUnreadNotificationCount(user.id);
  return (
    <ConnectedShell user={user} spaceLabel="Espace business" items={BUSINESS_NAV} notifCount={notifCount}>
      {children}
    </ConnectedShell>
  );
}
