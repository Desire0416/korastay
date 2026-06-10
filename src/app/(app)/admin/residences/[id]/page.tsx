import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, BedDouble, Bath, ExternalLink, User, Pencil, Images, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ResidenceValidationPanel } from "@/components/dashboard/residence-validation-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { SmartImage } from "@/components/ui/smart-image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { residenceStatusMeta, verificationStatusMeta } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";

type SP = Record<string, string | string[] | undefined>;

export default async function AdminResidenceDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SP> }) {
  const user = await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const { id } = await params;
  const sp = await searchParams;
  const canEdit = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const residence = await prisma.residence.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      amenities: { include: { amenity: true } },
      owner: { select: { firstName: true, lastName: true, email: true, phone: true } },
    },
  });
  if (!residence) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/residences" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Residences
      </Link>
      <PageHeader
        title={residence.name}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canEdit && (
              <>
                <Button asChild variant="outline" size="sm"><Link href={`/admin/residences/${id}/edit`}><Pencil className="h-4 w-4" /> Modifier</Link></Button>
                <Button asChild variant="outline" size="sm"><Link href={`/admin/residences/${id}/photos`}><Images className="h-4 w-4" /> Photos</Link></Button>
              </>
            )}
            <StatusBadge status={residence.status} map={residenceStatusMeta} />
          </div>
        }
      />

      {sp.created === "1" && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-success/30 bg-emerald-50 p-4">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <p className="text-sm text-success">Residence creee avec succes.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2">
            {residence.images.slice(0, 6).map((img, i) => (
              <div key={img.id} className={`overflow-hidden rounded-2xl ${i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"}`}>
                <SmartImage src={img.url} alt="" seed={`${residence.slug}-${i}`} />
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground">
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-muted" /> {residence.capacity} voyageurs</span>
              <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-muted" /> {residence.bedrooms} chambres</span>
              <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-muted" /> {residence.bathrooms} sdb</span>
              <span className="font-bold">{formatPrice(residence.pricePerNight)}/nuit</span>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm text-foreground/90">{residence.description}</p>
            {residence.amenities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {residence.amenities.map((ra) => (
                  <span key={ra.id} className="inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1 text-xs font-medium">
                    <Icon name={ra.amenity.icon} className="h-3.5 w-3.5 text-brand-600" /> {ra.amenity.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <h3 className="mb-2 flex items-center gap-2 font-bold text-foreground"><User className="h-4 w-4 text-brand-600" /> Proprietaire</h3>
            <p className="text-sm font-semibold text-foreground">{residence.owner.firstName} {residence.owner.lastName}</p>
            <p className="text-sm text-muted">{residence.owner.email}</p>
            {residence.owner.phone && <p className="text-sm text-muted">{residence.owner.phone}</p>}
          </div>

          <ResidenceValidationPanel id={residence.id} status={residence.status} />

          {residence.status === "PUBLISHED" && (
            <Link href={`/residences/${residence.slug}`} target="_blank" className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground hover:bg-surface-soft">
              <ExternalLink className="h-4 w-4" /> Voir la fiche publique
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
