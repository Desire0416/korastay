import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { DestinationForm } from "@/components/dashboard/destination-form";

export const metadata = { title: "Modifier la destination - Admin" };

export default async function EditDestinationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const dest = await prisma.destination.findUnique({ where: { id } });
  if (!dest) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/destinations" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Destinations
      </Link>
      <PageHeader title="Modifier la destination" description={dest.name} />
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <DestinationForm
          id={dest.id}
          defaults={{
            name: dest.name, region: dest.region ?? "", country: dest.country ?? "",
            description: dest.description ?? "", heroImageUrl: dest.heroImageUrl ?? "",
            priority: dest.priority, latitude: dest.latitude, longitude: dest.longitude, isActive: dest.isActive,
          }}
        />
      </div>
    </div>
  );
}
