import { requireRole } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/account-queries";
import { ConnectedShell } from "@/components/dashboard/connected-shell";
import { BUSINESS_NAV } from "@/lib/navigation";
import { getI18n } from "@/lib/i18n.server";

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"], "/login?redirectTo=/business/dashboard");
  const [notifCount, { dict }] = await Promise.all([getUnreadNotificationCount(user.id), getI18n()]);
  return (
    <ConnectedShell user={user} spaceLabel={dict.dash.spaces.BUSINESS} items={BUSINESS_NAV} notifCount={notifCount}>
      {children}
    </ConnectedShell>
  );
}
