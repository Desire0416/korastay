import { ScrollText } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { card } from "@/components/dashboard/styles";
import { relativeTime, initials } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.system.audit.metaTitle };
}

export default async function AdminAuditPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const [logs, { locale, dict }] = await Promise.all([
    prisma.auditLog.findMany({
      include: { actor: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    getI18n(),
  ]);
  const t = dict.dashAdmin.system.audit;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t.title} description={t.subtitle} />
      {logs.length === 0 ? (
        <EmptyState icon={ScrollText} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <div className={`${card} divide-y divide-border/70 overflow-hidden`}>
          {logs.map((log) => (
            <div key={log.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs">{log.actor ? initials(log.actor.firstName, log.actor.lastName) : "S"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground">
                  <span className="font-semibold">{log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : t.system}</span>
                  <Badge tone="neutral" size="sm" className="font-mono">{log.action}</Badge>
                  {log.entityType && <span className="text-muted">{log.entityType}</span>}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted">{relativeTime(log.createdAt, locale)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
