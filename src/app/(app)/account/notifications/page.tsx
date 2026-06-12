import Link from "next/link";
import { Bell } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getNotifications } from "@/lib/account-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { MarkAllReadButton } from "@/components/dashboard/mark-all-read-button";
import { EmptyState } from "@/components/ui/empty-state";
import { relativeTime, cn } from "@/lib/utils";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getNotifications(user.id);
  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Vos alertes et mises a jour."
        actions={hasUnread ? <MarkAllReadButton /> : undefined}
      />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Aucune notification" description="Vous serez informe ici de l'evolution de vos réservations." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const content = (
              <div className={cn("flex gap-3 rounded-2xl border border-border p-4 transition-colors", n.readAt ? "bg-surface" : "bg-brand-50/50")}>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.readAt ? "bg-border" : "bg-brand-500")} />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-foreground">{n.title}</p>
                    <span className="shrink-0 text-xs text-muted">{relativeTime(n.createdAt)}</span>
                  </div>
                  {n.body && <p className="mt-0.5 text-sm text-muted">{n.body}</p>}
                </div>
              </div>
            );
            return n.url ? (
              <Link key={n.id} href={n.url}>{content}</Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
