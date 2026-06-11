import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, CalendarDays, ShieldCheck } from "lucide-react";
import { getResidenceBySlug } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { computeResidencePrice, computeDeposit } from "@/lib/pricing";
import { isMockPayments } from "@/lib/payments";
import { createResidenceReservation } from "@/server/actions/reservations";
import { ReservationCheckout } from "@/components/public/reservation-checkout";
import { SmartImage } from "@/components/ui/smart-image";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { formatPrice, formatDate, nightsBetween } from "@/lib/utils";

export const metadata = { title: "Finaliser la reservation" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ReserverPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const checkin = str(sp.checkin);
  const checkout = str(sp.checkout);
  const adults = Number(str(sp.adults) ?? 2);
  const children = Number(str(sp.children) ?? 0);

  const backUrl = `/residences/${slug}/reserver?checkin=${checkin}&checkout=${checkout}&adults=${adults}&children=${children}`;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirectTo=${encodeURIComponent(backUrl)}`);

  const residence = await getResidenceBySlug(slug);
  if (!residence || residence.status !== "PUBLISHED") notFound();
  if (!checkin || !checkout || nightsBetween(checkin, checkout) < 1) {
    redirect(`/residences/${slug}`);
  }

  const price = computeResidencePrice({
    pricePerNight: residence.pricePerNight,
    cleaningFee: residence.cleaningFee,
    startDate: checkin,
    endDate: checkout,
  });

  return (
    <div className="container-page py-8">
      <Link href={`/residences/${slug}`} className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Retour a la residence
      </Link>

      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
        Finaliser votre reservation
      </h1>

      <div className="mt-7 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
        {/* Formulaire */}
        <div className="order-2 lg:order-1">
          <ReservationCheckout
            action={createResidenceReservation}
            isMock={isMockPayments()}
            validationLabel="24h"
            depositLabel={formatPrice(computeDeposit({ type: "RESIDENCE", nights: price.nights, total: price.total, pricePerNight: residence.pricePerNight }))}
            hidden={{
              residenceId: residence.id,
              checkin: checkin!,
              checkout: checkout!,
              adults: String(adults),
              children: String(children),
            }}
            defaultName={`${user.firstName} ${user.lastName}`}
            defaultEmail={user.email}
            defaultPhone={user.phone ?? ""}
          />
        </div>

        {/* Recapitulatif */}
        <aside className="order-1 lg:order-2">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <div className="flex gap-4">
              <div className="h-20 w-24 shrink-0 overflow-hidden rounded-2xl">
                <SmartImage src={residence.images[0]?.url} alt={residence.name} seed={`${residence.slug}-0`} />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 font-bold text-foreground">{residence.name}</p>
                <p className="text-sm text-muted">{residence.city}</p>
                {residence.isVerified && <VerifiedBadge size="sm" className="mt-1" />}
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex items-center gap-2 text-foreground">
                <CalendarDays className="h-4 w-4 text-muted" />
                {formatDate(checkin!)} &rarr; {formatDate(checkout!)}
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Users className="h-4 w-4 text-muted" />
                {adults + children} voyageur{adults + children > 1 ? "s" : ""}
              </div>
            </div>

            <div className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm">
              <div className="flex justify-between text-muted">
                <span>{formatPrice(residence.pricePerNight)} x {price.nights} nuit{price.nights > 1 ? "s" : ""}</span>
                <span className="text-foreground">{formatPrice(price.subtotal)}</span>
              </div>
              {price.cleaningFee > 0 && (
                <div className="flex justify-between text-muted">
                  <span>Frais de menage</span>
                  <span className="text-foreground">{formatPrice(price.cleaningFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Frais de service</span>
                <span className="text-foreground">{formatPrice(price.serviceFee)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-lg font-extrabold text-foreground">
                <span>Total</span>
                <span>{formatPrice(price.total)}</span>
              </div>
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
              <ShieldCheck className="h-4 w-4 text-brand-500" />
              Paiement securise - Annulation selon conditions
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
