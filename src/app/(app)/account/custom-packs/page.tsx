import Link from "next/link";
import { Wand2, MapPin, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getUserCustomPacks } from "@/lib/custom-pack-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { AcceptCustomPackButton } from "@/components/dashboard/accept-custom-pack-button";
import { businessRequestStatusMeta, partnerTypeMeta } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";
import { FileText, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Mes packs personnalises" };

export default async function AccountCustomPacksPage() {
  const user = await requireUser();
  const requests = await getUserCustomPacks(user.id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Mes packs personnalises"
        description="Vos paniers d'experiences composes sur mesure."
        actions={<Button asChild><Link href="/packs/custom"><Wand2 className="h-4 w-4" /> Composer un pack</Link></Button>}
      />
      {requests.length === 0 ? (
        <EmptyState
          icon={Wand2}
          title="Aucun pack personnalise"
          description="Composez un sejour sur mesure avec les activites et partenaires d'une ville."
          action={<Button asChild><Link href="/packs/custom">Composer mon pack</Link></Button>}
        />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-foreground">{r.reference}</h3>
                  <StatusBadge status={r.status} map={businessRequestStatusMeta} size="sm" />
                </div>
                <span className="font-extrabold text-foreground">{formatPrice(r.estimatedTotal)}</span>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {r.cityName}</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {r.persons} voyageur(s)</span>
                <span>{formatDate(r.createdAt)}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.items.map((it) => (
                  <span key={it.id} className="rounded-full bg-surface-soft px-2.5 py-1 text-xs text-foreground">
                    {it.label}{it.partnerType ? ` · ${partnerTypeMeta[it.partnerType]?.label ?? it.partnerType}` : ""}
                  </span>
                ))}
              </div>

              {/* Devis */}
              {r.status === "QUOTED" && r.quoteAmount != null && (
                <div className="mt-4 rounded-2xl border border-brand-300 bg-brand-50/50 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-foreground"><FileText className="h-4 w-4 text-brand-600" /> Devis recu</p>
                  <p className="mt-1 text-2xl font-extrabold text-foreground">{formatPrice(r.quoteAmount)}</p>
                  {r.quoteMessage && <p className="mt-1 text-sm text-foreground/90">{r.quoteMessage}</p>}
                  <div className="mt-3"><AcceptCustomPackButton id={r.id} /></div>
                </div>
              )}
              {r.reservationId && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-success/30 bg-emerald-50 p-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 className="h-4 w-4" /> Pack confirme</span>
                  <Button asChild variant="outline" size="sm"><Link href={`/account/bookings/${r.reservationId}`}>Voir ma reservation</Link></Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
