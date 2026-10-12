import { requireUser } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/account-queries";
import { ConnectedShell } from "@/components/dashboard/connected-shell";
import { ACCOUNT_NAV } from "@/lib/navigation";
import { getI18n } from "@/lib/i18n.server";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/login?redirectTo=/account");
  const [notifCount, { dict }] = await Promise.all([getUnreadNotificationCount(user.id), getI18n()]);

  return (
    <ConnectedShell
      user={user}
      spaceLabel={dict.dash.spaces.TRAVELER}
      items={ACCOUNT_NAV}
      notifCount={notifCount}
    >
      {children}
    </ConnectedShell>
  );
}
