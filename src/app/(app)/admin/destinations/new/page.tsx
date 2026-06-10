import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { DestinationForm } from "@/components/dashboard/destination-form";

export const metadata = { title: "Nouvelle destination - Admin" };

export default async function NewDestinationPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/destinations" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Destinations
      </Link>
      <PageHeader title="Nouvelle destination" description="Ajoutez une ville couverte par KoraStay." />
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <DestinationForm />
      </div>
    </div>
  );
}
