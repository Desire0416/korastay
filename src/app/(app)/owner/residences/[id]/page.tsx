import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, Images, Calendar, ExternalLink, CheckCircle2, Users, BedDouble, Bath, Home, Sparkles, AlignLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getOwnerResidence } from "@/lib/owner-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { PublishToggle } from "@/components/dashboard/publish-toggle";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { Icon } from "@/components/ui/icon";
import { card, cardTitle } from "@/components/dashboard/styles";
import { residenceStatusMeta, verificationStatusMeta, residenceTypeMeta } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashOwner.residences.metaTitle };
}

type SP = Record<string, string | string[] | undefined>;

export default async function OwnerResidenceDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SP>;
}) {
  const user = await requireRole(["OWNER", "ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const sp = await searchParams;
  const [residence, { locale, dict }] = await Promise.all([getOwnerResidence(user.id, id), getI18n()]);
  if (!residence) notFound();
  const t = dict.dashOwner.residence;

  const isPublished = residence.status === "PUBLISHED";
  const canPublish = ["PUBLISHED", "UNPUBLISHED"].includes(residence.status);
  const typeLabel = dict.enums.residenceType[residence.type] ?? residenceTypeMeta[residence.type]?.label ?? residence.type;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={residence.name}
        breadcrumbs={[{ label: dict.dashOwner.residences.title, href: "/owner/residences" }, { label: residence.name }]}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={localePath(`/owner/residences/${id}/edit`, locale)}><Pencil className="h-4 w-4" /> {t.edit}</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={localePath(`/owner/residences/${id}/photos`, locale)}><Images className="h-4 w-4" /> {t.photos}</Link>
            </Button>
            {canPublish && <PublishToggle id={id} published={isPublished} />}
          </>
        }
      />

      {sp.created === "1" && (
        <div className="mb-6 flex items-center gap-3 rounded-[1.25rem] bg-brand-50 p-4 text-brand-800 ring-1 ring-inset ring-brand-200/70">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-sm font-medium">{t.created}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[1.75rem] border border-border/80 shadow-soft">
            <div className="aspect-[16/9]">
              <SmartImage src={residence.images[0]?.url} alt={residence.name} seed={`${residence.slug}-0`} priority sizes="(max-width: 1024px) 100vw, 700px" />
            </div>
          </div>

          <section className={`${card} p-5 sm:p-6`}>
            <h2 className={`${cardTitle} mb-4`}>
              <Sparkles className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.features}
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Feature icon={Home} label={typeLabel} />
              <Feature icon={Users} label={t.guests.replace("{n}", String(residence.capacity))} />
              <Feature icon={BedDouble} label={t.bedrooms.replace("{n}", String(residence.bedrooms))} />
              <Feature icon={Bath} label={t.baths.replace("{n}", String(residence.bathrooms))} />
            </div>
            {residence.amenities.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {residence.amenities.map((ra) => (
                  <span key={ra.id} className="inline-flex items-center gap-1.5 rounded-full bg-sand-50 px-3 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-sand-200">
                    <Icon name={ra.amenity.icon} className="h-3.5 w-3.5 text-brand-600" />
                    {dict.enums.amenity[ra.amenity.slug] ?? ra.amenity.name}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className={`${card} p-5 sm:p-6`}>
            <h2 className={`${cardTitle} mb-3`}>
              <AlignLeft className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.description}
            </h2>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">{residence.description}</p>
          </section>
        </div>

        <aside className="space-y-4">
          <div className={`${card} p-5`}>
            <p className="eyebrow text-[9.5px] text-muted">{t.status}</p>
            <div className="mt-2 flex flex-col items-start gap-2">
              <StatusBadge status={residence.status} map={residenceStatusMeta} />
              <StatusBadge status={residence.verificationStatus} map={verificationStatusMeta} />
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <p className="eyebrow text-[9.5px] text-muted">{t.pricePerNight}</p>
              <p className="mt-1 font-display text-[2rem] leading-none text-foreground">{formatPrice(residence.pricePerNight)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={localePath("/owner/calendar", locale)}><Calendar className="h-4 w-4" /> {t.manageCalendar}</Link>
            </Button>
            {isPublished && (
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href={localePath(`/residences/${residence.slug}`, locale)} target="_blank"><ExternalLink className="h-4 w-4" /> {t.viewPublic}</Link>
              </Button>
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
      <Icon className="h-4 w-4 shrink-0 text-muted" /> {label}
    </div>
  );
}
