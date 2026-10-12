import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Briefcase, MapPin, CalendarDays } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { respondToMission } from "@/server/actions/partner";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { card } from "@/components/dashboard/styles";
import { missionStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashPartner.missions.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function PartnerMissionsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const q = str(sp.q)?.trim();
  const hasFilters = Boolean(status || q);

  const missionWhere: Prisma.PartnerMissionWhereInput = {};
  if (status) missionWhere.status = status;
  if (q) missionWhere.OR = [{ title: { contains: q, mode: "insensitive" } }, { city: { contains: q, mode: "insensitive" } }];

  const [profile, { locale, dict }] = await Promise.all([
    prisma.partnerProfile.findUnique({
      where: { userId: user.id },
      include: { missions: { where: missionWhere, orderBy: { createdAt: "desc" } } },
    }),
    getI18n(),
  ]);
  const t = dict.dashPartner.missions;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t.title} description={t.subtitle} />

      {profile && (
        <FilterBar
          fields={[
            { type: "search", name: "q", placeholder: t.searchPlaceholder },
            { type: "select", name: "status", label: t.allStatuses, options: toFilterOptions(missionStatusMeta) },
          ]}
        />
      )}

      {!profile || profile.missions.length === 0 ? (
        <EmptyState icon={Briefcase} title={t.emptyTitle} description={hasFilters ? t.noResultText : t.emptyText} />
      ) : (
        <div className="space-y-3">
          {profile.missions.map((m) => (
            <div key={m.id} className={`${card} flex flex-wrap items-center justify-between gap-4 p-5`}>
              <div className="min-w-0">
                <Link href={localePath(`/partner/missions/${m.id}`, locale)} className="font-display text-lg leading-tight text-foreground hover:text-terracotta">
                  {m.title}
                </Link>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  {m.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {m.city}</span>}
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" /> {m.scheduledAt ? formatDate(m.scheduledAt, locale) : dict.dashPartner.home.dateTbd}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-foreground">{formatPrice(m.amount)}</span>
                <StatusBadge status={m.status} map={missionStatusMeta} size="sm" />
                {m.status === "PROPOSED" && (
                  <AdminActions
                    actions={[
                      { label: t.accept, fn: respondToMission.bind(null, m.id, true), variant: "primary" },
                      { label: t.decline, fn: respondToMission.bind(null, m.id, false), variant: "outline" },
                    ]}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
