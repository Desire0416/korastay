import Link from "next/link";
import { Wand2, MapPin, Users, FileText, CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getUserCustomPacks } from "@/lib/custom-pack-queries";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { AcceptCustomPackButton } from "@/components/dashboard/accept-custom-pack-button";
import { businessRequestStatusMeta, partnerTypeMeta } from "@/lib/enums";
import { statusText } from "@/lib/dictionaries/enums";
import { formatPrice, formatDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAccount.customPacks.metaTitle };
}

export default async function AccountCustomPacksPage() {
  const user = await requireUser();
  const [requests, { locale, dict }] = await Promise.all([getUserCustomPacks(user.id), getI18n()]);
  const t = dict.dashAccount.customPacks;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={t.title}
        description={t.subtitle}
        actions={<Button asChild><Link href={localePath("/packs/custom", locale)}><Wand2 className="h-4 w-4" /> {t.compose}</Link></Button>}
      />
      {requests.length === 0 ? (
        <EmptyState
          icon={Wand2}
          title={t.emptyTitle}
          description={t.emptyText}
          action={<Button asChild><Link href={localePath("/packs/custom", locale)}>{t.composeMine}</Link></Button>}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="rounded-[1.5rem] border border-border/80 bg-surface p-5 shadow-soft sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-display text-xl text-foreground">{r.reference}</h3>
                  <StatusBadge status={r.status} map={businessRequestStatusMeta} size="sm" />
                </div>
                <span className="font-display text-xl text-foreground">{formatPrice(r.estimatedTotal)}</span>
              </div>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {r.cityName}</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {dict.dash.common.guests.replace("{n}", String(r.persons))}</span>
                <span>{formatDate(r.createdAt, locale)}</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {r.items.map((it) => (
                  <span key={it.id} className="rounded-full bg-sand-100 px-3 py-1 text-xs text-foreground">
                    {it.label}
                    {it.partnerType ? ` · ${statusText(dict, partnerTypeMeta[it.partnerType]?.label ?? it.partnerType)}` : ""}
                  </span>
                ))}
              </div>

              {/* Devis */}
              {r.status === "QUOTED" && r.quoteAmount != null && (
                <div className="mt-5 rounded-[1.25rem] bg-gold-50 p-5 ring-1 ring-inset ring-gold-200/70">
                  <p className="eyebrow flex items-center gap-2 text-[10px] text-gold-800">
                    <FileText className="h-4 w-4" /> {t.quoteReceived}
                  </p>
                  <p className="mt-2 font-display text-3xl text-foreground">{formatPrice(r.quoteAmount)}</p>
                  {r.quoteMessage && <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{r.quoteMessage}</p>}
                  <div className="mt-4"><AcceptCustomPackButton id={r.id} /></div>
                </div>
              )}
              {r.reservationId && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-50 p-3.5 ring-1 ring-inset ring-brand-200/60">
                  <span className="flex items-center gap-2 text-sm font-semibold text-brand-700"><CheckCircle2 className="h-4 w-4" /> {t.confirmed}</span>
                  <Button asChild variant="outline" size="sm">
                    <Link href={localePath(`/account/bookings/${r.reservationId}`, locale)}>{t.viewBooking}</Link>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
