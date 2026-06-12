import type { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { moderateReview } from "@/server/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { RatingStars } from "@/components/ui/rating-stars";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Star } from "lucide-react";
import { formatDate, initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const metadata = { title: "Avis - Admin" };

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

  const reviews = await prisma.review.findMany({
    where,
    include: { author: { select: { firstName: true, lastName: true } }, residence: { select: { name: true } }, pack: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Moderation des avis" description="Masquez ou supprimez les avis inappropries." />

      <FilterBar
        fields={[
          { type: "search", name: "q", placeholder: "Auteur, commentaire, résidence..." },
          { type: "select", name: "status", label: "Tous les statuts", options: [{ value: "PUBLISHED", label: "Publié" }, { value: "HIDDEN", label: "Masque" }, { value: "DELETED", label: "Supprimé" }] },
          { type: "select", name: "rating", label: "Toutes les notes", options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} etoile${n > 1 ? "s" : ""}` })) },
        ]}
      />

      {reviews.length === 0 ? (
        <EmptyState icon={Star} title="Aucun avis" />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback>{initials(r.author.firstName, r.author.lastName)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <p className="font-bold text-foreground">{r.author.firstName} {r.author.lastName}</p>
                  <p className="text-xs text-muted">{r.residence?.name ?? r.pack?.name} - {formatDate(r.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <RatingStars value={r.rating} showValue={false} size="sm" />
                  <Badge tone={r.status === "PUBLISHED" ? "success" : r.status === "HIDDEN" ? "warning" : "danger"}>
                    {r.status === "PUBLISHED" ? "Publié" : r.status === "HIDDEN" ? "Masque" : "Supprimé"}
                  </Badge>
                </div>
              </div>
              {r.comment && <p className="mt-3 text-sm text-foreground/90">{r.comment}</p>}
              <div className="mt-4">
                <AdminActions
                  actions={[
                    ...(r.status !== "PUBLISHED" ? [{ label: "Publier", fn: moderateReview.bind(null, r.id, "PUBLISHED"), variant: "soft" as const }] : []),
                    ...(r.status !== "HIDDEN" ? [{ label: "Masquer", fn: moderateReview.bind(null, r.id, "HIDDEN"), variant: "outline" as const }] : []),
                    ...(r.status !== "DELETED" ? [{ label: "Supprimer", fn: moderateReview.bind(null, r.id, "DELETED"), variant: "outline" as const, confirm: "Supprimer cet avis ?" }] : []),
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
