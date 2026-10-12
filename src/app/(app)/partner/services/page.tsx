import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Plus, Tags, MapPin, Clock, Wallet } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toggleService } from "@/server/actions/partner";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { card } from "@/components/dashboard/styles";
import { navText } from "@/lib/dictionaries/dashboard";
import { formatPrice } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashPartner.services.metaTitle };
}

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

  const [profile, { locale, dict }] = await Promise.all([
    prisma.partnerProfile.findUnique({
      where: { userId: user.id },
      include: { services: { where: serviceWhere, orderBy: { createdAt: "desc" } } },
    }),
    getI18n(),
  ]);
  const t = dict.dashPartner.services;
  // Un chauffeur voit ses "trajets" (meme libelle que la navigation).
  const title = profile?.type === "TRANSPORT" ? navText(dict.dash, "Mes trajets") : t.title;
  const newHref = localePath("/partner/services/new", locale);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={title}
        description={t.subtitle}
        actions={<Button asChild variant="terracotta"><Link href={newHref}><Plus className="h-4 w-4" /> {t.add}</Link></Button>}
      />

      {profile && (
        <FilterBar
          fields={[
            { type: "search", name: "q", placeholder: t.searchPlaceholder },
            { type: "select", name: "active", label: t.all, options: [{ value: "active", label: t.active }, { value: "inactive", label: t.inactive }] },
          ]}
        />
      )}

      {!profile || profile.services.length === 0 ? (
        <EmptyState
          icon={Tags}
          title={hasFilters ? t.noResultTitle : t.emptyTitle}
          description={hasFilters ? t.noResultText : t.emptyText}
          action={hasFilters ? undefined : <Button asChild><Link href={newHref}><Plus className="h-4 w-4" /> {t.addService}</Link></Button>}
        />
      ) : (
        <div className="space-y-3">
          {profile.services.map((s) => (
            <div key={s.id} className={`${card} flex flex-wrap items-center justify-between gap-4 p-5`}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg leading-tight text-foreground">{s.title}</h3>
                  <Badge tone={s.isActive ? "success" : "neutral"} size="sm">{s.isActive ? t.activeBadge : t.inactiveBadge}</Badge>
                </div>
                {s.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{s.description}</p>}
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                  {s.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {s.city}</span>}
                  {s.priceFrom ? <span className="flex items-center gap-1"><Wallet className="h-3.5 w-3.5" /> {t.from.replace("{price}", formatPrice(s.priceFrom))}</span> : null}
                  {s.duration && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {s.duration}</span>}
                </p>
              </div>
              <AdminActions actions={[{ label: s.isActive ? t.deactivate : t.activate, fn: toggleService.bind(null, s.id), variant: "outline" }]} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
