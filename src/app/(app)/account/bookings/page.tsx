import Link from "next/link";
import { CalendarX, Compass } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getTravelerReservations } from "@/lib/account-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { ReservationCard } from "@/components/dashboard/reservation-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Mes réservations" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function BookingsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const when = str(sp.when);
  const q = str(sp.q)?.trim().toLowerCase();
  const reservations = await getTravelerReservations(user.id);

  const match = (r: (typeof reservations)[number]) =>
    !q ||
    r.reference.toLowerCase().includes(q) ||
    (r.residence?.name ?? "").toLowerCase().includes(q) ||
    (r.pack?.name ?? "").toLowerCase().includes(q);

  const now = new Date();
  const upcoming = reservations.filter((r) => ["CONFIRMED", "PENDING_PAYMENT", "CHECKED_IN"].includes(r.status) && r.endDate >= now && match(r));
  const past = reservations.filter((r) => (r.status === "COMPLETED" || (["CONFIRMED", "CHECKED_IN"].includes(r.status) && r.endDate < now)) && match(r));
  const cancelled = reservations.filter((r) => ["CANCELLED", "NO_SHOW", "CANCELLATION_REQUESTED"].includes(r.status) && match(r));

  const showUpcoming = !when || when === "upcoming";
  const showPast = !when || when === "past";
  const showCancelled = !when || when === "cancelled";
  const visible = (showUpcoming ? upcoming.length : 0) + (showPast ? past.length : 0) + (showCancelled ? cancelled.length : 0);

  const Section = ({ title, items }: { title: string; items: typeof reservations }) =>
    items.length > 0 ? (
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold text-foreground">{title} <span className="text-muted">({items.length})</span></h2>
        <div className="space-y-3">
          {items.map((r) => <ReservationCard key={r.id} reservation={r} />)}
        </div>
      </section>
    ) : null;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Mes réservations" description="Gérez vos séjours a venir, passes et annulés." />

      {reservations.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="Aucune réservation"
          description="Vous n'avez pas encore de réservation. Trouvez votre prochain séjour des maintenant."
          action={<Button asChild><Link href="/residences"><Compass className="h-4 w-4" /> Explorer</Link></Button>}
        />
      ) : (
        <>
          <FilterBar
            fields={[
              { type: "search", name: "q", placeholder: "Référence, résidence, pack..." },
              { type: "select", name: "when", label: "Tous les séjours", options: [{ value: "upcoming", label: "A venir" }, { value: "past", label: "Passes" }, { value: "cancelled", label: "Annulés" }] },
            ]}
          />
          {visible === 0 ? (
            <EmptyState icon={CalendarX} title="Aucun resultat" description="Aucune réservation ne correspond a ces critères." />
          ) : (
            <>
              {showUpcoming && <Section title="A venir" items={upcoming} />}
              {showPast && <Section title="Passes" items={past} />}
              {showCancelled && <Section title="Annulés" items={cancelled} />}
            </>
          )}
        </>
      )}
    </div>
  );
}
