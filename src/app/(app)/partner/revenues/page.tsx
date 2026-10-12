import { Wallet, Briefcase } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { table, sectionTitle } from "@/components/dashboard/styles";
import { missionStatusMeta } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashPartner.revenues.metaTitle };
}

export default async function PartnerRevenuesPage() {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const [profile, { locale, dict }] = await Promise.all([
    prisma.partnerProfile.findUnique({
      where: { userId: user.id },
      include: { missions: { where: { status: { in: ["CONFIRMED", "COMPLETED"] } }, orderBy: { createdAt: "desc" } } },
    }),
    getI18n(),
  ]);
  const t = dict.dashPartner.revenues;
  const missions = profile?.missions ?? [];
  const total = missions.reduce((s, m) => s + m.amount, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t.title} description={t.subtitle} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <KpiCard label={t.total} value={formatPrice(total)} icon={Wallet} tone="brand" />
        <KpiCard label={t.missions} value={missions.length} icon={Briefcase} tone="info" />
      </div>
      <h2 className={`${sectionTitle} mb-4 mt-10`}>{t.detail}</h2>
      {missions.length === 0 ? (
        <EmptyState icon={Wallet} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <div className={table.wrap}>
          <ul className={table.body}>
            {missions.map((m) => (
              <li key={m.id} className={`${table.row} flex items-center justify-between gap-3 px-5 py-4`}>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{m.title}</p>
                  <p className="text-xs text-muted">{formatDate(m.createdAt, locale)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={m.status} map={missionStatusMeta} size="sm" />
                  <span className="font-semibold text-brand-700">{formatPrice(m.amount)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
