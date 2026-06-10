import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, CalendarDays, Clock, ShieldCheck } from "lucide-react";
import { getPackBySlug } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { computePackPrice } from "@/lib/pricing";
import { isMockPayments } from "@/lib/payments";
import { createPackReservation } from "@/server/actions/reservations";
import { ReservationCheckout } from "@/components/public/reservation-checkout";
import { SmartImage } from "@/components/ui/smart-image";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Reserver un pack" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function PackReserverPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const startDate = str(sp.startDate);
  const persons = Number(str(sp.persons) ?? 2);

  const backUrl = `/packs/${slug}/reserver?startDate=${startDate}&persons=${persons}`;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirectTo=${encodeURIComponent(backUrl)}`);

  const pack = await getPackBySlug(slug);
  if (!pack || pack.status !== "PUBLISHED") notFound();
  if (!startDate) redirect(`/packs/${slug}`);

  const price = computePackPrice({
    basePrice: pack.price,
    basePersons: pack.basePersons,
    extraPersonPrice: pack.extraPersonPrice,
    persons,
  });

  return (
    <div className="container-page py-8">
      <Link href={`/packs/${slug}`} className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Retour au pack
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Reserver votre pack</h1>

      <div className="mt-7 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
        <div className="order-2 lg:order-1">
          <ReservationCheckout
            action={createPackReservation}
            isMock={isMockPayments()}
            hidden={{ packId: pack.id, startDate: startDate!, persons: String(persons) }}
            defaultName={`${user.firstName} ${user.lastName}`}
            defaultEmail={user.email}
            defaultPhone={user.phone ?? ""}
          />
        </div>

        <aside className="order-1 lg:order-2">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <div className="flex gap-4">
              <div className="h-20 w-24 shrink-0 overflow-hidden rounded-2xl">
                <SmartImage src={pack.images[0]?.url} alt={pack.name} seed={`pack-${pack.slug}-0`} />
              </div>
              <div>
                <p className="font-bold text-foreground">{pack.name}</p>
                <p className="text-sm text-muted">{pack.destination?.name}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex items-center gap-2 text-foreground"><CalendarDays className="h-4 w-4 text-muted" /> Depart le {formatDate(startDate!)}</div>
              <div className="flex items-center gap-2 text-foreground"><Clock className="h-4 w-4 text-muted" /> {pack.durationDays}j / {pack.durationNights}n</div>
              <div className="flex items-center gap-2 text-foreground"><Users className="h-4 w-4 text-muted" /> {persons} voyageur{persons > 1 ? "s" : ""}</div>
            </div>
            <div className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm">
              <div className="flex justify-between text-muted"><span>Pack ({pack.basePersons} pers.)</span><span className="text-foreground">{formatPrice(pack.price)}</span></div>
              {price.extras > 0 && <div className="flex justify-between text-muted"><span>Personnes supp.</span><span className="text-foreground">{formatPrice(price.extras)}</span></div>}
              <div className="flex justify-between text-muted"><span>Frais de service</span><span className="text-foreground">{formatPrice(price.serviceFee)}</span></div>
              <div className="flex justify-between border-t border-border pt-3 text-lg font-extrabold text-foreground"><span>Total</span><span>{formatPrice(price.total)}</span></div>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
              <ShieldCheck className="h-4 w-4 text-brand-500" /> Partenaires locaux certifies KoraStay
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
