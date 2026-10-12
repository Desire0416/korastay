import Link from "next/link";
import { Calendar, Plus } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getOwnerCalendarData } from "@/lib/owner-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { AvailabilityManager } from "@/components/dashboard/availability-manager";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashOwner.calendar.metaTitle };
}

export default async function OwnerCalendarPage() {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const [residences, { locale, dict }] = await Promise.all([getOwnerCalendarData(user.id), getI18n()]);
  const t = dict.dashOwner.calendar;

  const data = residences.map((r) => ({
    id: r.id,
    name: r.name,
    blocks: r.availabilityBlocks.map((b) => ({ id: b.id, startDate: b.startDate.toISOString(), endDate: b.endDate.toISOString(), reason: b.reason })),
    bookings: r.reservations.map((b) => ({ startDate: b.startDate.toISOString(), endDate: b.endDate.toISOString(), reference: b.reference, guestName: b.guestName })),
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t.title} description={t.subtitle} />
      {data.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={t.emptyTitle}
          description={t.emptyText}
          action={
            <Button asChild>
              <Link href={localePath("/owner/residences/new", locale)}><Plus className="h-4 w-4" /> {dict.dashOwner.home.addResidence}</Link>
            </Button>
          }
        />
      ) : (
        <AvailabilityManager residences={data} />
      )}
    </div>
  );
}
