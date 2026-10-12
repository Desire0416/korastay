import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Plus, Pencil, CheckCircle2, Compass, MapPin } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setPackStatus } from "@/server/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { SmartImage } from "@/components/ui/smart-image";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { card } from "@/components/dashboard/styles";
import { residenceStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.catalog.packs.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminPacksPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const destinationId = str(sp.destination);
  const q = str(sp.q)?.trim();

  const where: Prisma.PackWhereInput = {};
  if (status) where.status = status;
  if (destinationId) where.destinationId = destinationId;
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { destination: { is: { name: { contains: q, mode: "insensitive" } } } }];

  const [packs, destinations, { locale, dict }] = await Promise.all([
    prisma.pack.findMany({
      where,
      include: { destination: { select: { name: true } }, images: { take: 1 }, _count: { select: { reservations: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.destination.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    getI18n(),
  ]);
  const t = dict.dashAdmin.catalog.packs;
  const newHref = localePath("/admin/packs/new", locale);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t.title}
        description={t.subtitle}
        actions={<Button asChild variant="terracotta"><Link href={newHref}><Plus className="h-4 w-4" /> {t.add}</Link></Button>}
      />

      {sp.created === "1" && (
        <div className="mb-5 flex items-center gap-3 rounded-[1.25rem] bg-brand-50 p-4 text-sm text-brand-800 ring-1 ring-inset ring-brand-200/70">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" /> {t.created}
        </div>
      )}

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: t.searchPlaceholder },
          { type: "select", name: "status", label: t.allStatuses, options: toFilterOptions(residenceStatusMeta, ["DRAFT", "PUBLISHED", "UNPUBLISHED"]) },
          { type: "select", name: "destination", label: t.allDestinations, options: destinations.map((d) => ({ value: d.id, label: d.name })) },
        ]}
      />

      {packs.length === 0 ? (
        <EmptyState
          icon={Compass}
          title={t.emptyTitle}
          description={t.emptyText}
          action={<Button asChild><Link href={newHref}><Plus className="h-4 w-4" /> {t.add}</Link></Button>}
        />
      ) : (
        <div className="space-y-3">
          {packs.map((p) => (
            <div key={p.id} className={`${card} flex flex-col gap-4 p-4 sm:flex-row sm:items-center`}>
              <div className="h-36 w-full shrink-0 overflow-hidden rounded-[1.1rem] sm:h-20 sm:w-16 sm:rounded-arch-sm">
                <SmartImage src={p.images[0]?.url} alt={p.name} seed={`pack-${p.slug}-0`} sizes="(max-width: 640px) 100vw, 64px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg leading-tight text-foreground">{p.name}</h3>
                  <StatusBadge status={p.status} map={residenceStatusMeta} size="sm" />
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {p.destination?.name ?? t.noDestination}</span>
                  <span className="font-semibold text-foreground">{formatPrice(p.price)}</span>
                  <span>{t.bookings.replace("{n}", String(p._count.reservations))}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={localePath(`/admin/packs/${p.id}/edit`, locale)}><Pencil className="h-3.5 w-3.5" /> {t.edit}</Link>
                </Button>
                <AdminActions
                  actions={
                    p.status === "PUBLISHED"
                      ? [{ label: t.unpublish, fn: setPackStatus.bind(null, p.id, "UNPUBLISHED"), variant: "ghost" }]
                      : [{ label: t.publish, fn: setPackStatus.bind(null, p.id, "PUBLISHED"), variant: "soft" }]
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
