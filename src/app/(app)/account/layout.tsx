import { requireUser } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/account-queries";
import { ConnectedShell } from "@/components/dashboard/connected-shell";
import { ACCOUNT_NAV } from "@/lib/navigation";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/login?redirectTo=/account");
  const notifCount = await getUnreadNotificationCount(user.id);

  return (
    <ConnectedShell
      user={user}
      spaceLabel="Espace voyageur"
      items={ACCOUNT_NAV}
      notifCount={notifCount}
    >
      {children}
    </ConnectedShell>
  );
}
