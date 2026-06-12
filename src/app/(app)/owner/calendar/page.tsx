import { requireRole } from "@/lib/auth";
import { getOwnerCalendarData } from "@/lib/owner-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { AvailabilityManager } from "@/components/dashboard/availability-manager";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Calendrier" };

export default async function OwnerCalendarPage() {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const residences = await getOwnerCalendarData(user.id);

  const data = residences.map((r) => ({
    id: r.id,
    name: r.name,
    blocks: r.availabilityBlocks.map((b) => ({ id: b.id, startDate: b.startDate.toISOString(), endDate: b.endDate.toISOString(), reason: b.reason })),
    bookings: r.reservations.map((b) => ({ startDate: b.startDate.toISOString(), endDate: b.endDate.toISOString(), reference: b.reference, guestName: b.guestName })),
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Calendrier & disponibilités" description="Bloquez des periodes et visualisez vos réservations." />
      {data.length === 0 ? (
        <EmptyState icon={Calendar} title="Aucune résidence" description="Ajoutez une résidence pour gérer son calendrier." action={<Button asChild><Link href="/owner/residences/new">Ajouter une résidence</Link></Button>} />
      ) : (
        <AvailabilityManager residences={data} />
      )}
    </div>
  );
}
