import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, BedDouble, Bath, ExternalLink, UserRound, Pencil, Images, CheckCircle2, Mail, Phone } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ResidenceValidationPanel } from "@/components/dashboard/residence-validation-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { SmartImage } from "@/components/ui/smart-image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { card, cardTitle } from "@/components/dashboard/styles";
import { residenceStatusMeta } from "@/lib/enums";
import { formatPrice, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.catalog.residences.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;

export default async function AdminResidenceDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SP> }) {
  const user = await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const { id } = await params;
  const sp = await searchParams;
  const canEdit = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const [residence, { locale, dict }] = await Promise.all([
    prisma.residence.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        amenities: { include: { amenity: true } },
        owner: { select: { firstName: true, lastName: true, email: true, phone: true } },
      },
    }),
    getI18n(),
  ]);
  if (!residence) notFound();
  const t = dict.dashAdmin.catalog.residence;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href={localePath("/admin/residences", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader
        title={residence.name}
        description={residence.city}
        actions={
          <>
            {canEdit && (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href={localePath(`/admin/residences/${id}/edit`, locale)}><Pencil className="h-4 w-4" /> {t.edit}</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={localePath(`/admin/residences/${id}/photos`, locale)}><Images className="h-4 w-4" /> {t.photos}</Link>
                </Button>
              </>
            )}
            <StatusBadge status={residence.status} map={residenceStatusMeta} />
          </>
        }
      />

      {sp.created === "1" && (
        <div className="mb-6 flex items-center gap-3 rounded-[1.25rem] bg-brand-50 p-4 text-brand-800 ring-1 ring-inset ring-brand-200/70">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-sm font-medium">{t.created}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-2">
            {residence.images.slice(0, 6).map((img, i) => (
              <div key={img.id} className={cn("overflow-hidden rounded-[1.1rem]", i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square")}>
                <SmartImage src={img.url} alt="" seed={`${residence.slug}-${i}`} sizes={i === 0 ? "(max-width: 1024px) 66vw, 440px" : "220px"} />
              </div>
            ))}
          </div>

          <section className={cn(card, "p-5 sm:p-6")}>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-foreground">
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-muted" /> {t.guests.replace("{n}", String(residence.capacity))}</span>
              <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-muted" /> {t.bedrooms.replace("{n}", String(residence.bedrooms))}</span>
              <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-muted" /> {t.baths.replace("{n}", String(residence.bathrooms))}</span>
              <span className="font-display text-lg">{t.perNight.replace("{price}", formatPrice(residence.pricePerNight))}</span>
            </div>
            <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">{residence.description}</p>
            {residence.amenities.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {residence.amenities.map((ra) => (
                  <span key={ra.id} className="inline-flex items-center gap-1.5 rounded-full bg-sand-50 px-3 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-sand-200">
                    <Icon name={ra.amenity.icon} className="h-3.5 w-3.5 text-brand-600" /> {dict.enums.amenity[ra.amenity.slug] ?? ra.amenity.name}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className={cn(card, "p-5")}>
            <h2 className={cn(cardTitle, "mb-3 text-lg")}>
              <UserRound className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.owner}
            </h2>
            <p className="font-semibold text-foreground">{residence.owner.firstName} {residence.owner.lastName}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><Mail className="h-3.5 w-3.5" /> {residence.owner.email}</p>
            {residence.owner.phone && <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted"><Phone className="h-3.5 w-3.5" /> {residence.owner.phone}</p>}
          </section>

          <ResidenceValidationPanel id={residence.id} status={residence.status} />

          {residence.status === "PUBLISHED" && (
            <Button asChild variant="outline" className="w-full">
              <Link href={localePath(`/residences/${residence.slug}`, locale)} target="_blank"><ExternalLink className="h-4 w-4" /> {t.viewPublic}</Link>
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
}
