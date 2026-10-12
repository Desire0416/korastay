import Link from "next/link";
import { HeartOff, Compass } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getTravelerFavorites } from "@/lib/account-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { ResidenceCard } from "@/components/public/residence-card";
import { PackCard } from "@/components/public/pack-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAccount.favorites.metaTitle };
}

export default async function FavoritesPage() {
  const user = await requireUser();
  const [{ residences, packs }, { locale, dict }] = await Promise.all([getTravelerFavorites(user.id), getI18n()]);
  const t = dict.dashAccount.favorites;
  const empty = residences.length === 0 && packs.length === 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={t.title} description={t.subtitle} />

      {empty ? (
        <EmptyState
          icon={HeartOff}
          title={t.emptyTitle}
          description={t.emptyText}
          action={<Button asChild><Link href={localePath("/residences", locale)}><Compass className="h-4 w-4" /> {t.explore}</Link></Button>}
        />
      ) : (
        <div className="space-y-12">
          {residences.length > 0 && (
            <section>
              <h2 className="mb-5 flex items-baseline gap-2 font-display text-[1.45rem] font-normal text-foreground">
                {t.homes} <span className="font-sans text-sm text-muted">({residences.length})</span>
              </h2>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {residences.map((r) => (
                  <ResidenceCard key={r.id} residence={r} favorited />
                ))}
              </div>
            </section>
          )}
          {packs.length > 0 && (
            <section>
              <h2 className="mb-5 flex items-baseline gap-2 font-display text-[1.45rem] font-normal text-foreground">
                {t.packs} <span className="font-sans text-sm text-muted">({packs.length})</span>
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {packs.map((p) => (
                  <PackCard key={p.id} pack={p} favorited />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
