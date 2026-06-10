import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";
import { relativeTime, initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const metadata = { title: "Journal d'audit - Admin" };

export default async function AdminAuditPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const logs = await prisma.auditLog.findMany({
    include: { actor: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Journal d'audit" description="Historique des actions sensibles." />
      {logs.length === 0 ? (
        <EmptyState icon={ScrollText} title="Aucune action enregistree" description="Les actions administratives sensibles seront journalisees ici." />
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
              <Avatar className="h-9 w-9"><AvatarFallback className="text-xs">{log.actor ? initials(log.actor.firstName, log.actor.lastName) : "S"}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : "Systeme"}</span>{" "}
                  <Badge tone="neutral" size="sm">{log.action}</Badge>{" "}
                  {log.entityType && <span className="text-muted">{log.entityType}</span>}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted">{relativeTime(log.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
