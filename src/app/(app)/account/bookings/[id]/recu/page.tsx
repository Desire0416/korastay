import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getReservationDetail } from "@/lib/account-queries";
import { PrintButton } from "@/components/dashboard/print-button";
import { metaFor, reservationStatusMeta, paymentMethodMeta } from "@/lib/enums";
import { statusText } from "@/lib/dictionaries/enums";
import { formatPrice, formatDate } from "@/lib/utils";
import { stayDiscountRate } from "@/lib/pricing";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants";
import { getI18n } from "@/lib/i18n.server";
import { localePath } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.dashAccount.receipt.metaTitle, robots: { index: false } };
}

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [r, { locale, dict }] = await Promise.all([getReservationDetail(user.id, id), getI18n()]);
  if (!r) notFound();
  const t = dict.dashAccount.receipt;
  const d = dict.dashAccount.detail;

  const title = r.residence?.name ?? r.pack?.name ?? dict.dashAccount.reviews.stay;
  const place = r.residence?.city ?? r.pack?.destination?.name ?? "";
  const paid = r.payments.find((p) => p.status === "PAID");
  const balance = r.totalAmount - r.depositAmount;
  const statusLabel = statusText(dict, metaFor(reservationStatusMeta, r.status).label);
  const referralDiscount = r.referralDiscountAmount;
  const stayDiscount = Math.max(0, r.subtotalAmount + r.cleaningFeeAmount + r.serviceFeeAmount - r.totalAmount - referralDiscount);
  const stayDiscountPct = Math.round(stayDiscountRate(r.nights) * 100);
  const guests = r.adults + r.children;
  const guestsLabel = `${d.persons.replace("{n}", String(guests))}${r.nights ? ` · ${dict.dash.common.nights.replace("{n}", String(r.nights))}` : ""}`;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between print:hidden">
        <Link href={localePath(`/account/bookings/${id}`, locale)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
          <ChevronLeft className="h-4 w-4" /> {t.back}
        </Link>
        <PrintButton />
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-border/80 bg-surface shadow-soft print:rounded-none print:border-0 print:shadow-none">
        <div aria-hidden="true" className="h-2 overflow-hidden">
          <div className="motif motif-kente relative h-full text-terracotta/70" />
        </div>
        {/* En-tete */}
        <div className="flex items-start justify-between gap-4 border-b border-border bg-sand-50 px-7 py-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.svg" alt="KoraStay" className="h-8 w-auto" />
          </div>
          <div className="text-right">
            <p className="font-display text-lg text-foreground">{t.title}</p>
            <p className="text-sm font-semibold text-terracotta">{r.reference}</p>
            <p className="text-xs text-muted">{t.issued.replace("{date}", formatDate(new Date(), locale))}</p>
          </div>
        </div>

        <div className="px-7 py-6">
          <p className="text-xs text-muted">{t.tagline}</p>
          {/* Infos */}
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
            <Field label={t.client} value={r.guestName} sub={r.guestEmail} />
            <Field label={t.status} value={statusLabel} />
            <Field label={title} value={place} sub={`${formatDate(r.startDate, locale)} – ${formatDate(r.endDate, locale)}`} />
            <Field label={t.travelers} value={guestsLabel} />
          </div>

          {/* Detail montants */}
          <div className="mt-7 overflow-hidden rounded-xl border border-border">
            <Row label={t.subtotal} value={formatPrice(r.subtotalAmount)} />
            {r.cleaningFeeAmount > 0 && <Row label={d.cleaningFee} value={formatPrice(r.cleaningFeeAmount)} />}
            <Row label={d.serviceFee} value={formatPrice(r.serviceFeeAmount)} />
            {stayDiscount > 0 && (
              <Row label={`${d.stayDiscount}${stayDiscountPct > 0 ? ` (−${stayDiscountPct} %)` : ""}`} value={`−${formatPrice(stayDiscount)}`} tone="success" />
            )}
            {referralDiscount > 0 && <Row label={d.referral} value={`−${formatPrice(referralDiscount)}`} tone="success" />}
            <Row label={t.stayTotal} value={formatPrice(r.totalAmount)} strong />
            {r.depositAmount > 0 && (
              <>
                <Row label={t.depositPaid} value={formatPrice(r.depositAmount)} tone="brand" />
                <Row label={t.balanceOnSite} value={formatPrice(balance)} tone="muted" />
              </>
            )}
          </div>

          {paid && (
            <p className="mt-4 text-sm text-muted">
              {t.paidLine
                .replace("{amount}", formatPrice(paid.amount))
                .replace("{date}", formatDate(paid.paidAt ?? paid.createdAt, locale))
                .replace("{method}", dict.enums.paymentMethod[paid.method]?.label ?? paymentMethodMeta[paid.method]?.label ?? paid.method)}
            </p>
          )}

          <div className="mt-6 flex items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-xs leading-relaxed text-brand-800 ring-1 ring-inset ring-brand-200/60">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
            {t.note}
          </div>

          <div className="mt-6 border-t border-border pt-4 text-center text-xs text-muted">
            KoraStay · {CONTACT_EMAIL} · {CONTACT_PHONE}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0">
      <p className="eyebrow text-[9.5px] text-muted">{label}</p>
      <p className="mt-0.5 font-semibold text-foreground">{value || "-"}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: "brand" | "muted" | "success" }) {
  const toneClass = tone === "muted" ? "text-muted" : tone === "success" ? "text-success" : tone === "brand" ? "text-brand-700" : "text-foreground";
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 text-sm ${strong ? "border-t border-border bg-sand-50" : ""}`}>
      <span className={tone === "muted" ? "text-muted" : tone === "success" ? "text-success" : "text-foreground"}>{label}</span>
      <span className={`${strong ? "font-display text-xl" : "font-semibold"} ${toneClass}`}>{value}</span>
    </div>
  );
}
