import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ActivityForm } from "@/components/dashboard/activity-form";

export const metadata = { title: "Nouvelle activite - Admin" };

export default async function NewActivityPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const destinations = await prisma.destination.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/activities" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Activites
      </Link>
      <PageHeader title="Nouvelle activite" description="Les photos s'ajoutent apres la creation." />
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        <ActivityForm destinations={destinations} />
      </div>
    </div>
  );
}
