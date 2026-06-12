import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Briefcase } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { respondToMission } from "@/server/actions/partner";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { missionStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Mes missions" };

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

  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: user.id },
    include: { missions: { where: missionWhere, orderBy: { createdAt: "desc" } } },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Mes missions" description="Les missions qui vous sont proposées." />

      {profile && (
        <FilterBar
          fields={[
            { type: "search", name: "q", placeholder: "Intitule, ville..." },
            { type: "select", name: "status", label: "Tous les statuts", options: toFilterOptions(missionStatusMeta) },
          ]}
        />
      )}

      {!profile || profile.missions.length === 0 ? (
        <EmptyState icon={Briefcase} title="Aucune mission" description={hasFilters ? "Aucun resultat pour ces critères." : "Les missions proposées apparaitront ici selon votre ville et votre type de service."} />
      ) : (
        <div className="space-y-3">
          {profile.missions.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-surface p-5 shadow-soft">
              <div className="min-w-0">
                <Link href={`/partner/missions/${m.id}`} className="font-bold text-foreground hover:text-brand-600">{m.title}</Link>
                <p className="text-sm text-muted">{m.city} - {m.scheduledAt ? formatDate(m.scheduledAt) : "Date a definir"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-foreground">{formatPrice(m.amount)}</span>
                <StatusBadge status={m.status} map={missionStatusMeta} size="sm" />
                {m.status === "PROPOSED" && (
                  <AdminActions
                    actions={[
                      { label: "Accepter", fn: respondToMission.bind(null, m.id, true), variant: "primary" },
                      { label: "Refuser", fn: respondToMission.bind(null, m.id, false), variant: "outline" },
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
