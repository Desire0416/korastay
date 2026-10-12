import { requireRole } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/account-queries";
import { ConnectedShell } from "@/components/dashboard/connected-shell";
import { ADMIN_NAV } from "@/lib/navigation";
import { getI18n } from "@/lib/i18n.server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"], "/login?redirectTo=/admin");
  const [notifCount, { dict }] = await Promise.all([getUnreadNotificationCount(user.id), getI18n()]);
  return (
    <ConnectedShell user={user} spaceLabel={dict.dash.spaces.ADMIN} groups={ADMIN_NAV} notifCount={notifCount}>
      {children}
    </ConnectedShell>
  );
}
