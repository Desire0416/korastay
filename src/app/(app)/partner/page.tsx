import Link from "next/link";
import { Tags, Briefcase, Wallet, CheckCircle2, Clock, Plus, ArrowRight, CookingPot, Car } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { verificationStatusMeta, missionStatusMeta, partnerTypeMeta } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Tableau de bord partenaire" };

type SP = Record<string, string | string[] | undefined>;

export default async function PartnerDashboard({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const justOnboarded = sp.onboarded === "1";
  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: user.id },
    include: {
      services: true,
      missions: { orderBy: { createdAt: "desc" }, take: 5 },
      _count: { select: { services: true, missions: true, menuItems: true } },
    },
  });

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title={`Bonjour ${user.firstName}`} />
        <div className="rounded-3xl border border-dashed border-border bg-surface-soft/40 p-8 text-center">
          <h2 className="text-lg font-bold text-foreground">Profil partenaire en cours de creation</h2>
          <p className="mt-2 text-muted">Votre profil partenaire n'est pas encore configure. Contactez l'equipe KoraStay pour finaliser votre inscription.</p>
          <Button asChild className="mt-5"><Link href="/contact">Contacter KoraStay</Link></Button>
        </div>
      </div>
    );
  }

  const revenue = profile.missions.filter((m) => ["CONFIRMED", "COMPLETED"].includes(m.status)).reduce((s, m) => s + m.amount, 0);
  const pendingMissions = profile.missions.filter((m) => m.status === "PROPOSED").length;

  const TYPE_HINTS: Record<string, { tip: string; servicesLabel: string }> = {
    GUIDE: { tip: "Proposez vos visites guidees et excursions, indiquez vos langues et zones couvertes.", servicesLabel: "vos visites et excursions" },
    TRANSPORT: { tip: "Proposez vos trajets et transferts (aeroport, gare, intercite) avec vos tarifs.", servicesLabel: "vos trajets et transferts" },
    RESTAURANT: { tip: "Proposez vos menus et formules, et vos creneaux de reservation.", servicesLabel: "vos menus et formules" },
    ACTIVITY: { tip: "Proposez vos activites et experiences avec duree et tarif indicatif.", servicesLabel: "vos activites et experiences" },
    OTHER: { tip: "Proposez vos prestations avec une description claire et un tarif indicatif.", servicesLabel: "vos prestations" },
  };
  const hint = TYPE_HINTS[profile.type] ?? TYPE_HINTS.OTHER;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={profile.businessName}
        description={`${partnerTypeMeta[profile.type]?.label}${profile.city ? " · " + profile.city : ""}`}
        actions={<StatusBadge status={profile.verificationStatus} map={verificationStatusMeta} />}
      />

      {justOnboarded && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-success/30 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <p className="text-sm text-emerald-700">
            <span className="font-bold">Configuration terminee !</span> Bienvenue dans votre espace. Completez votre offre pour recevoir des missions.
          </p>
        </div>
      )}

      {profile.verificationStatus === "PENDING_REVIEW" && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gold-200 bg-gold-50 p-4">
          <Clock className="h-5 w-5 text-gold-600" />
          <p className="text-sm text-gold-700">Votre profil est en cours de validation par l'equipe KoraStay.</p>
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 text-sm text-brand-800">
        <span className="font-semibold">Espace {partnerTypeMeta[profile.type]?.label.toLowerCase()} :</span> {hint.tip}
      </div>

      {/* Bloc specialise par metier */}
      {profile.type === "RESTAURANT" && (
        <Link href="/partner/menu" className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft hover:border-brand-300">
          <span className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><CookingPot className="h-5 w-5" /></span>
            <span>
              <span className="block font-bold text-foreground">Mon menu</span>
              <span className="block text-sm text-muted">{profile._count.menuItems} plat{profile._count.menuItems > 1 ? "s" : ""} en ligne</span>
            </span>
          </span>
          <ArrowRight className="h-5 w-5 text-muted" />
        </Link>
      )}
      {profile.type === "TRANSPORT" && (
        <Link href="/partner/vehicle" className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft hover:border-brand-300">
          <span className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Car className="h-5 w-5" /></span>
            <span>
              <span className="block font-bold text-foreground">Mon vehicule</span>
              <span className="block text-sm text-muted">{profile.vehicleType ? `${profile.vehicleType}${profile.vehicleSeats ? ` · ${profile.vehicleSeats} places` : ""}` : "A renseigner"}</span>
            </span>
          </span>
          <ArrowRight className="h-5 w-5 text-muted" />
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {profile.type === "RESTAURANT"
          ? <KpiCard label="Plats" value={profile._count.menuItems} icon={CookingPot} tone="brand" href="/partner/menu" />
          : <KpiCard label="Services" value={profile._count.services} icon={Tags} tone="brand" href="/partner/services" />}
        <KpiCard label="Missions" value={profile._count.missions} icon={Briefcase} tone="info" href="/partner/missions" />
        <KpiCard label="A traiter" value={pendingMissions} icon={Clock} tone="gold" href="/partner/missions?status=PROPOSED" />
        <KpiCard label="Revenus" value={formatPrice(revenue)} icon={Wallet} tone="success" href="/partner/revenues" />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Missions recentes</h2>
        <Link href="/partner/missions" className="flex items-center gap-1 text-sm font-semibold text-brand-600">Tout voir <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div className="mt-4 space-y-2">
        {profile.missions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted">Aucune mission pour le moment.</p>
        ) : profile.missions.map((m) => (
          <Link key={m.id} href={`/partner/missions/${m.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft hover:shadow-card">
            <div>
              <p className="font-semibold text-foreground">{m.title}</p>
              <p className="text-xs text-muted">{m.city} - {m.scheduledAt ? formatDate(m.scheduledAt) : "Date a definir"}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={m.status} map={missionStatusMeta} size="sm" />
              <span className="text-sm font-semibold text-foreground">{formatPrice(m.amount)}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Button asChild variant="outline"><Link href="/partner/services/new"><Plus className="h-4 w-4" /> Ajouter un service</Link></Button>
      </div>
    </div>
  );
}
