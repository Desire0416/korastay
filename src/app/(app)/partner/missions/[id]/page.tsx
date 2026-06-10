import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Calendar, Wallet } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { respondToMission } from "@/server/actions/partner";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { missionStatusMeta } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function PartnerMissionDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const mission = await prisma.partnerMission.findFirst({
    where: { id, partnerProfile: { userId: user.id } },
    include: { pack: { select: { name: true } } },
  });
  if (!mission) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/partner/missions" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Mes missions
      </Link>
      <PageHeader title={mission.title} actions={<StatusBadge status={mission.status} map={missionStatusMeta} />} />

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        {mission.description && <p className="mb-4 text-foreground/90">{mission.description}</p>}
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          {mission.city && <p className="flex items-center gap-2 text-foreground"><MapPin className="h-4 w-4 text-muted" /> {mission.city}</p>}
          {mission.scheduledAt && <p className="flex items-center gap-2 text-foreground"><Calendar className="h-4 w-4 text-muted" /> {formatDate(mission.scheduledAt)}</p>}
          <p className="flex items-center gap-2 text-foreground"><Wallet className="h-4 w-4 text-muted" /> {formatPrice(mission.amount)}</p>
          {mission.pack && <p className="text-muted">Pack : {mission.pack.name}</p>}
        </div>

        {mission.status === "PROPOSED" && (
          <div className="mt-6 border-t border-border pt-5">
            <AdminActions
              actions={[
                { label: "Accepter la mission", fn: respondToMission.bind(null, id, true), variant: "primary" },
                { label: "Refuser", fn: respondToMission.bind(null, id, false), variant: "outline" },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
