import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Plus, Home } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { SmartImage } from "@/components/ui/smart-image";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { card } from "@/components/dashboard/styles";
import { residenceStatusMeta, residenceTypeMeta, qualityLevelMeta, toFilterOptions } from "@/lib/enums";
import { statusText } from "@/lib/dictionaries/enums";
import { formatPrice, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.catalog.residences.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminResidencesPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const type = str(sp.type);
  const q = str(sp.q)?.trim();

  const where: Prisma.ResidenceWhereInput = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { owner: { is: { OR: [{ firstName: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }] } } },
    ];
  }

  const [residences, { locale, dict }] = await Promise.all([
    prisma.residence.findMany({
      where,
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } }, owner: { select: { firstName: true, lastName: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    getI18n(),
  ]);
  const t = dict.dashAdmin.catalog.residences;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t.title}
        description={t.subtitle}
        actions={
          <Button asChild variant="terracotta">
            <Link href={localePath("/admin/residences/new", locale)}><Plus className="h-4 w-4" /> {t.add}</Link>
          </Button>
        }
      />

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: t.searchPlaceholder },
          { type: "select", name: "status", label: t.allStatuses, options: toFilterOptions(residenceStatusMeta) },
          {
            type: "select",
            name: "type",
            label: t.allTypes,
            options: Object.keys(residenceTypeMeta).map((value) => ({ value, label: dict.enums.residenceType[value] ?? residenceTypeMeta[value].label })),
          },
        ]}
      />

      {residences.length === 0 ? (
        <EmptyState icon={Home} title={t.empty} />
      ) : (
        <div className="space-y-3">
          {residences.map((r) => (
            <Link
              key={r.id}
              href={localePath(`/admin/residences/${r.id}`, locale)}
              className={cn(card, "flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-card")}
            >
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-arch-sm">
                <SmartImage src={r.images[0]?.url} alt={r.name} seed={`${r.slug}-0`} sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg leading-tight text-foreground">{r.name}</h3>
                  <StatusBadge status={r.status} map={residenceStatusMeta} size="sm" />
                  {r.qualityLevel && (
                    <span className="text-xs font-semibold text-gold-700">{statusText(dict, qualityLevelMeta[r.qualityLevel]?.label ?? r.qualityLevel)}</span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  {r.city} · {r.owner.firstName} {r.owner.lastName}
                </p>
              </div>
              <p className="hidden shrink-0 font-display text-lg text-foreground sm:block">
                {formatPrice(r.pricePerNight)}
                <span className="font-sans text-xs text-muted">{t.perNight}</span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
