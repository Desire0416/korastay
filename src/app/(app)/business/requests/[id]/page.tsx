import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Users, Wallet, Calendar, FileText, CheckCircle2, Check } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { AcceptQuoteButton } from "@/components/dashboard/accept-quote-button";
import { card } from "@/components/dashboard/styles";
import { businessRequestStatusMeta } from "@/lib/enums";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashBusiness.requests.metaTitle };
}

export default async function BusinessRequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["BUSINESS", "ADMIN", "SUPER_ADMIN"]);
  const { id } = await params;
  const [membership, req, { locale, dict }] = await Promise.all([
    prisma.businessMember.findFirst({ where: { userId: user.id } }),
    prisma.businessRequest.findUnique({ where: { id } }),
    getI18n(),
  ]);
  if (!req) notFound();
  // Verifie l'appartenance (sauf admin)
  const isOwn = membership ? req.businessAccountId === membership.businessAccountId : req.email === user.email;
  if (!isOwn && !["ADMIN", "SUPER_ADMIN"].includes(user.role)) notFound();
  const t = dict.dashBusiness.detail;

  const steps = ["NEW", "IN_REVIEW", "QUOTED", "CONFIRMED"];
  const currentStep = steps.indexOf(req.status);
  const confirmed = req.status === "CONFIRMED";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={localePath("/business/requests", locale)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {dict.dashBusiness.newRequest.back}
      </Link>
      <PageHeader title={req.needType ?? dict.dashBusiness.home.request} actions={<StatusBadge status={req.status} map={businessRequestStatusMeta} />} />

      {/* Suivi */}
      <ol className={cn(card, "mb-6 flex items-start justify-between p-5 sm:p-6")}>
        {t.steps.map((label, i) => {
          const done = i <= currentStep;
          return (
            <li key={label} className="relative flex flex-1 flex-col items-center text-center">
              {i > 0 && (
                <span aria-hidden="true" className={cn("absolute right-1/2 top-4 h-px w-full -translate-y-1/2", i <= currentStep ? "bg-brand-400" : "bg-border")} />
              )}
              <span
                className={cn(
                  "relative flex h-9 w-8 items-center justify-center rounded-arch-sm text-sm font-bold",
                  done ? "bg-brand-500 text-white" : "bg-sand-100 text-muted"
                )}
              >
                {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn("mt-2 text-xs", done ? "font-semibold text-foreground" : "text-muted")}>{label}</span>
            </li>
          );
        })}
      </ol>

      {/* Devis */}
      {req.quoteAmount != null && (
        <div
          className={cn(
            "relative mb-6 overflow-hidden rounded-[1.5rem] p-6 shadow-card sm:p-7",
            confirmed ? "bg-brand-50 ring-1 ring-inset ring-brand-200/70" : "border border-border/80 bg-surface"
          )}
        >
          {!confirmed && (
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 overflow-hidden">
              <div className="motif motif-kente text-terracotta/70" />
            </div>
          )}
          <div className="flex items-center gap-2.5">
            {confirmed ? <CheckCircle2 className="h-5 w-5 text-brand-600" /> : <FileText className="h-5 w-5 text-terracotta" strokeWidth={1.7} />}
            <h2 className="font-display text-xl text-foreground">{confirmed ? t.quoteAccepted : t.yourQuote}</h2>
          </div>
          <p className="mt-3 font-display text-[2.4rem] leading-none text-foreground">{formatPrice(req.quoteAmount)}</p>
          {req.quoteMessage && <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">{req.quoteMessage}</p>}
          {req.status === "QUOTED" && (
            <div className="mt-5">
              <AcceptQuoteButton requestId={req.id} />
              <p className="mt-2 text-xs text-muted">{t.acceptHint}</p>
            </div>
          )}
        </div>
      )}

      <div className={`${card} p-6 sm:p-7`}>
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          {req.city && <Info icon={MapPin} label={t.city} value={req.city} />}
          {req.teamSize && <Info icon={Users} label={t.team} value={t.teamValue.replace("{n}", String(req.teamSize))} />}
          {req.budget && <Info icon={Wallet} label={t.budget} value={formatPrice(req.budget)} />}
          <Info icon={Calendar} label={t.createdAt} value={formatDate(req.createdAt, locale)} />
        </div>
        {req.notes && <p className="mt-5 whitespace-pre-line border-t border-border pt-5 text-[15px] leading-relaxed text-foreground/85">{req.notes}</p>}
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-8 shrink-0 items-center justify-center rounded-arch-sm bg-sand-100 text-terracotta">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <div>
        <p className="eyebrow text-[9.5px] text-muted">{label}</p>
        <p className="mt-0.5 font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
