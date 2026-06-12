import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { missionStatusMeta } from "@/lib/enums";
import { Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Calendrier partenaire" };

export default async function PartnerCalendarPage() {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: user.id },
    include: { missions: { where: { scheduledAt: { not: null }, status: { in: ["ACCEPTED", "CONFIRMED"] } }, orderBy: { scheduledAt: "asc" } } },
  });
  const missions = profile?.missions ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Calendrier" description="Vos missions a venir." />
      {missions.length === 0 ? (
        <EmptyState icon={Calendar} title="Aucune mission programmée" description="Vos missions acceptées apparaitront ici par date." />
      ) : (
        <div className="space-y-3">
          {missions.map((m) => (
            <div key={m.id} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-soft">
              <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <span className="text-lg font-bold">{m.scheduledAt ? new Date(m.scheduledAt).getDate() : "-"}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{m.title}</p>
                <p className="text-xs text-muted">{m.scheduledAt ? formatDate(m.scheduledAt) : ""} - {m.city}</p>
              </div>
              <StatusBadge status={m.status} map={missionStatusMeta} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
