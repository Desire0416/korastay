import { Star } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getOwnerReviews } from "@/lib/owner-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { RatingStars } from "@/components/ui/rating-stars";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ReviewReplyForm } from "@/components/dashboard/review-reply-form";
import { card } from "@/components/dashboard/styles";
import { formatDate, initials } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashOwner.reviews.metaTitle };
}

export default async function OwnerReviewsPage() {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const [reviews, { locale, dict }] = await Promise.all([getOwnerReviews(user.id), getI18n()]);
  const t = dict.dashOwner.reviews;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t.title} description={t.subtitle} />
      {reviews.length === 0 ? (
        <EmptyState icon={Star} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <figure key={r.id} className={`${card} p-5 sm:p-6`}>
              <figcaption className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{initials(r.author.firstName, r.author.lastName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg leading-tight text-foreground">{r.author.firstName} {r.author.lastName}</p>
                  <p className="truncate text-xs text-muted">{r.residence?.name} · {formatDate(r.createdAt, locale)}</p>
                </div>
                <RatingStars value={r.rating} showValue={false} size="sm" />
              </figcaption>
              {r.comment && <blockquote className="mt-3 text-[15px] leading-relaxed text-foreground/85">{r.comment}</blockquote>}
              <ReviewReplyForm reviewId={r.id} existingReply={r.ownerReply} />
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
