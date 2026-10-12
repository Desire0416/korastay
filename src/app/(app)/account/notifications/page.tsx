import Link from "next/link";
import { Bell } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getNotifications } from "@/lib/account-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { MarkAllReadButton } from "@/components/dashboard/mark-all-read-button";
import { EmptyState } from "@/components/ui/empty-state";
import { relativeTime, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAccount.notifications.title };
}

export default async function NotificationsPage() {
  const user = await requireUser();
  const [notifications, { locale, dict }] = await Promise.all([getNotifications(user.id), getI18n()]);
  const t = dict.dashAccount.notifications;
  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.title} description={t.subtitle} actions={hasUnread ? <MarkAllReadButton /> : undefined} />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] border border-border/80 bg-surface shadow-soft">
          {notifications.map((n) => {
            const content = (
              <div className={cn("flex gap-3 border-b border-border/70 px-5 py-4 transition-colors last:border-0 hover:bg-sand-50", !n.readAt && "bg-sand-50")}>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.readAt ? "bg-sand-300" : "bg-terracotta")} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-foreground">{n.title}</p>
                    <span className="shrink-0 text-xs text-muted">{relativeTime(n.createdAt, locale)}</span>
                  </div>
                  {n.body && <p className="mt-0.5 text-sm leading-relaxed text-muted">{n.body}</p>}
                </div>
              </div>
            );
            return n.url ? (
              <Link key={n.id} href={localePath(n.url, locale)} className="block">{content}</Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
