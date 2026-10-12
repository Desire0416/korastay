import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Users, Calendar, Mail, Phone, ExternalLink, Layers, CheckCircle2, Settings2, UserRound } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getCustomPackRequest } from "@/lib/custom-pack-queries";
import { setCustomPackStatus } from "@/server/actions/custom-pack";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { CustomPackQuoteForm, ConvertCustomPackButton } from "@/components/dashboard/custom-pack-admin";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { card, cardTitle } from "@/components/dashboard/styles";
import { businessRequestStatusMeta, partnerTypeMeta } from "@/lib/enums";
import { statusText } from "@/lib/dictionaries/enums";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.catalog.customPacks.metaTitle };
}

export default async function AdminCustomPackDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const { id } = await params;
  const [req, { locale, dict }] = await Promise.all([getCustomPackRequest(id), getI18n()]);
  if (!req) notFound();
  const t = dict.dashAdmin.catalog.customPack;

  const actions = ["IN_REVIEW", "CONFIRMED", "CANCELLED"].map((s) => ({
    label: statusText(dict, businessRequestStatusMeta[s].label),
    fn: setCustomPackStatus.bind(null, id, s),
    variant: (s === "CONFIRMED" ? "primary" : s === "CANCELLED" ? "outline" : "soft") as "primary" | "soft" | "outline",
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={localePath("/admin/custom-packs", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader title={t.title.replace("{ref}", req.reference)} actions={<StatusBadge status={req.status} map={businessRequestStatusMeta} />} />

      <div className="space-y-6">
        <section className={cn(card, "p-5 sm:p-6")}>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <Info icon={MapPin} label={t.destination} value={req.cityName} />
            <Info icon={Users} label={t.travelers} value={String(req.persons)} />
            {req.startDate && <Info icon={Calendar} label={t.wishedDate} value={formatDate(req.startDate, locale)} />}
            <Info icon={Calendar} label={t.createdAt} value={formatDate(req.createdAt, locale)} />
            <Info icon={UserRound} label={t.contact} value={req.contactName} />
            <Info icon={Mail} label={t.email} value={req.email} />
            {req.phone && <Info icon={Phone} label={t.phone} value={req.phone} />}
          </div>
          {req.notes && <p className="mt-5 whitespace-pre-line border-t border-border pt-5 text-[15px] leading-relaxed text-foreground/85">{req.notes}</p>}
        </section>

        <section className={cn(card, "p-5 sm:p-6")}>
          <h2 className={cn(cardTitle, "mb-4")}>
            <Layers className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.services}
          </h2>
          <ul className="space-y-2">
            {req.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 rounded-xl bg-sand-50 px-4 py-2.5 text-sm ring-1 ring-inset ring-sand-200">
                <span className="min-w-0">
                  <span className="font-semibold text-foreground">{it.label}</span>
                  <span className="ml-2 text-muted">{it.partnerName}</span>
                  {it.partnerType && (
                    <Badge tone="gold" size="sm" className="ml-2">{statusText(dict, partnerTypeMeta[it.partnerType]?.label ?? it.partnerType)}</Badge>
                  )}
                </span>
                <span className="shrink-0 font-semibold text-foreground">{formatPrice(it.priceFrom)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3 font-bold text-foreground">
            <span>{t.estimatedTotal}</span>
            <span className="font-display text-2xl font-normal">{formatPrice(req.estimatedTotal)}</span>
          </div>
        </section>

        {/* Devis */}
        <CustomPackQuoteForm id={req.id} currentAmount={req.quoteAmount} currentMessage={req.quoteMessage} />

        {/* Conversion / reservation liee */}
        {req.reservationId ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-brand-50 p-5 ring-1 ring-inset ring-brand-200/70">
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-800">
              <CheckCircle2 className="h-5 w-5 text-brand-600" /> {t.converted}
            </p>
            <Button asChild variant="outline" size="sm" className="bg-white">
              <Link href={localePath(`/admin/reservations/${req.reservationId}`, locale)}><ExternalLink className="h-4 w-4" /> {t.viewBooking}</Link>
            </Button>
          </div>
        ) : (
          <ConvertCustomPackButton
            id={req.id}
            disabled={req.status !== "CONFIRMED" || !req.userId}
            hint={!req.userId ? t.noAccount : req.status !== "CONFIRMED" ? t.notConfirmed : undefined}
          />
        )}

        <section className={cn(card, "p-5 sm:p-6")}>
          <h2 className={cn(cardTitle, "mb-4")}>
            <Settings2 className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.evolve}
          </h2>
          <AdminActions actions={actions} />
        </section>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-8 shrink-0 items-center justify-center rounded-arch-sm bg-sand-100 text-terracotta">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="eyebrow text-[9.5px] text-muted">{label}</p>
        <p className="mt-0.5 break-words font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
