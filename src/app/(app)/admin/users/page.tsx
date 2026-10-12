import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { table, mobileItem } from "@/components/dashboard/styles";
import { userRoleMeta, toFilterOptions } from "@/lib/enums";
import { statusText } from "@/lib/dictionaries/enums";
import { initials, formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.community.users.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const STATUS_TONE: Record<string, "success" | "danger" | "neutral" | "warning"> = {
  ACTIVE: "success",
  SUSPENDED: "danger",
  DISABLED: "neutral",
  PENDING_EMAIL_VERIFICATION: "warning",
};

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

  const [users, { locale, dict }] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 }),
    getI18n(),
  ]);
  const t = dict.dashAdmin.community.users;
  const roleLabel = (r: string) => statusText(dict, userRoleMeta[r]?.label ?? r);
  const statusLabel = (s: string) => t.statuses[s] ?? s;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t.title} description={t.count.replace("{n}", String(users.length))} />

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: t.searchPlaceholder },
          { type: "select", name: "role", label: t.allRoles, options: toFilterOptions(userRoleMeta, ["TRAVELER", "OWNER", "PARTNER", "BUSINESS", "SUPPORT", "ADMIN", "SUPER_ADMIN"]) },
          { type: "select", name: "status", label: t.allStatuses, options: Object.entries(t.statuses).map(([value, label]) => ({ value, label })) },
        ]}
      />

      {users.length === 0 ? (
        <EmptyState icon={Users} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <>
          {/* Mobile : liste de cartes */}
          <div className="space-y-2.5 md:hidden">
            {users.map((u) => (
              <Link key={u.id} href={localePath(`/admin/users/${u.id}`, locale)} className={`${mobileItem} flex items-center gap-3`}>
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="text-xs">{initials(u.firstName, u.lastName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-foreground">{u.firstName} {u.lastName}</p>
                  <p className="truncate text-[12px] text-muted">{u.email}</p>
                </div>
                <Badge tone={userRoleMeta[u.role]?.tone} size="sm">{roleLabel(u.role)}</Badge>
              </Link>
            ))}
          </div>
          {/* Desktop : tableau */}
          <div className={`${table.wrap} hidden md:block`}>
            <div className="overflow-x-auto">
              <table className={`${table.table} min-w-[600px]`}>
                <thead className={table.head}>
                  <tr>
                    <th className={table.th}>{t.user}</th>
                    <th className={table.th}>{t.role}</th>
                    <th className={table.th}>{t.status}</th>
                    <th className={table.th}>{t.joined}</th>
                  </tr>
                </thead>
                <tbody className={table.body}>
                  {users.map((u) => (
                    <tr key={u.id} className={table.row}>
                      <td className={table.td}>
                        <Link href={localePath(`/admin/users/${u.id}`, locale)} className="group flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs">{initials(u.firstName, u.lastName)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-terracotta group-hover:underline">{u.firstName} {u.lastName}</p>
                            <p className="truncate text-xs text-muted">{u.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className={table.td}><Badge tone={userRoleMeta[u.role]?.tone} size="sm">{roleLabel(u.role)}</Badge></td>
                      <td className={table.td}><Badge tone={STATUS_TONE[u.status] ?? "neutral"} size="sm">{statusLabel(u.status)}</Badge></td>
                      <td className={`${table.td} text-muted`}>{formatDate(u.createdAt, locale)}</td>
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
