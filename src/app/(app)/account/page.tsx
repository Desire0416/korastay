import Link from "next/link";
import { CalendarCheck, Heart, Star, CheckCircle2, ArrowRight, Compass, Home, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureReferralCode } from "@/lib/referral";
import { getTravelerStats, getTravelerReservations } from "@/lib/account-queries";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { ReservationCard } from "@/components/dashboard/reservation-card";
import { ReferralCard } from "@/components/dashboard/referral-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import { SITE_URL } from "@/lib/constants";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAccount.home.metaTitle };
}

const QUICK = [
  { href: "/account/favorites", icon: Heart },
  { href: "/account/reviews", icon: Star },
  { href: "/account/profile", icon: UserRound },
];

export default async function AccountDashboard() {
  const user = await requireUser();
  const [stats, reservations, referralCode, referralCount, { locale, dict }] = await Promise.all([
    getTravelerStats(user.id),
    getTravelerReservations(user.id),
    ensureReferralCode(user.id),
    prisma.user.count({ where: { referredById: user.id } }),
    getI18n(),
  ]);
  const t = dict.dashAccount.home;
  const referralLink = `${SITE_URL}${localePath("/register", locale)}?ref=${referralCode}`;

  const upcoming = reservations
    .filter((r) => ["CONFIRMED", "PENDING_PAYMENT", "CHECKED_IN"].includes(r.status) && r.startDate >= new Date())
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow={dict.dash.spaces.TRAVELER} title={dict.dash.hello.replace("{name}", user.firstName)} description={t.subtitle} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard label={t.kpiUpcoming} value={stats.upcoming} icon={CalendarCheck} tone="brand" href="/account/bookings?when=upcoming" />
        <KpiCard label={t.kpiCompleted} value={stats.completed} icon={CheckCircle2} tone="success" href="/account/bookings?when=past" />
        <KpiCard label={t.kpiFavorites} value={stats.favorites} icon={Heart} tone="danger" href="/account/favorites" />
        <KpiCard label={t.kpiReviews} value={stats.reviews} icon={Star} tone="gold" href="/account/reviews" />
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <h2 className="font-display text-[1.6rem] font-normal text-foreground">{t.nextStays}</h2>
        <Link href={localePath("/account/bookings", locale)} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta">
          {dict.dash.common.seeAll} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {upcoming.length > 0 ? (
          upcoming.map((r) => <ReservationCard key={r.id} reservation={r} />)
        ) : (
          <EmptyState
            icon={Compass}
            title={t.emptyTitle}
            description={t.emptyText}
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild><Link href={localePath("/residences", locale)}><Home className="h-4 w-4" /> {t.seeHomes}</Link></Button>
                <Button asChild variant="outline"><Link href={localePath("/packs", locale)}><Compass className="h-4 w-4" /> {t.seePacks}</Link></Button>
              </div>
            }
          />
        )}
      </div>

      {/* Acces rapides */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {QUICK.map((q, i) => (
          <Link
            key={q.href}
            href={localePath(q.href, locale)}
            className="group flex items-center gap-4 rounded-[1.5rem] border border-border/80 bg-surface p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
          >
            <span className="flex h-12 w-11 shrink-0 items-center justify-center rounded-arch-sm bg-sand-100 text-terracotta">
              <q.icon className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg text-foreground">{t.quick[i]?.title}</p>
              <p className="text-sm text-muted">{t.quick[i]?.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      <ReferralCard code={referralCode} link={referralLink} count={referralCount} />
    </div>
  );
}
