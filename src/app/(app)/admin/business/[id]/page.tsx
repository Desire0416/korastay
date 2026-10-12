import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mail, Phone, MapPin, Users, Calendar, Wallet, Compass, Settings2, UserRound } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setBusinessRequestStatus } from "@/server/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminActions } from "@/components/dashboard/admin-actions";
import { BusinessQuoteForm } from "@/components/dashboard/business-quote-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { card, cardTitle } from "@/components/dashboard/styles";
import { businessRequestStatusMeta } from "@/lib/enums";
import { statusText } from "@/lib/dictionaries/enums";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAdmin.community.business.metaTitle };
}

export default async function AdminBusinessDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  const { id } = await params;
  const [req, { locale, dict }] = await Promise.all([prisma.businessRequest.findUnique({ where: { id } }), getI18n()]);
  if (!req) notFound();
  const t = dict.dashAdmin.community.businessRequest;

  // Valeurs stockees en base (FR) par le formulaire de pack personnalise.
  const isCustomPack = req.organizationType === "Particulier" || (req.needType ?? "").toLowerCase().includes("pack personnalisé");

  const actions = ["IN_REVIEW", "QUOTED", "CONFIRMED", "CLOSED"].map((s) => ({
    label: statusText(dict, businessRequestStatusMeta[s].label),
    fn: setBusinessRequestStatus.bind(null, id, s),
    variant: (s === "CONFIRMED" ? "primary" : "soft") as "primary" | "soft",
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={localePath("/admin/business", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {t.back}
      </Link>
      <PageHeader title={req.organizationName} actions={<StatusBadge status={req.status} map={businessRequestStatusMeta} />} />

      <div className="space-y-6">
        <section className={cn(card, "p-5 sm:p-6")}>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <Info icon={UserRound} label={t.contact} value={req.contactName} />
            <Info icon={Mail} label={t.email} value={req.email} />
            {req.phone && <Info icon={Phone} label={t.phone} value={req.phone} />}
            {req.city && <Info icon={MapPin} label={t.city} value={req.city} />}
            {req.teamSize && <Info icon={Users} label={t.team} value={t.teamValue.replace("{n}", String(req.teamSize))} />}
            {req.budget && <Info icon={Wallet} label={t.budget} value={formatPrice(req.budget)} />}
            {req.startDate && <Info icon={Calendar} label={t.from} value={formatDate(req.startDate, locale)} />}
            {req.endDate && <Info icon={Calendar} label={t.to} value={formatDate(req.endDate, locale)} />}
          </div>
          {req.needType && <p className="mt-5 rounded-xl bg-sand-50 px-4 py-2.5 text-sm font-medium text-terracotta-700 ring-1 ring-inset ring-sand-200">{req.needType}</p>}
          {req.notes && <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">{req.notes}</p>}
        </section>

        {isCustomPack && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-brand-50/70 p-5 ring-1 ring-inset ring-brand-200/70">
            <div>
              <p className="font-display text-lg text-foreground">{t.customPackTitle}</p>
              <p className="text-sm text-muted">{t.customPackText}</p>
            </div>
            <Button asChild>
              <Link href={localePath(`/admin/packs/new?from=${req.id}`, locale)}><Compass className="h-4 w-4" /> {t.createPack}</Link>
            </Button>
          </div>
        )}

        <BusinessQuoteForm requestId={req.id} currentAmount={req.quoteAmount} currentMessage={req.quoteMessage} />

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
