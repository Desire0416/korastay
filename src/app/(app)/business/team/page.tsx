import { Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { card } from "@/components/dashboard/styles";
import { initials } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashBusiness.team.metaTitle };
}

export default async function BusinessTeamPage() {
  const user = await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"]);
  const [membership, { dict }] = await Promise.all([
    prisma.businessMember.findFirst({
      where: { userId: user.id },
      include: { businessAccount: { include: { members: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } } } },
    }),
    getI18n(),
  ]);
  const members = membership?.businessAccount?.members ?? [];
  const t = dict.dashBusiness.team;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.title} description={t.subtitle} />
      {members.length === 0 ? (
        <EmptyState icon={Users} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <div className={`${card} divide-y divide-border/70 overflow-hidden`}>
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-4 sm:px-5">
              <Avatar>
                <AvatarFallback>{initials(m.user.firstName, m.user.lastName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{m.user.firstName} {m.user.lastName}</p>
                <p className="truncate text-xs text-muted">{m.user.email}</p>
              </div>
              <Badge tone={m.role === "OWNER" ? "brand" : "neutral"}>{m.role === "OWNER" ? t.admin : t.member}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
