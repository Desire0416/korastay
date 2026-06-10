import Link from "next/link";
import { Wand2, MapPin, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { businessRequestStatusMeta } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Packs personnalises - Admin" };

export default async function AdminCustomPacksPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const requests = await prisma.customPackRequest.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Packs personnalises" description="Les paniers composes par les voyageurs." />
      {requests.length === 0 ? (
        <EmptyState icon={Wand2} title="Aucun pack personnalise" description="Les packs composes par les voyageurs apparaitront ici." />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Link key={r.id} href={`/admin/custom-packs/${r.id}`} className="flex items-center justify-between gap-3 rounded-3xl border border-border bg-surface p-5 shadow-soft transition-shadow hover:shadow-card">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-foreground">{r.reference}</h3>
                  <StatusBadge status={r.status} map={businessRequestStatusMeta} size="sm" />
                </div>
                <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {r.cityName}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {r.persons}</span>
                  <span>{r._count.items} prestation(s)</span>
                  <span>{r.contactName}</span>
                  <span>{formatDate(r.createdAt)}</span>
                </p>
              </div>
              <span className="shrink-0 font-extrabold text-foreground">{formatPrice(r.estimatedTotal)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
