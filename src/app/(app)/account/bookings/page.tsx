import Link from "next/link";
import { CalendarX, Compass } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getTravelerReservations } from "@/lib/account-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { ReservationCard } from "@/components/dashboard/reservation-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAccount.bookings.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function BookingsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const when = str(sp.when);
  const q = str(sp.q)?.trim().toLowerCase();
  const [reservations, { locale, dict }] = await Promise.all([getTravelerReservations(user.id), getI18n()]);
  const t = dict.dashAccount.bookings;

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
        <h2 className="mb-4 flex items-baseline gap-2 font-display text-[1.45rem] font-normal text-foreground">
          {title} <span className="font-sans text-sm text-muted">({items.length})</span>
        </h2>
        <div className="space-y-3">
          {items.map((r) => <ReservationCard key={r.id} reservation={r} />)}
        </div>
      </section>
    ) : null;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t.title} description={t.subtitle} />

      {reservations.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title={t.emptyTitle}
          description={t.emptyText}
          action={<Button asChild><Link href={localePath("/residences", locale)}><Compass className="h-4 w-4" /> {t.explore}</Link></Button>}
        />
      ) : (
        <>
          <FilterBar
            fields={[
              { type: "search", name: "q", placeholder: t.searchPlaceholder },
              {
                type: "select",
                name: "when",
                label: t.allStays,
                options: [
                  { value: "upcoming", label: t.upcoming },
                  { value: "past", label: t.past },
                  { value: "cancelled", label: t.cancelled },
                ],
              },
            ]}
          />
          {visible === 0 ? (
            <EmptyState icon={CalendarX} title={t.noResultTitle} description={t.noResultText} />
          ) : (
            <>
              {showUpcoming && <Section title={t.upcoming} items={upcoming} />}
              {showPast && <Section title={t.past} items={past} />}
              {showCancelled && <Section title={t.cancelled} items={cancelled} />}
            </>
          )}
        </>
      )}
    </div>
  );
}
