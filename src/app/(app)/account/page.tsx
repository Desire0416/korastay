import Link from "next/link";
import { CalendarCheck, Heart, Star, CheckCircle2, ArrowRight, Compass, Home } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getTravelerStats, getTravelerReservations } from "@/lib/account-queries";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ReservationCard } from "@/components/dashboard/reservation-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Mon espace" };

export default async function AccountDashboard() {
  const user = await requireUser();
  const [stats, reservations] = await Promise.all([
    getTravelerStats(user.id),
    getTravelerReservations(user.id),
  ]);

  const upcoming = reservations
    .filter((r) => ["CONFIRMED", "PENDING_PAYMENT", "CHECKED_IN"].includes(r.status) && r.startDate >= new Date())
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Bonjour {user.firstName}
        </h1>
        <p className="mt-1 text-muted">Voici un aperçu de vos séjours et favoris.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard label="Séjours a venir" value={stats.upcoming} icon={CalendarCheck} tone="brand" href="/account/bookings?when=upcoming" />
        <KpiCard label="Séjours effectués" value={stats.completed} icon={CheckCircle2} tone="success" href="/account/bookings?when=past" />
        <KpiCard label="Favoris" value={stats.favorites} icon={Heart} tone="danger" href="/account/favorites" />
        <KpiCard label="Avis laisses" value={stats.reviews} icon={Star} tone="gold" href="/account/reviews" />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Prochains séjours</h2>
        <Link href="/account/bookings" className="flex items-center gap-1 text-sm font-semibold text-brand-600">
          Tout voir <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {upcoming.length > 0 ? (
          upcoming.map((r) => <ReservationCard key={r.id} reservation={r} />)
        ) : (
          <EmptyState
            icon={Compass}
            title="Aucun séjour a venir"
            description="Explorez nos résidences vérifiées et nos packs pour planifier votre prochain voyage."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild><Link href="/residences"><Home className="h-4 w-4" /> Voir les résidences</Link></Button>
                <Button asChild variant="outline"><Link href="/packs"><Compass className="h-4 w-4" /> Voir les packs</Link></Button>
              </div>
            }
          />
        )}
      </div>

      {/* Acces rapides */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { href: "/account/favorites", icon: Heart, title: "Mes favoris", desc: "Retrouvez vos coups de coeur" },
          { href: "/account/reviews", icon: Star, title: "Mes avis", desc: "Partagez vos expériences" },
          { href: "/account/profile", icon: CheckCircle2, title: "Mon profil", desc: "Gérez vos informations" },
        ].map((q) => (
          <Link key={q.href} href={q.href} className="group flex items-center gap-4 rounded-3xl border border-border bg-surface p-5 shadow-soft transition-shadow hover:shadow-card">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <q.icon className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-bold text-foreground">{q.title}</p>
              <p className="text-sm text-muted">{q.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
