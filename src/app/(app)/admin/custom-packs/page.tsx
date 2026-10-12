import Link from "next/link";
import { Wand2, MapPin, Users, Layers, CalendarDays, UserRound } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { card } from "@/components/dashboard/styles";
import { businessRequestStatusMeta } from "@/lib/enums";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.catalog.customPacks.metaTitle };
}

export default async function AdminCustomPacksPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const [requests, { locale, dict }] = await Promise.all([
    prisma.customPackRequest.findMany({ include: { _count: { select: { items: true } } }, orderBy: { createdAt: "desc" } }),
    getI18n(),
  ]);
  const t = dict.dashAdmin.catalog.customPacks;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t.title} description={t.subtitle} />
      {requests.length === 0 ? (
        <EmptyState icon={Wand2} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Link
              key={r.id}
              href={localePath(`/admin/custom-packs/${r.id}`, locale)}
              className={cn(card, "flex items-center justify-between gap-3 p-5 transition-all hover:-translate-y-0.5 hover:shadow-card")}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg leading-tight text-foreground">{r.reference}</h3>
                  <StatusBadge status={r.status} map={businessRequestStatusMeta} size="sm" />
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {r.cityName}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {r.persons}</span>
                  <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {t.services.replace("{n}", String(r._count.items))}</span>
                  <span className="flex items-center gap-1"><UserRound className="h-3.5 w-3.5" /> {r.contactName}</span>
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(r.createdAt, locale)}</span>
                </p>
              </div>
              <span className="shrink-0 font-display text-xl text-foreground">{formatPrice(r.estimatedTotal)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
