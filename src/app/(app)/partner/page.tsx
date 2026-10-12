import Link from "next/link";
import { Tags, Briefcase, Wallet, CheckCircle2, Clock, Plus, ArrowRight, CookingPot, Car, Lightbulb, MapPin, CalendarDays, type LucideIcon } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { card, sectionTitle } from "@/components/dashboard/styles";
import { verificationStatusMeta, missionStatusMeta, partnerTypeMeta } from "@/lib/enums";
import { statusText } from "@/lib/dictionaries/enums";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashPartner.home.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;

export default async function PartnerDashboard({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const justOnboarded = sp.onboarded === "1";
  const [profile, { locale, dict }] = await Promise.all([
    prisma.partnerProfile.findUnique({
      where: { userId: user.id },
      include: {
        services: true,
        missions: { orderBy: { createdAt: "desc" }, take: 5 },
        _count: { select: { services: true, missions: true, menuItems: true } },
      },
    }),
    getI18n(),
  ]);
  const t = dict.dashPartner.home;

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title={dict.dash.hello.replace("{name}", user.firstName)} />
        <EmptyState
          icon={Briefcase}
          title={t.noProfileTitle}
          description={t.noProfileText}
          action={<Button asChild><Link href={localePath("/contact", locale)}>{t.contact}</Link></Button>}
        />
      </div>
    );
  }

  const revenue = profile.missions.filter((m) => ["CONFIRMED", "COMPLETED"].includes(m.status)).reduce((s, m) => s + m.amount, 0);
  const pendingMissions = profile.missions.filter((m) => m.status === "PROPOSED").length;
  const typeKey = (profile.type in t.tips ? profile.type : "OTHER") as keyof typeof t.tips;
  const typeLabel = statusText(dict, partnerTypeMeta[profile.type]?.label ?? profile.type);
  const dishes = profile._count.menuItems;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow={dict.dash.partnerSpace.replace("{type}", typeLabel)}
        title={profile.businessName}
        description={`${typeLabel}${profile.city ? ` · ${profile.city}` : ""}`}
        actions={<StatusBadge status={profile.verificationStatus} map={verificationStatusMeta} />}
      />

      {justOnboarded && (
        <div className="mb-6 flex items-start gap-3 rounded-[1.25rem] bg-brand-50 p-4 text-brand-800 ring-1 ring-inset ring-brand-200/70">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-sm">
            <span className="font-semibold">{t.onboardedTitle}</span> {t.onboardedText}
          </p>
        </div>
      )}

      {profile.verificationStatus === "PENDING_REVIEW" && (
        <div className="mb-6 flex items-center gap-3 rounded-[1.25rem] bg-gold-50 p-4 text-gold-900 ring-1 ring-inset ring-gold-200/70">
          <Clock className="h-5 w-5 shrink-0 text-gold-600" />
          <p className="text-sm">{t.pendingReview}</p>
        </div>
      )}

      {/* Conseil par metier */}
      <div className="mb-6 flex items-start gap-3 rounded-[1.25rem] bg-sand-50 p-4 text-sm ring-1 ring-inset ring-sand-200">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" strokeWidth={1.7} />
        <p className="text-foreground/85">{t.tips[typeKey]}</p>
      </div>

      {/* Bloc specialise par metier */}
      {profile.type === "RESTAURANT" && (
        <Shortcut
          href={localePath("/partner/menu", locale)}
          icon={CookingPot}
          title={t.myMenu}
          text={(dishes > 1 ? t.dishMany : t.dishOne).replace("{n}", String(dishes))}
        />
      )}
      {profile.type === "TRANSPORT" && (
        <Shortcut
          href={localePath("/partner/vehicle", locale)}
          icon={Car}
          title={t.myVehicle}
          text={
            profile.vehicleType
              ? `${profile.vehicleType}${profile.vehicleSeats ? ` · ${t.seats.replace("{n}", String(profile.vehicleSeats))}` : ""}`
              : t.toFill
          }
        />
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {profile.type === "RESTAURANT" ? (
          <KpiCard label={t.kpiDishes} value={dishes} icon={CookingPot} tone="brand" href="/partner/menu" />
        ) : (
          <KpiCard label={t.kpiServices} value={profile._count.services} icon={Tags} tone="brand" href="/partner/services" />
        )}
        <KpiCard label={t.kpiMissions} value={profile._count.missions} icon={Briefcase} tone="info" href="/partner/missions" />
        <KpiCard label={t.kpiToHandle} value={pendingMissions} icon={Clock} tone="gold" href="/partner/missions?status=PROPOSED" />
        <KpiCard label={t.kpiRevenue} value={formatPrice(revenue)} icon={Wallet} tone="danger" href="/partner/revenues" />
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <h2 className={sectionTitle}>{t.recentMissions}</h2>
        <Link href={localePath("/partner/missions", locale)} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta">
          {dict.dash.common.seeAll} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="mt-4 space-y-2.5">
        {profile.missions.length === 0 ? (
          <p className="rounded-[1.25rem] border border-dashed border-sand-300 bg-sand-50/60 p-6 text-center text-sm text-muted">{t.noMissions}</p>
        ) : (
          profile.missions.map((m) => (
            <Link
              key={m.id}
              href={localePath(`/partner/missions/${m.id}`, locale)}
              className={cn(card, "flex flex-wrap items-center justify-between gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-card sm:p-5")}
            >
              <div className="min-w-0">
                <p className="font-display text-lg leading-tight text-foreground">{m.title}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  {m.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {m.city}</span>}
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" /> {m.scheduledAt ? formatDate(m.scheduledAt, locale) : t.dateTbd}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={m.status} map={missionStatusMeta} size="sm" />
                <span className="text-sm font-semibold text-foreground">{formatPrice(m.amount)}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      {profile.type !== "RESTAURANT" && (
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href={localePath("/partner/services/new", locale)}><Plus className="h-4 w-4" /> {t.addService}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function Shortcut({ href, icon: Icon, title, text }: { href: string; icon: LucideIcon; title: string; text: string }) {
  return (
    <Link href={href} className={cn(card, "group mb-6 flex items-center justify-between gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-card sm:p-5")}>
      <span className="flex items-center gap-4">
        <span className="flex h-12 w-11 shrink-0 items-center justify-center rounded-arch-sm bg-sand-100 text-terracotta">
          <Icon className="h-5 w-5" strokeWidth={1.7} />
        </span>
        <span>
          <span className="block font-display text-lg text-foreground">{title}</span>
          <span className="block text-sm text-muted">{text}</span>
        </span>
      </span>
      <ArrowRight className="h-5 w-5 text-muted transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
