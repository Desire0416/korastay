import { requireRole } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/account-queries";
import { ConnectedShell } from "@/components/dashboard/connected-shell";
import { OWNER_NAV } from "@/lib/navigation";
import { getI18n } from "@/lib/i18n.server";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"], "/login?redirectTo=/owner");
  const [notifCount, { dict }] = await Promise.all([getUnreadNotificationCount(user.id), getI18n()]);
  return (
    <ConnectedShell user={user} spaceLabel={dict.dash.spaces.OWNER} items={OWNER_NAV} notifCount={notifCount}>
      {children}
    </ConnectedShell>
  );
}
