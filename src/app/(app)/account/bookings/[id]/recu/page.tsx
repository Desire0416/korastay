import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getReservationDetail } from "@/lib/account-queries";
import { PrintButton } from "@/components/dashboard/print-button";
import { metaFor, reservationStatusMeta } from "@/lib/enums";
import { formatPrice, formatDate } from "@/lib/utils";
import { stayDiscountRate } from "@/lib/pricing";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants";

export const metadata = { title: "Reçu KoraStay" };

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const r = await getReservationDetail(user.id, id);
  if (!r) notFound();

  const title = r.residence?.name ?? r.pack?.name ?? "Séjour";
  const place = r.residence?.city ?? r.pack?.destination?.name ?? "";
  const paid = r.payments.find((p) => p.status === "PAID");
  const balance = r.totalAmount - r.depositAmount;
  const statusMeta = metaFor(reservationStatusMeta, r.status);
  const referralDiscount = r.referralDiscountAmount;
  const stayDiscount = Math.max(0, r.subtotalAmount + r.cleaningFeeAmount + r.serviceFeeAmount - r.totalAmount - referralDiscount);
  const stayDiscountPct = Math.round(stayDiscountRate(r.nights) * 100);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={`/account/bookings/${id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Retour
        </Link>
        <PrintButton />
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft print:rounded-none print:border-0 print:shadow-none">
        {/* En-tete */}
        <div className="flex items-start justify-between gap-4 border-b border-border bg-surface-soft/40 px-7 py-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-lg font-extrabold text-white">K</span>
            <div>
              <p className="font-display text-lg font-semibold text-foreground">KoraStay</p>
              <p className="text-xs text-muted">Séjours vérifiés en Afrique de l'Ouest</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">Reçu de réservation</p>
            <p className="text-sm font-semibold text-brand-600">{r.reference}</p>
            <p className="text-xs text-muted">Emis le {formatDate(new Date())}</p>
          </div>
        </div>

        <div className="px-7 py-6">
          {/* Infos */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <Field label="Client" value={r.guestName} sub={r.guestEmail} />
            <Field label="Statut" value={statusMeta.label} />
            <Field label={title} value={place} sub={`${formatDate(r.startDate)} - ${formatDate(r.endDate)}`} />
            <Field label="Voyageurs" value={`${r.adults + r.children} personne${r.adults + r.children > 1 ? "s" : ""}${r.nights ? ` · ${r.nights} nuit${r.nights > 1 ? "s" : ""}` : ""}`} />
          </div>

          {/* Detail montants */}
          <div className="mt-6 rounded-2xl border border-border">
            <Row label="Sous-total" value={formatPrice(r.subtotalAmount)} />
            {r.cleaningFeeAmount > 0 && <Row label="Frais de ménage" value={formatPrice(r.cleaningFeeAmount)} />}
            <Row label="Frais de service KoraStay" value={formatPrice(r.serviceFeeAmount)} />
            {stayDiscount > 0 && (
              <Row label={`Réduction séjour${stayDiscountPct > 0 ? ` (−${stayDiscountPct}%)` : ""}`} value={`−${formatPrice(stayDiscount)}`} tone="success" />
            )}
            {referralDiscount > 0 && (
              <Row label="Parrainage (−5%)" value={`−${formatPrice(referralDiscount)}`} tone="success" />
            )}
            <Row label="Total du séjour" value={formatPrice(r.totalAmount)} strong />
            {r.depositAmount > 0 && (
              <>
                <Row label="Acompte regle" value={formatPrice(r.depositAmount)} tone="brand" />
                <Row label="Solde a regler sur place" value={formatPrice(balance)} tone="muted" />
              </>
            )}
          </div>

          {paid && (
            <p className="mt-4 text-sm text-muted">
              Acompte de <strong className="text-foreground">{formatPrice(paid.amount)}</strong> regle le {formatDate(paid.paidAt ?? paid.createdAt)} ({paid.method}).
            </p>
          )}

          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-brand-50/60 px-4 py-3 text-xs text-brand-800">
            <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" />
            Ce reçu atteste de votre réservation aupres de KoraStay. Le solde du séjour est regle sur place aupres de l'hôte.
          </div>

          <div className="mt-5 border-t border-border pt-4 text-center text-xs text-muted">
            KoraStay · {CONTACT_EMAIL} · {CONTACT_PHONE}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="font-semibold text-foreground">{value || "-"}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: "brand" | "muted" | "success" }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 text-sm ${strong ? "border-t border-border" : ""}`}>
      <span className={tone === "muted" ? "text-muted" : tone === "success" ? "text-success" : "text-foreground"}>{label}</span>
      <span className={`${strong ? "text-base font-extrabold" : "font-semibold"} ${tone === "brand" ? "text-brand-700" : tone === "muted" ? "text-muted" : tone === "success" ? "text-success" : "text-foreground"}`}>{value}</span>
    </div>
  );
}
