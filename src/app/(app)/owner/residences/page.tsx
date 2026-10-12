import Link from "next/link";
import { Plus, Home, Users, BedDouble, Star, Pencil, CalendarCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getOwnerResidences } from "@/lib/owner-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { card } from "@/components/dashboard/styles";
import { residenceStatusMeta, toFilterOptions } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashOwner.residences.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function OwnerResidencesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const q = str(sp.q)?.trim().toLowerCase();

  const [all, { locale, dict }] = await Promise.all([getOwnerResidences(user.id), getI18n()]);
  const t = dict.dashOwner.residences;
  const residences = all.filter(
    (r) =>
      (!status || r.status === status) &&
      (!q || r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q))
  );
  const newHref = localePath("/owner/residences/new", locale);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t.title}
        description={t.subtitle}
        actions={<Button asChild variant="terracotta"><Link href={newHref}><Plus className="h-4 w-4" /> {t.add}</Link></Button>}
      />

      {all.length > 0 && (
        <FilterBar
          fields={[
            { type: "search", name: "q", placeholder: t.searchPlaceholder },
            { type: "select", name: "status", label: t.allStatuses, options: toFilterOptions(residenceStatusMeta) },
          ]}
        />
      )}

      {all.length === 0 ? (
        <EmptyState
          icon={Home}
          title={t.emptyTitle}
          description={t.emptyText}
          action={<Button asChild><Link href={newHref}><Plus className="h-4 w-4" /> {dict.dashOwner.home.addResidence}</Link></Button>}
        />
      ) : residences.length === 0 ? (
        <EmptyState icon={Home} title={t.noResultTitle} description={t.noResultText} />
      ) : (
        <div className="space-y-3">
          {residences.map((r) => {
            const count = r._count.reservations;
            return (
              <div key={r.id} className={`${card} flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5`}>
                <div className="h-40 w-full shrink-0 overflow-hidden rounded-[1.1rem] sm:h-24 sm:w-24 sm:rounded-arch-sm">
                  <SmartImage src={r.images[0]?.url} alt={r.name} seed={`${r.slug}-0`} sizes="(max-width: 640px) 100vw, 96px" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl leading-tight text-foreground">{r.name}</h3>
                    <StatusBadge status={r.status} map={residenceStatusMeta} size="sm" />
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{r.city}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {r.capacity}</span>
                    <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {t.bedroomsShort.replace("{n}", String(r.bedrooms))}</span>
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> {t.reviewsCount.replace("{n}", String(r.ratingCount))}</span>
                    <span className="flex items-center gap-1">
                      <CalendarCheck className="h-3.5 w-3.5" /> {(count > 1 ? t.bookingMany : t.bookingOne).replace("{n}", String(count))}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <p className="font-display text-xl text-foreground">
                    {formatPrice(r.pricePerNight)}
                    <span className="font-sans text-xs text-muted">{t.perNight}</span>
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={localePath(`/owner/residences/${r.id}`, locale)}><Pencil className="h-3.5 w-3.5" /> {t.manage}</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
