import { requireRole } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/account-queries";
import { ConnectedShell } from "@/components/dashboard/connected-shell";
import { ADMIN_NAV } from "@/lib/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"], "/login?redirectTo=/admin");
  const notifCount = await getUnreadNotificationCount(user.id);
  return (
    <ConnectedShell user={user} spaceLabel="Administration" groups={ADMIN_NAV} notifCount={notifCount}>
      {children}
    </ConnectedShell>
  );
}
