import { Star } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getOwnerReviews } from "@/lib/owner-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { RatingStars } from "@/components/ui/rating-stars";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ReviewReplyForm } from "@/components/dashboard/review-reply-form";

export const metadata = { title: "Avis recus" };

export default async function OwnerReviewsPage() {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const reviews = await getOwnerReviews(user.id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Avis recus" description="Les retours de vos voyageurs." />
      {reviews.length === 0 ? (
        <EmptyState icon={Star} title="Aucun avis" description="Les avis de vos voyageurs apparaitront ici apres leurs sejours." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback>{initials(r.author.firstName, r.author.lastName)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <p className="font-bold text-foreground">{r.author.firstName} {r.author.lastName}</p>
                  <p className="text-xs text-muted">{r.residence?.name} - {formatDate(r.createdAt)}</p>
                </div>
                <RatingStars value={r.rating} showValue={false} size="sm" />
              </div>
              {r.comment && <p className="mt-3 text-sm text-foreground/90">{r.comment}</p>}
              <ReviewReplyForm reviewId={r.id} existingReply={r.ownerReply} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
