import { Star } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getReviewableReservations, getTravelerReviews } from "@/lib/account-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { WriteReviewButton } from "@/components/dashboard/write-review-button";
import { RatingStars } from "@/components/ui/rating-stars";
import { SmartImage } from "@/components/ui/smart-image";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAccount.reviews.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = str(sp.q)?.trim().toLowerCase();
  const rating = str(sp.rating);
  const [reviewable, allReviews, { locale, dict }] = await Promise.all([
    getReviewableReservations(user.id),
    getTravelerReviews(user.id),
    getI18n(),
  ]);
  const t = dict.dashAccount.reviews;

  const reviews = allReviews.filter(
    (r) =>
      (!rating || r.rating === Number(rating)) &&
      (!q ||
        (r.residence?.name ?? "").toLowerCase().includes(q) ||
        (r.pack?.name ?? "").toLowerCase().includes(q) ||
        (r.comment ?? "").toLowerCase().includes(q))
  );

  const card = "rounded-[1.5rem] border border-border/80 bg-surface shadow-soft";

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t.title} description={t.subtitle} />

      {/* A evaluer */}
      {reviewable.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-2 font-display text-[1.45rem] font-normal text-foreground">
            {t.toReview} <span className="font-sans text-sm text-muted">({reviewable.length})</span>
          </h2>
          <div className="space-y-3">
            {reviewable.map((r) => {
              const title = r.residence?.name ?? r.pack?.name ?? t.stay;
              return (
                <div key={r.id} className={`flex items-center gap-4 p-4 ${card}`}>
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-arch-sm">
                    <SmartImage src={r.residence?.images[0]?.url} alt={title} seed={`${r.id}-0`} sizes="64px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg text-foreground">{title}</p>
                    <p className="text-sm text-muted">{t.stayEnded.replace("{date}", formatDate(r.endDate, locale))}</p>
                  </div>
                  <WriteReviewButton reservationId={r.id} label={title} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Avis publies */}
      <section>
        <h2 className="mb-4 flex items-baseline gap-2 font-display text-[1.45rem] font-normal text-foreground">
          {t.published} <span className="font-sans text-sm text-muted">({allReviews.length})</span>
        </h2>

        {allReviews.length > 0 && (
          <FilterBar
            fields={[
              { type: "search", name: "q", placeholder: t.searchPlaceholder },
              {
                type: "select",
                name: "rating",
                label: t.allRatings,
                options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: (n > 1 ? t.stars : t.star).replace("{n}", String(n)) })),
              },
            ]}
          />
        )}

        {allReviews.length === 0 ? (
          <EmptyState icon={Star} title={t.emptyTitle} description={t.emptyText} />
        ) : reviews.length === 0 ? (
          <EmptyState icon={Star} title={t.noResultTitle} description={t.noResultText} />
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <figure key={review.id} className={`p-5 sm:p-6 ${card}`}>
                <figcaption className="flex items-center justify-between gap-3">
                  <p className="font-display text-lg text-foreground">{review.residence?.name ?? review.pack?.name}</p>
                  <RatingStars value={review.rating} showValue={false} size="sm" />
                </figcaption>
                {review.comment && <blockquote className="mt-2 text-[15px] leading-relaxed text-foreground/85">{review.comment}</blockquote>}
                <p className="mt-3 text-xs text-muted">{t.publishedOn.replace("{date}", formatDate(review.createdAt, locale))}</p>
                {review.ownerReply && (
                  <div className="mt-4 rounded-xl bg-sand-50 p-4 text-sm ring-1 ring-inset ring-sand-200">
                    <p className="eyebrow text-[9.5px] text-terracotta">{t.hostReply}</p>
                    <p className="mt-1 leading-relaxed text-foreground/80">{review.ownerReply}</p>
                  </div>
                )}
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
