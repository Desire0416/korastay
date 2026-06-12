import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, Images, Calendar, ExternalLink, CheckCircle2, Users, BedDouble, Bath, Home } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getOwnerResidence } from "@/lib/owner-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { PublishToggle } from "@/components/dashboard/publish-toggle";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { Icon } from "@/components/ui/icon";
import { residenceStatusMeta, verificationStatusMeta, residenceTypeMeta } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";

type SP = Record<string, string | string[] | undefined>;

export default async function OwnerResidenceDetail({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<SP> }) {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const sp = await searchParams;
  const residence = await getOwnerResidence(user.id, id);
  if (!residence) notFound();

  const isPublished = residence.status === "PUBLISHED";
  const canPublish = ["PUBLISHED", "UNPUBLISHED"].includes(residence.status);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={residence.name}
        breadcrumbs={[{ label: "Mes résidences", href: "/owner/residences" }, { label: residence.name }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm"><Link href={`/owner/residences/${id}/edit`}><Pencil className="h-4 w-4" /> Modifier</Link></Button>
            <Button asChild variant="outline" size="sm"><Link href={`/owner/residences/${id}/photos`}><Images className="h-4 w-4" /> Photos</Link></Button>
            {canPublish && <PublishToggle id={id} published={isPublished} />}
          </div>
        }
      />

      {sp.created === "1" && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-success/30 bg-emerald-50 p-4">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <p className="text-sm text-success">Résidence créée ! Elle est en attente de validation par l'équipe KoraStay.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-border">
            <div className="aspect-[16/9]"><SmartImage src={residence.images[0]?.url} alt={residence.name} seed={`${residence.slug}-0`} /></div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <h3 className="mb-3 font-bold text-foreground">Caractéristiques</h3>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Feature icon={Home} label={residenceTypeMeta[residence.type]?.label ?? residence.type} />
              <Feature icon={Users} label={`${residence.capacity} voyageurs`} />
              <Feature icon={BedDouble} label={`${residence.bedrooms} chambres`} />
              <Feature icon={Bath} label={`${residence.bathrooms} sdb`} />
            </div>
            {residence.amenities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {residence.amenities.map((ra) => (
                  <span key={ra.id} className="inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1 text-xs font-medium text-foreground">
                    <Icon name={ra.amenity.icon} className="h-3.5 w-3.5 text-brand-600" /> {ra.amenity.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <h3 className="mb-2 font-bold text-foreground">Description</h3>
            <p className="whitespace-pre-line text-sm text-foreground/90">{residence.description}</p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <p className="text-sm text-muted">Statut</p>
            <div className="mt-1.5 flex flex-col gap-2">
              <StatusBadge status={residence.status} map={residenceStatusMeta} />
              <StatusBadge status={residence.verificationStatus} map={verificationStatusMeta} />
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-sm text-muted">Prix par nuit</p>
              <p className="text-2xl font-extrabold text-foreground">{formatPrice(residence.pricePerNight)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start"><Link href={`/owner/calendar`}><Calendar className="h-4 w-4" /> Gérer le calendrier</Link></Button>
            {isPublished && (
              <Button asChild variant="ghost" className="w-full justify-start"><Link href={`/residences/${residence.slug}`} target="_blank"><ExternalLink className="h-4 w-4" /> Voir la fiche publique</Link></Button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof Home; label: string }) {
  return (
    <div className="flex items-center gap-2 text-foreground">
      <Icon className="h-4 w-4 text-muted" /> {label}
    </div>
  );
}
