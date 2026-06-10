import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { userRoleMeta, toFilterOptions } from "@/lib/enums";
import { initials, formatDate } from "@/lib/utils";
import { Users } from "lucide-react";

export const metadata = { title: "Utilisateurs - Admin" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const ACCOUNT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Actif" },
  { value: "SUSPENDED", label: "Suspendu" },
  { value: "DISABLED", label: "Desactive" },
  { value: "PENDING_EMAIL_VERIFICATION", label: "Email a confirmer" },
];

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const sp = await searchParams;
  const role = str(sp.role);
  const status = str(sp.status);
  const q = str(sp.q)?.trim();

  const where: Prisma.UserWhereInput = {};
  if (role) where.role = role;
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Utilisateurs" description={`${users.length} utilisateur(s)`} />

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: "Nom, email, telephone..." },
          { type: "select", name: "role", label: "Tous les roles", options: toFilterOptions(userRoleMeta, ["TRAVELER", "OWNER", "PARTNER", "BUSINESS", "SUPPORT", "ADMIN", "SUPER_ADMIN"]) },
          { type: "select", name: "status", label: "Tous les statuts", options: ACCOUNT_STATUS_OPTIONS },
        ]}
      />

      {users.length === 0 ? (
        <EmptyState icon={Users} title="Aucun utilisateur" description="Aucun resultat pour ces criteres." />
      ) : (
      <>
      {/* Mobile : liste de cartes */}
      <div className="space-y-2.5 md:hidden">
        {users.map((u) => (
          <Link key={u.id} href={`/admin/users/${u.id}`} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-soft active:bg-surface-soft">
            <Avatar className="h-10 w-10 shrink-0"><AvatarFallback className="text-xs">{initials(u.firstName, u.lastName)}</AvatarFallback></Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-foreground">{u.firstName} {u.lastName}</p>
              <p className="truncate text-[12px] text-muted">{u.email}</p>
            </div>
            <Badge tone={userRoleMeta[u.role]?.tone}>{userRoleMeta[u.role]?.label}</Badge>
          </Link>
        ))}
      </div>
      {/* Desktop : tableau */}
      <div className="hidden overflow-hidden rounded-3xl border border-border bg-surface shadow-soft md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="border-b border-border bg-surface-soft/50 text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Utilisateur</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 font-semibold">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-soft/40">
                  <td className="px-5 py-3">
                    <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback className="text-xs">{initials(u.firstName, u.lastName)}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-semibold text-brand-600">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3"><Badge tone={userRoleMeta[u.role]?.tone}>{userRoleMeta[u.role]?.label}</Badge></td>
                  <td className="px-5 py-3"><Badge tone={u.status === "ACTIVE" ? "success" : u.status === "SUSPENDED" ? "danger" : "neutral"}>{u.status === "ACTIVE" ? "Actif" : u.status === "SUSPENDED" ? "Suspendu" : u.status === "DISABLED" ? "Desactive" : "Email a confirmer"}</Badge></td>
                  <td className="px-5 py-3 text-muted">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
