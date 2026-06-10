import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Plus, Tags } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toggleService } from "@/server/actions/partner";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Mes services" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function PartnerServicesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const active = str(sp.active);
  const q = str(sp.q)?.trim();
  const hasFilters = Boolean(active || q);

  const serviceWhere: Prisma.PartnerServiceWhereInput = {};
  if (active === "active") serviceWhere.isActive = true;
  else if (active === "inactive") serviceWhere.isActive = false;
  if (q) serviceWhere.OR = [{ title: { contains: q, mode: "insensitive" } }, { city: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }];

  const profile = await prisma.partnerProfile.findUnique({
    where: { userId: user.id },
    include: { services: { where: serviceWhere, orderBy: { createdAt: "desc" } } },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Mes services"
        description="Les prestations que vous proposez aux voyageurs."
        actions={<Button asChild><Link href="/partner/services/new"><Plus className="h-4 w-4" /> Ajouter</Link></Button>}
      />

      {profile && (
        <FilterBar
          fields={[
            { type: "search", name: "q", placeholder: "Titre, ville, description..." },
            { type: "select", name: "active", label: "Tous", options: [{ value: "active", label: "Actifs" }, { value: "inactive", label: "Inactifs" }] },
          ]}
        />
      )}

      {!profile || profile.services.length === 0 ? (
        <EmptyState icon={Tags} title={hasFilters ? "Aucun resultat" : "Aucun service"} description={hasFilters ? "Aucun service ne correspond a ces criteres." : "Ajoutez vos prestations pour recevoir des missions."} action={hasFilters ? undefined : <Button asChild><Link href="/partner/services/new"><Plus className="h-4 w-4" /> Ajouter un service</Link></Button>} />
      ) : (
        <div className="space-y-3">
          {profile.services.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-surface p-5 shadow-soft">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground">{s.title}</h3>
                  <Badge tone={s.isActive ? "success" : "neutral"}>{s.isActive ? "Actif" : "Inactif"}</Badge>
                </div>
                {s.description && <p className="text-sm text-muted">{s.description}</p>}
                <p className="mt-1 text-sm text-muted">{s.city} {s.priceFrom ? `- des ${formatPrice(s.priceFrom)}` : ""} {s.duration ? `- ${s.duration}` : ""}</p>
              </div>
              <AdminActions actions={[{ label: s.isActive ? "Desactiver" : "Activer", fn: toggleService.bind(null, s.id), variant: "outline" }]} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
