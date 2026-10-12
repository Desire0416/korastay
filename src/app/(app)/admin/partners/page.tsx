import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Handshake, MapPin, UserRound, Tags } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { card } from "@/components/dashboard/styles";
import { verificationStatusMeta, partnerTypeMeta, toFilterOptions } from "@/lib/enums";
import { statusText } from "@/lib/dictionaries/enums";
import { cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.community.partners.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminPartnersPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const type = str(sp.type);
  const q = str(sp.q)?.trim();

  const where: Prisma.PartnerProfileWhereInput = {};
  if (status) where.verificationStatus = status;
  if (type) where.type = type;
  if (q) {
    where.OR = [
      { businessName: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { user: { is: { OR: [{ firstName: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } } },
    ];
  }

  const [partners, { locale, dict }] = await Promise.all([
    prisma.partnerProfile.findMany({
      where,
      include: { user: { select: { firstName: true, lastName: true, email: true } }, _count: { select: { services: true, missions: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getI18n(),
  ]);
  const t = dict.dashAdmin.community.partners;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={t.title} description={t.subtitle} />

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: t.searchPlaceholder },
          { type: "select", name: "status", label: t.allStatuses, options: toFilterOptions(verificationStatusMeta, ["PENDING_REVIEW", "VERIFIED", "NEEDS_CHANGES", "REJECTED", "SUSPENDED"]) },
          { type: "select", name: "type", label: t.allTypes, options: toFilterOptions(partnerTypeMeta) },
        ]}
      />

      {partners.length === 0 ? (
        <EmptyState icon={Handshake} title={t.empty} />
      ) : (
        <div className="space-y-3">
          {partners.map((p) => (
            <Link
              key={p.id}
              href={localePath(`/admin/partners/${p.id}`, locale)}
              className={cn(card, "flex items-center justify-between gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-card sm:p-5")}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg leading-tight text-foreground">{p.businessName}</h3>
                  <Badge tone="gold" size="sm">{statusText(dict, partnerTypeMeta[p.type]?.label ?? p.type)}</Badge>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  {p.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {p.city}</span>}
                  <span className="flex items-center gap-1"><UserRound className="h-3.5 w-3.5" /> {p.user.firstName} {p.user.lastName}</span>
                  <span className="flex items-center gap-1"><Tags className="h-3.5 w-3.5" /> {t.services.replace("{n}", String(p._count.services))}</span>
                </p>
              </div>
              <StatusBadge status={p.verificationStatus} map={verificationStatusMeta} size="sm" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
