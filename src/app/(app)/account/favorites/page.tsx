import Link from "next/link";
import { HeartOff, Compass } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getTravelerFavorites } from "@/lib/account-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { ResidenceCard } from "@/components/public/residence-card";
import { PackCard } from "@/components/public/pack-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Mes favoris" };

export default async function FavoritesPage() {
  const user = await requireUser();
  const { residences, packs } = await getTravelerFavorites(user.id);
  const empty = residences.length === 0 && packs.length === 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Mes favoris" description="Vos residences et packs sauvegardes." />

      {empty ? (
        <EmptyState
          icon={HeartOff}
          title="Aucun favori pour le moment"
          description="Touchez le coeur sur une residence ou un pack pour le retrouver ici."
          action={<Button asChild><Link href="/residences"><Compass className="h-4 w-4" /> Explorer</Link></Button>}
        />
      ) : (
        <div className="space-y-10">
          {residences.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold text-foreground">Residences ({residences.length})</h2>
              <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {residences.map((r) => (
                  <ResidenceCard key={r.id} residence={r} favorited />
                ))}
              </div>
            </section>
          )}
          {packs.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold text-foreground">Packs ({packs.length})</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
