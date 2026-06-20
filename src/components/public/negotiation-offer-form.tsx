"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Handshake, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { submitPriceOffer } from "@/server/actions/negotiation";
import { localePath } from "@/lib/i18n";
import { useLocale } from "@/components/i18n/provider";

interface NegotiationOfferFormProps {
  residenceId: string;
  residenceName: string;
  slug: string;
  startDate: string;
  endDate: string;
  nights: number;
  adults: number;
  children: number;
  cleaningFeeAmount: number;
  proposedAmount: number;
  estimatedServiceFee: number;
  estimatedTotal: number;
  pricePerNight: number;
  baseSubtotal: number;
  defaultName: string;
  defaultEmail: string;
  defaultPhone: string;
}

export function NegotiationOfferForm(props: NegotiationOfferFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [guestName, setGuestName] = React.useState(props.defaultName);
  const [guestEmail] = React.useState(props.defaultEmail);
  const [guestPhone, setGuestPhone] = React.useState(props.defaultPhone);
  const [message, setMessage] = React.useState("");
  const [acceptTerms, setAcceptTerms] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptTerms) { setError("Vous devez accepter les conditions."); return; }
    setPending(true);
    setError(null);
    try {
      const result = await submitPriceOffer({
        residenceId: props.residenceId,
        startDate: props.startDate,
        endDate: props.endDate,
        nights: props.nights,
        adults: props.adults,
        children: props.children,
        guestName,
        guestEmail,
        guestPhone: guestPhone || undefined,
        proposedAmount: props.proposedAmount,
        message: message || undefined,
        cleaningFeeAmount: props.cleaningFeeAmount,
      });
      if (!result.ok) { setError(result.error ?? "Erreur inattendue."); return; }
      router.push(localePath(`/account/bookings/${result.reservationId}?offered=1`, locale));
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Recap offre */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Handshake className="h-4 w-4 text-brand-600" />
          <span className="text-sm font-bold text-brand-900">Votre offre</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-muted">
            <span>Prix de référence ({props.pricePerNight.toLocaleString("fr-FR")} × {props.nights} nuits)</span>
            <span>{formatPrice(props.baseSubtotal)}</span>
          </div>
          <div className="flex justify-between font-semibold text-brand-800">
            <span>Votre proposition</span>
            <span>{formatPrice(props.proposedAmount)}</span>
          </div>
          {props.cleaningFeeAmount > 0 && (
            <div className="flex justify-between text-muted">
              <span>Frais de ménage</span>
              <span>{formatPrice(props.cleaningFeeAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted">
            <span>Frais de service KoraStay</span>
            <span>{formatPrice(props.estimatedServiceFee)}</span>
          </div>
          <div className="flex justify-between border-t border-brand-200 pt-2 font-bold text-foreground">
            <span>Total estimé</span>
            <span>{formatPrice(props.estimatedTotal)}</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Le propriétaire a 24h pour accepter, refuser ou vous faire une contre-offre.
          Aucun paiement n&apos;est débité à cette étape.
        </p>
      </div>

      {/* Vos coordonnées */}
      <div>
        <h2 className="mb-3 text-base font-bold text-foreground">Vos coordonnées</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Nom complet <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              readOnly
              value={guestEmail}
              className="w-full rounded-xl border border-border bg-surface-soft px-3 py-2.5 text-sm text-muted outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Téléphone</label>
            <input
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="+225 07 00 00 00 00"
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Message au propriétaire (optionnel)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Présentez-vous, expliquez votre séjour..."
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
      </div>

      {/* CGV */}
      <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border text-brand-500 focus:ring-brand-400"
        />
        <span>
          J&apos;accepte les{" "}
          <a href="/conditions-generales" target="_blank" className="underline hover:text-brand-600">
            conditions générales
          </a>{" "}
          et la{" "}
          <a href="/politique-annulation" target="_blank" className="underline hover:text-brand-600">
            politique d&apos;annulation
          </a>
          .
        </span>
      </label>

      {error && (
        <p className="rounded-xl bg-danger-50 px-4 py-2.5 text-sm font-medium text-danger-700">{error}</p>
      )}

      <Button type="submit" disabled={pending || !acceptTerms} size="lg" className="w-full">
        {pending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...</>
        ) : (
          <><Handshake className="mr-2 h-4 w-4" /> Envoyer mon offre</>
        )}
      </Button>
    </form>
  );
}
