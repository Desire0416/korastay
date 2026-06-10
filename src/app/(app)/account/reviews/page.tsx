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

export const metadata = { title: "Mes avis" };

type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = str(sp.q)?.trim().toLowerCase();
  const rating = str(sp.rating);
  const [reviewable, allReviews] = await Promise.all([
    getReviewableReservations(user.id),
    getTravelerReviews(user.id),
  ]);

  const reviews = allReviews.filter(
    (r) =>
      (!rating || r.rating === Number(rating)) &&
      (!q ||
        (r.residence?.name ?? "").toLowerCase().includes(q) ||
        (r.pack?.name ?? "").toLowerCase().includes(q) ||
        (r.comment ?? "").toLowerCase().includes(q))
  );

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Mes avis" description="Partagez votre experience apres chaque sejour." />

      {/* A evaluer */}
      {reviewable.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-bold text-foreground">A evaluer ({reviewable.length})</h2>
          <div className="space-y-3">
            {reviewable.map((r) => {
              const title = r.residence?.name ?? r.pack?.name ?? "Sejour";
              return (
                <div key={r.id} className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-4 shadow-soft">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                    <SmartImage src={r.residence?.images[0]?.url} alt={title} seed={`${r.id}-0`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground">{title}</p>
                    <p className="text-sm text-muted">Sejour termine le {formatDate(r.endDate)}</p>
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
        <h2 className="mb-3 text-lg font-bold text-foreground">Avis publies ({allReviews.length})</h2>

        {allReviews.length > 0 && (
          <FilterBar
            fields={[
              { type: "search", name: "q", placeholder: "Residence, pack, commentaire..." },
              { type: "select", name: "rating", label: "Toutes les notes", options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} etoile${n > 1 ? "s" : ""}` })) },
            ]}
          />
        )}

        {allReviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="Aucun avis publie"
            description="Apres un sejour, partagez votre experience pour aider les autres voyageurs."
          />
        ) : reviews.length === 0 ? (
          <EmptyState icon={Star} title="Aucun resultat" description="Aucun avis ne correspond a ces criteres." />
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-foreground">
                    {review.residence?.name ?? review.pack?.name}
                  </p>
                  <RatingStars value={review.rating} showValue={false} size="sm" />
                </div>
                {review.comment && <p className="mt-2 text-sm text-foreground/90">{review.comment}</p>}
                <p className="mt-2 text-xs text-muted">Publie le {formatDate(review.createdAt)}</p>
                {review.ownerReply && (
                  <div className="mt-3 rounded-2xl bg-surface-soft p-3 text-sm">
                    <p className="font-semibold text-foreground">Reponse de l'hote</p>
                    <p className="text-muted">{review.ownerReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
