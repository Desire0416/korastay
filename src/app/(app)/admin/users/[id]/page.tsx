import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mail, Phone, MapPin, Calendar, Settings2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setUserStatus, setUserRole } from "@/server/actions/admin";
import { setOwnerPayoutTier } from "@/server/actions/payments-admin";
import { AdminActions, type AdminAction } from "@/components/dashboard/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { card, cardTitle } from "@/components/dashboard/styles";
import { userRoleMeta } from "@/lib/enums";
import { statusText } from "@/lib/dictionaries/enums";
import { initials, formatDate, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.community.users.metaTitle };
}

export default async function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const { id } = await params;
  const [user, { locale, dict }] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { reservations: true, residences: true, reviews: true } } },
    }),
    getI18n(),
  ]);
  if (!user) notFound();
  const t = dict.dashAdmin.community.user;
  const roleLabel = (r: string) => statusText(dict, userRoleMeta[r]?.label ?? r);

  const isSuperAdmin = admin.role === "SUPER_ADMIN";
  const statusActions: AdminAction[] =
    user.status === "ACTIVE"
      ? [{ label: t.suspend, fn: setUserStatus.bind(null, id, "SUSPENDED"), variant: "danger", confirm: t.confirmSuspend }]
      : [{ label: t.reactivate, fn: setUserStatus.bind(null, id, "ACTIVE"), variant: "primary" }];

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={localePath("/admin/users", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>

      <section className={cn(card, "relative overflow-hidden p-6 sm:p-8")}>
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 overflow-hidden">
          <div className="motif motif-kente text-terracotta/70" />
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl">{initials(user.firstName, user.lastName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[1.9rem] leading-tight text-foreground">{user.firstName} {user.lastName}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge tone={userRoleMeta[user.role]?.tone}>{roleLabel(user.role)}</Badge>
              <Badge tone={user.status === "ACTIVE" ? "success" : "danger"}>
                {dict.dashAdmin.community.users.statuses[user.status] ?? user.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <p className="flex items-center gap-2 text-foreground"><Mail className="h-4 w-4 shrink-0 text-muted" /> <span className="break-all">{user.email}</span></p>
          {user.phone && <p className="flex items-center gap-2 text-foreground"><Phone className="h-4 w-4 text-muted" /> {user.phone}</p>}
          {user.city && <p className="flex items-center gap-2 text-foreground"><MapPin className="h-4 w-4 text-muted" /> {user.city}</p>}
          <p className="flex items-center gap-2 text-foreground"><Calendar className="h-4 w-4 text-muted" /> {t.joinedOn.replace("{date}", formatDate(user.createdAt, locale))}</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-6 text-center">
          <Stat value={user._count.reservations} label={t.bookings} />
          <Stat value={user._count.residences} label={t.residences} />
          <Stat value={user._count.reviews} label={t.reviews} />
        </div>
      </section>

      <section className={cn(card, "mt-6 p-5 sm:p-6")}>
        <h2 className={cn(cardTitle, "mb-4")}>
          <Settings2 className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.actions}
        </h2>
        <AdminActions actions={statusActions} />

        {user.role === "OWNER" && (
          <div className="mt-5 border-t border-border pt-5">
            <p className="mb-1 text-sm font-semibold text-foreground">{t.payoutTitle}</p>
            <p className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
              {t.current}
              <Badge tone={user.payoutTier === "RELIABLE" ? "success" : "neutral"} size="sm">{user.payoutTier === "RELIABLE" ? t.reliable : t.newTier}</Badge>
            </p>
            <AdminActions
              actions={[
                user.payoutTier === "RELIABLE"
                  ? { label: t.makeNew, fn: setOwnerPayoutTier.bind(null, id, "NEW"), variant: "soft" }
                  : { label: t.makeReliable, fn: setOwnerPayoutTier.bind(null, id, "RELIABLE"), variant: "primary" },
              ]}
            />
          </div>
        )}

        {isSuperAdmin && (
          <div className="mt-5 border-t border-border pt-5">
            <p className="mb-3 text-sm font-semibold text-foreground">{t.roleTitle}</p>
            <AdminActions
              actions={["TRAVELER", "OWNER", "PARTNER", "BUSINESS", "ADMIN"]
                .filter((r) => r !== user.role)
                .map((r) => ({
                  label: roleLabel(r),
                  fn: setUserRole.bind(null, id, r),
                  variant: "soft" as const,
                  confirm: t.confirmRole.replace("{role}", roleLabel(r)),
                }))}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-display text-[1.9rem] leading-none text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
