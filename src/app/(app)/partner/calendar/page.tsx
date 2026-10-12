import { Calendar } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { card } from "@/components/dashboard/styles";
import { missionStatusMeta } from "@/lib/enums";
import { formatDate, MONTHS_SHORT } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashPartner.calendar.metaTitle };
}

export default async function PartnerCalendarPage() {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const [profile, { locale, dict }] = await Promise.all([
    prisma.partnerProfile.findUnique({
      where: { userId: user.id },
      include: { missions: { where: { scheduledAt: { not: null }, status: { in: ["ACCEPTED", "CONFIRMED"] } }, orderBy: { scheduledAt: "asc" } } },
    }),
    getI18n(),
  ]);
  const t = dict.dashPartner.calendar;
  const missions = profile?.missions ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.title} description={t.subtitle} />
      {missions.length === 0 ? (
        <EmptyState icon={Calendar} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <div className="space-y-3">
          {missions.map((m) => {
            const d = m.scheduledAt ? new Date(m.scheduledAt) : null;
            return (
              <div key={m.id} className={`${card} flex items-center gap-4 p-4 sm:p-5`}>
                <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-arch-sm bg-ink text-white">
                  <span className="font-display text-xl leading-none">{d ? d.getDate() : "-"}</span>
                  {d && <span className="mt-0.5 text-[10px] uppercase tracking-wide text-gold-300">{MONTHS_SHORT[locale][d.getMonth()]}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg leading-tight text-foreground">{m.title}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {d ? formatDate(d, locale) : ""}
                    {m.city ? ` · ${m.city}` : ""}
                  </p>
                </div>
                <StatusBadge status={m.status} map={missionStatusMeta} size="sm" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
