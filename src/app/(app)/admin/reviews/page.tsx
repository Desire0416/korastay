import type { Prisma } from "@prisma/client";
import { Star } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { moderateReview } from "@/server/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { RatingStars } from "@/components/ui/rating-stars";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { card } from "@/components/dashboard/styles";
import { formatDate, initials } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.catalog.reviews.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const sp = await searchParams;
  const status = str(sp.status);
  const rating = str(sp.rating);
  const q = str(sp.q)?.trim();

  const where: Prisma.ReviewWhereInput = {};
  if (status) where.status = status;
  if (rating) where.rating = Number(rating);
  if (q) {
    where.OR = [
      { comment: { contains: q, mode: "insensitive" } },
      { author: { is: { OR: [{ firstName: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }] } } },
      { residence: { is: { name: { contains: q, mode: "insensitive" } } } },
      { pack: { is: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [reviews, { locale, dict }] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { author: { select: { firstName: true, lastName: true } }, residence: { select: { name: true } }, pack: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    getI18n(),
  ]);
  const t = dict.dashAdmin.catalog.reviews;
  const statusLabel = (s: string) => (s === "PUBLISHED" ? t.published : s === "HIDDEN" ? t.hidden : t.deleted);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t.title} description={t.subtitle} />

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: t.searchPlaceholder },
          {
            type: "select",
            name: "status",
            label: t.allStatuses,
            options: [{ value: "PUBLISHED", label: t.published }, { value: "HIDDEN", label: t.hidden }, { value: "DELETED", label: t.deleted }],
          },
          {
            type: "select",
            name: "rating",
            label: t.allRatings,
            options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: (n > 1 ? t.stars : t.star).replace("{n}", String(n)) })),
          },
        ]}
      />

      {reviews.length === 0 ? (
        <EmptyState icon={Star} title={t.emptyTitle} />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <figure key={r.id} className={`${card} p-5 sm:p-6`}>
              <figcaption className="flex flex-wrap items-center gap-3">
                <Avatar>
                  <AvatarFallback>{initials(r.author.firstName, r.author.lastName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg leading-tight text-foreground">{r.author.firstName} {r.author.lastName}</p>
                  <p className="truncate text-xs text-muted">{r.residence?.name ?? r.pack?.name} · {formatDate(r.createdAt, locale)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <RatingStars value={r.rating} showValue={false} size="sm" />
                  <Badge tone={r.status === "PUBLISHED" ? "success" : r.status === "HIDDEN" ? "warning" : "danger"} size="sm">{statusLabel(r.status)}</Badge>
                </div>
              </figcaption>
              {r.comment && <blockquote className="mt-3 text-[15px] leading-relaxed text-foreground/85">{r.comment}</blockquote>}
              <div className="mt-4">
                <AdminActions
                  actions={[
                    ...(r.status !== "PUBLISHED" ? [{ label: t.publish, fn: moderateReview.bind(null, r.id, "PUBLISHED"), variant: "soft" as const }] : []),
                    ...(r.status !== "HIDDEN" ? [{ label: t.hide, fn: moderateReview.bind(null, r.id, "HIDDEN"), variant: "outline" as const }] : []),
                    ...(r.status !== "DELETED"
                      ? [{ label: t.delete, fn: moderateReview.bind(null, r.id, "DELETED"), variant: "outline" as const, confirm: t.confirmDelete }]
                      : []),
                  ]}
                />
              </div>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
