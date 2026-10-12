"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { StepHeading } from "./step-heading";
import { formatPrice } from "@/lib/utils";
import { submitPriceOffer } from "@/server/actions/negotiation";
import { localePath } from "@/lib/i18n";
import { useI18n } from "@/components/i18n/provider";

interface NegotiationOfferFormProps {
  residenceId: string;
  residenceName: string;
  slug: string;
  startDate: string;
  endDate: string;
  nights: number;
  adults: number;
  childGuests: number;
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
  const dict = useI18n();
  const n = dict.negotiation;
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [guestName, setGuestName] = React.useState(props.defaultName);
  const [guestPhone, setGuestPhone] = React.useState(props.defaultPhone);
  const [message, setMessage] = React.useState("");
  const [acceptTerms, setAcceptTerms] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptTerms) {
      setError(n.mustAccept);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await submitPriceOffer({
        residenceId: props.residenceId,
        startDate: props.startDate,
        endDate: props.endDate,
        nights: props.nights,
        adults: props.adults,
        children: props.childGuests,
        guestName,
        guestEmail: props.defaultEmail,
        guestPhone: guestPhone || undefined,
        proposedAmount: props.proposedAmount,
        message: message || undefined,
        cleaningFeeAmount: props.cleaningFeeAmount,
      });
      if (!result.ok) {
        setError(result.error ?? n.unexpected);
        return;
      }
      router.push(localePath(`/account/bookings/${result.reservationId}?offered=1`, dict.locale));
    } catch {
      setError(n.retry);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Recap de l'offre */}
      <section>
        <StepHeading step={1} title={n.yourOffer} />
        <div className="rounded-[1.25rem] bg-sand-50 p-5 ring-1 ring-inset ring-sand-300/70">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4 text-muted">
              <span>
                {n.referencePrice
                  .replace("{price}", formatPrice(props.pricePerNight))
                  .replace("{n}", String(props.nights))}
              </span>
              <span className="shrink-0">{formatPrice(props.baseSubtotal)}</span>
            </div>
            <div className="flex justify-between font-semibold text-terracotta-700">
              <span className="flex items-center gap-2">
                <Handshake className="h-4 w-4" /> {n.yourProposal}
              </span>
              <span>{formatPrice(props.proposedAmount)}</span>
            </div>
            {props.cleaningFeeAmount > 0 && (
              <div className="flex justify-between text-muted">
                <span>{dict.booking.cleaningFee}</span>
                <span>{formatPrice(props.cleaningFeeAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <span>{dict.booking.serviceFee}</span>
              <span>{formatPrice(props.estimatedServiceFee)}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-sand-300 pt-3 font-bold text-foreground">
              <span>{dict.booking.estimatedTotal}</span>
              <span className="font-display text-xl font-normal">{formatPrice(props.estimatedTotal)}</span>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">{n.hint}</p>
        </div>
      </section>

      {/* Coordonnees */}
      <section>
        <StepHeading step={2} title={dict.checkout.yourDetails} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={dict.checkout.fullName} htmlFor="offerName" required className="sm:col-span-2">
            <Input id="offerName" required value={guestName} onChange={(e) => setGuestName(e.target.value)} />
          </Field>
          <Field label={n.email} htmlFor="offerEmail">
            <Input id="offerEmail" type="email" readOnly value={props.defaultEmail} className="bg-sand-50 text-muted" />
          </Field>
          <Field label={dict.checkout.phone} htmlFor="offerPhone">
            <Input
              id="offerPhone"
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="+225 07 00 00 00 00"
            />
          </Field>
          <Field label={n.messageLabel} htmlFor="offerMessage" className="sm:col-span-2">
            <Textarea
              id="offerMessage"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder={n.messagePlaceholder}
            />
          </Field>
        </div>
      </section>

      {/* Conditions */}
      <label className="flex cursor-pointer items-start gap-3 rounded-[1.25rem] border border-border bg-surface p-4">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-0.5 h-5 w-5 rounded border-ink/30 text-brand-500 focus:ring-brand-400"
        />
        <span className="text-sm leading-relaxed text-foreground/90">
          {dict.checkout.acceptPrefix}
          <a href={localePath("/conditions-generales", dict.locale)} target="_blank" className="font-semibold text-terracotta underline underline-offset-2">
            {dict.checkout.termsLink}
          </a>
          {dict.checkout.and}
          <a href={localePath("/politique-annulation", dict.locale)} target="_blank" className="font-semibold text-terracotta underline underline-offset-2">
            {dict.checkout.cancellationLink}
          </a>
          .
        </span>
      </label>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-danger ring-1 ring-inset ring-red-200/70">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" loading={pending} disabled={!acceptTerms} size="lg" className="w-full">
        {!pending && <Handshake className="h-4 w-4" />}
        {pending ? n.sending : n.send}
      </Button>
    </form>
  );
}
