import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Calendar, Wallet, Package } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { respondToMission } from "@/server/actions/partner";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { card } from "@/components/dashboard/styles";
import { missionStatusMeta } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashPartner.missions.metaTitle };
}

export default async function PartnerMissionDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const [mission, { locale, dict }] = await Promise.all([
    prisma.partnerMission.findFirst({
      where: { id, partnerProfile: { userId: user.id } },
      include: { pack: { select: { name: true } } },
    }),
    getI18n(),
  ]);
  if (!mission) notFound();
  const t = dict.dashPartner.missions;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={localePath("/partner/missions", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader title={mission.title} actions={<StatusBadge status={mission.status} map={missionStatusMeta} />} />

      <div className={`${card} p-6 sm:p-7`}>
        {mission.description && <p className="mb-5 text-[15px] leading-relaxed text-foreground/85">{mission.description}</p>}
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          {mission.city && <Info icon={MapPin} text={mission.city} />}
          {mission.scheduledAt && <Info icon={Calendar} text={formatDate(mission.scheduledAt, locale)} />}
          <Info icon={Wallet} text={formatPrice(mission.amount)} strong />
          {mission.pack && <Info icon={Package} text={t.pack.replace("{name}", mission.pack.name)} />}
        </div>

        {mission.status === "PROPOSED" && (
          <div className="mt-6 border-t border-border pt-5">
            <AdminActions
              size="md"
              actions={[
                { label: t.acceptMission, fn: respondToMission.bind(null, id, true), variant: "primary" },
                { label: t.decline, fn: respondToMission.bind(null, id, false), variant: "outline" },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ icon: Icon, text, strong }: { icon: typeof MapPin; text: string; strong?: boolean }) {
  return (
    <p className="flex items-center gap-2.5 rounded-xl bg-sand-50 px-3.5 py-2.5 text-foreground ring-1 ring-inset ring-sand-200">
      <Icon className="h-4 w-4 shrink-0 text-terracotta" strokeWidth={1.8} />
      <span className={strong ? "font-semibold" : undefined}>{text}</span>
    </p>
  );
}
