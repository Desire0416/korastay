import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mail, Phone, MapPin, Globe, FileText, Car, CookingPot, CheckCircle2, FileCheck2, Tags, ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setPartnerStatus } from "@/server/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminActions, type AdminAction } from "@/components/dashboard/admin-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { card, cardTitle } from "@/components/dashboard/styles";
import { verificationStatusMeta, partnerTypeMeta } from "@/lib/enums";
import { statusText } from "@/lib/dictionaries/enums";
import { formatPrice, parseJsonArray, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.community.partners.metaTitle };
}

const docLink =
  "inline-flex items-center gap-2 rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-sm font-semibold text-terracotta transition-colors hover:border-ink/35";

export default async function AdminPartnerDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const { id } = await params;
  const [partner, { locale, dict }] = await Promise.all([
    prisma.partnerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        services: true,
        _count: { select: { menuItems: true } },
      },
    }),
    getI18n(),
  ]);
  if (!partner) notFound();
  const t = dict.dashAdmin.community.partner;
  const isDriver = partner.type === "TRANSPORT";
  const isRestaurant = partner.type === "RESTAURANT";

  const languages = parseJsonArray(partner.languages);
  const zones = parseJsonArray(partner.zonesCovered);
  const dishes = partner._count.menuItems;

  const actions: AdminAction[] = [];
  if (partner.verificationStatus !== "VERIFIED") actions.push({ label: t.validate, fn: setPartnerStatus.bind(null, id, "VERIFIED"), variant: "primary" });
  if (partner.verificationStatus !== "REJECTED") actions.push({ label: t.reject, fn: setPartnerStatus.bind(null, id, "REJECTED"), variant: "danger", confirm: t.confirmReject });
  if (partner.verificationStatus === "VERIFIED") actions.push({ label: t.suspend, fn: setPartnerStatus.bind(null, id, "SUSPENDED"), variant: "outline" });

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={localePath("/admin/partners", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader
        title={partner.businessName}
        actions={
          <>
            <Badge tone="gold">{statusText(dict, partnerTypeMeta[partner.type]?.label ?? partner.type)}</Badge>
            <StatusBadge status={partner.verificationStatus} map={verificationStatusMeta} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <section className={cn(card, "p-5 sm:p-6")}>
            {partner.description && <p className="text-[15px] leading-relaxed text-foreground/85">{partner.description}</p>}
            <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <p className="flex items-center gap-2 text-foreground"><Mail className="h-4 w-4 shrink-0 text-muted" /> <span className="break-all">{partner.user.email}</span></p>
              {partner.user.phone && <p className="flex items-center gap-2 text-foreground"><Phone className="h-4 w-4 text-muted" /> {partner.user.phone}</p>}
              {partner.city && <p className="flex items-center gap-2 text-foreground"><MapPin className="h-4 w-4 text-muted" /> {partner.city}</p>}
              {languages.length > 0 && <p className="flex items-center gap-2 text-foreground"><Globe className="h-4 w-4 text-muted" /> {languages.join(", ")}</p>}
            </div>
            {zones.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {zones.map((z) => (
                  <span key={z} className="rounded-full bg-sand-50 px-3 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-sand-200">{z}</span>
                ))}
              </div>
            )}
          </section>

          {/* Justificatifs & configuration (onboarding) */}
          <section className={cn(card, "p-5 sm:p-6")}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className={cardTitle}>
                <FileCheck2 className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.docsTitle}
              </h2>
              {partner.onboardingCompletedAt ? (
                <Badge tone="success"><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> {t.configured}</Badge>
              ) : (
                <Badge tone="warning">{t.pending}</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {partner.idDocumentUrl ? (
                <a href={partner.idDocumentUrl} target="_blank" rel="noreferrer" className={docLink}><FileText className="h-4 w-4" /> {t.idDoc}</a>
              ) : (
                <span className="text-sm text-muted">{t.idDocMissing}</span>
              )}
              {isDriver && partner.drivingLicenseUrl && (
                <a href={partner.drivingLicenseUrl} target="_blank" rel="noreferrer" className={docLink}><FileText className="h-4 w-4" /> {t.license}</a>
              )}
            </div>
            {isDriver && partner.vehicleType && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-sand-50 px-4 py-3 text-sm text-foreground ring-1 ring-inset ring-sand-200">
                <Car className="h-4 w-4 text-muted" />
                {[partner.vehicleType, partner.vehicleBrand, partner.vehiclePlate, partner.vehicleSeats ? t.seats.replace("{n}", String(partner.vehicleSeats)) : null]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            )}
            {isRestaurant && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-sand-50 px-4 py-3 text-sm text-foreground ring-1 ring-inset ring-sand-200">
                <CookingPot className="h-4 w-4 text-muted" />
                {partner.cuisineType ? `${partner.cuisineType} · ` : ""}
                {(dishes > 1 ? t.dishMany : t.dishOne).replace("{n}", String(dishes))}
              </div>
            )}
          </section>

          {partner.services.length > 0 && (
            <section className={cn(card, "p-5 sm:p-6")}>
              <h2 className={cn(cardTitle, "mb-4")}>
                <Tags className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.servicesTitle}
              </h2>
              <div className="space-y-2">
                {partner.services.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl bg-sand-50 px-4 py-3 ring-1 ring-inset ring-sand-200">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{s.title}</p>
                      {s.description && <p className="line-clamp-2 text-xs text-muted">{s.description}</p>}
                    </div>
                    {s.priceFrom && <p className="shrink-0 text-sm font-bold text-foreground">{t.from.replace("{price}", formatPrice(s.priceFrom))}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside>
          <section className={cn(card, "p-5 lg:sticky lg:top-24")}>
            <h2 className={cn(cardTitle, "mb-4 text-lg")}>
              <ShieldCheck className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.validation}
            </h2>
            <AdminActions actions={actions} />
          </section>
        </aside>
      </div>
    </div>
  );
}
