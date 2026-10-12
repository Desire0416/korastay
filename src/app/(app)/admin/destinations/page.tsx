import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Plus, Pencil, CheckCircle2, MapPin } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { SmartImage } from "@/components/ui/smart-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { card } from "@/components/dashboard/styles";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.catalog.destinations.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminDestinationsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const active = str(sp.active);
  const q = str(sp.q)?.trim();

  const where: Prisma.DestinationWhereInput = {};
  if (active === "active") where.isActive = true;
  else if (active === "inactive") where.isActive = false;
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { region: { contains: q, mode: "insensitive" } }];

  const [destinations, { locale, dict }] = await Promise.all([
    prisma.destination.findMany({
      where,
      include: { _count: { select: { residences: true, packs: true } } },
      orderBy: { priority: "asc" },
    }),
    getI18n(),
  ]);
  const t = dict.dashAdmin.catalog.destinations;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t.title}
        description={t.subtitle}
        actions={
          <Button asChild variant="terracotta">
            <Link href={localePath("/admin/destinations/new", locale)}><Plus className="h-4 w-4" /> {t.add}</Link>
          </Button>
        }
      />

      {sp.created === "1" && (
        <div className="mb-5 flex items-center gap-3 rounded-[1.25rem] bg-brand-50 p-4 text-sm text-brand-800 ring-1 ring-inset ring-brand-200/70">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" /> {t.created}
        </div>
      )}

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: t.searchPlaceholder },
          { type: "select", name: "active", label: t.all, options: [{ value: "active", label: t.active }, { value: "inactive", label: t.inactive }] },
        ]}
      />

      {destinations.length === 0 ? (
        <EmptyState icon={MapPin} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <div key={d.id} className={`${card} overflow-hidden`}>
              <div className="relative aspect-[16/10]">
                <SmartImage src={d.heroImageUrl} alt={d.name} seed={`dest-${d.slug}`} sizes="(max-width: 640px) 100vw, 33vw" />
                <div className="absolute right-3 top-3">
                  <Badge tone={d.isActive ? "success" : "neutral"} className="bg-white/95">{d.isActive ? t.activeBadge : t.inactiveBadge}</Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-xl leading-tight text-foreground">{d.name}</h3>
                  <Button asChild variant="outline" size="sm">
                    <Link href={localePath(`/admin/destinations/${d.id}/edit`, locale)}><Pencil className="h-3.5 w-3.5" /> {t.edit}</Link>
                  </Button>
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3" /> {d.region ?? "-"}</p>
                <p className="mt-2 text-xs text-muted">
                  {t.counts
                    .replace("{residences}", String(d._count.residences))
                    .replace("{packs}", String(d._count.packs))
                    .replace("{priority}", String(d.priority))}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
