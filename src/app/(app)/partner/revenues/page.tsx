import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { missionStatusMeta } from "@/lib/enums";
import { Wallet, Briefcase } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Revenus partenaire" };

export default async function PartnerRevenuesPage() {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: user.id },
    include: { missions: { where: { status: { in: ["CONFIRMED", "COMPLETED"] } }, orderBy: { createdAt: "desc" } } },
  });
  const missions = profile?.missions ?? [];
  const total = missions.reduce((s, m) => s + m.amount, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Revenus" description="Vos gains issus des missions realisees." />
      <div className="grid grid-cols-2 gap-4">
        <KpiCard label="Revenu total" value={formatPrice(total)} icon={Wallet} tone="success" />
        <KpiCard label="Missions" value={missions.length} icon={Briefcase} tone="brand" />
      </div>
      <h2 className="mb-3 mt-8 text-lg font-bold text-foreground">Détail</h2>
      {missions.length === 0 ? (
        <EmptyState icon={Wallet} title="Aucun revenu" description="Vos revenus apparaitront après vos premières missions confirmées." />
      ) : (
        <div className="space-y-2">
          {missions.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
              <div><p className="font-semibold text-foreground">{m.title}</p><p className="text-xs text-muted">{formatDate(m.createdAt)}</p></div>
              <div className="flex items-center gap-3">
                <StatusBadge status={m.status} map={missionStatusMeta} size="sm" />
                <span className="font-semibold text-success">{formatPrice(m.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
