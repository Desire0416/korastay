"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ArrowLeftRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ownerRespondToOffer, type NegotiationResult } from "@/server/actions/negotiation";
import { useI18n } from "@/components/i18n/provider";
import { formatPrice, cn } from "@/lib/utils";

interface OfferResponsePanelProps {
  offerId: string;
  currentAmount: number;
  proposedBy: string; // "TRAVELER" | "OWNER"
}

type Mode = "idle" | "rejecting" | "countering";

const textarea =
  "w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-terracotta focus:ring-4 focus:ring-terracotta/10";

export function OfferResponsePanel({ offerId, currentAmount, proposedBy }: OfferResponsePanelProps) {
  const router = useRouter();
  const dict = useI18n();
  const t = dict.dashOwner.offerPanel;
  const [mode, setMode] = React.useState<Mode>("idle");
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState<null | "ACCEPT" | "REJECT" | "COUNTER">(null);
  const [counterAmount, setCounterAmount] = React.useState<number>(currentAmount);
  const [message, setMessage] = React.useState("");

  const isAwaitingOwner = proposedBy === "TRAVELER";

  async function respond(action: "ACCEPT" | "REJECT" | "COUNTER") {
    setPending(true);
    try {
      const result: NegotiationResult = await ownerRespondToOffer({
        offerId,
        action,
        counterAmount: action === "COUNTER" ? counterAmount : undefined,
        message: message || undefined,
      });
      if (!result.ok) {
        toast.error(result.error ?? t.error);
        return;
      }
      if (action === "ACCEPT") toast.success(t.accepted);
      else if (action === "REJECT") toast.success(t.rejected);
      else toast.success(t.countered);
      // Optimiste : affiche l'issue immediatement ; router.refresh() reconcilie en fond.
      setDone(action);
      router.refresh();
    } catch {
      toast.error(t.failed);
    } finally {
      setPending(false);
    }
  }

  // Etat resolu optimiste (avant que le refresh serveur ne retire l'offre de la liste).
  if (done) {
    const label = done === "ACCEPT" ? t.acceptedLabel : done === "REJECT" ? t.rejectedLabel : t.counteredLabel;
    const Icon = done === "REJECT" ? XCircle : done === "COUNTER" ? ArrowLeftRight : CheckCircle2;
    return (
      <p
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ring-1 ring-inset",
          done === "REJECT" ? "bg-danger-50 text-danger-700 ring-danger-200/70" : "bg-brand-50 text-brand-800 ring-brand-200/70"
        )}
      >
        <Icon className="h-4 w-4" /> {label}
      </p>
    );
  }

  if (!isAwaitingOwner) {
    const [before, after] = t.waitingTraveler.split("{amount}");
    return (
      <p className="rounded-xl bg-sand-50 px-4 py-3 text-sm text-muted ring-1 ring-inset ring-sand-200">
        {before}
        <strong className="text-foreground">{formatPrice(currentAmount)}</strong>
        {after}
      </p>
    );
  }

  if (mode === "countering") {
    return (
      <div className="space-y-3 rounded-xl bg-brand-50/70 p-4 ring-1 ring-inset ring-brand-200/70">
        <p className="text-sm font-semibold text-brand-900">{t.yourCounter}</p>
        <div className="flex items-center gap-2 rounded-xl border border-brand-300 bg-white px-3.5 py-2.5 focus-within:ring-4 focus-within:ring-brand-100">
          <input
            type="number"
            min={1}
            step={500}
            value={counterAmount || ""}
            onChange={(e) => setCounterAmount(Math.max(0, Number(e.target.value)))}
            placeholder={String(currentAmount)}
            className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted"
            autoFocus
          />
          <span className="shrink-0 text-xs text-muted">FCFA</span>
        </div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder={t.messagePlaceholder} className={textarea} />
        <div className="flex gap-2">
          <Button size="sm" disabled={pending || counterAmount < 1} onClick={() => respond("COUNTER")} className="flex-1">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeftRight className="h-4 w-4" />}
            {t.sendCounter}
          </Button>
          <Button size="sm" variant="outline" className="bg-white" onClick={() => { setMode("idle"); setMessage(""); }} disabled={pending}>
            {dict.dash.common.cancel}
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "rejecting") {
    return (
      <div className="space-y-3 rounded-xl bg-danger-50/70 p-4 ring-1 ring-inset ring-danger-200/70">
        <p className="text-sm font-semibold text-danger-700">{t.rejectReason}</p>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder={t.rejectPlaceholder} className={textarea} autoFocus />
        <div className="flex gap-2">
          <Button size="sm" variant="danger" disabled={pending} onClick={() => respond("REJECT")} className="flex-1">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            {t.confirmReject}
          </Button>
          <Button size="sm" variant="outline" className="bg-white" onClick={() => { setMode("idle"); setMessage(""); }} disabled={pending}>
            {dict.dash.common.cancel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" disabled={pending} onClick={() => respond("ACCEPT")} className="flex-1">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        {t.accept.replace("{amount}", formatPrice(currentAmount))}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => { setCounterAmount(currentAmount); setMode("countering"); }}
        className="flex-1"
      >
        <ArrowLeftRight className="h-4 w-4" /> {t.counter}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => setMode("rejecting")}
        className="border-danger-200 text-danger-600 hover:border-danger-300 hover:bg-danger-50"
      >
        <XCircle className="h-4 w-4" /> {t.reject}
      </Button>
    </div>
  );
}
