import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { initials } from "@/lib/utils";

export const metadata = { title: "Équipe business" };

export default async function BusinessTeamPage() {
  const user = await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"]);
  const membership = await prisma.businessMember.findFirst({
    where: { userId: user.id },
    include: { businessAccount: { include: { members: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } } } },
  });
  const members = membership?.businessAccount?.members ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Mon équipe" description="Les membres de votre organisation." />
      {members.length === 0 ? (
        <EmptyState icon={Users} title="Aucune équipe" description="Votre compte n'est pas encore rattache a une organisation." />
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft">
              <Avatar><AvatarFallback>{initials(m.user.firstName, m.user.lastName)}</AvatarFallback></Avatar>
              <div className="flex-1"><p className="font-semibold text-foreground">{m.user.firstName} {m.user.lastName}</p><p className="text-xs text-muted">{m.user.email}</p></div>
              <Badge tone={m.role === "OWNER" ? "brand" : "neutral"}>{m.role === "OWNER" ? "Administrateur" : "Membre"}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
