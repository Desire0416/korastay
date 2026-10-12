"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ArrowLeftRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { travelerRespondToOffer, type NegotiationResult } from "@/server/actions/negotiation";
import { useI18n } from "@/components/i18n/provider";
import { formatPrice, cn } from "@/lib/utils";

interface TravelerOfferPanelProps {
  offerId: string;
  counterAmount: number; // montant propose par le proprietaire
}

type Mode = "idle" | "rejecting" | "countering";

export function TravelerOfferPanel({ offerId, counterAmount }: TravelerOfferPanelProps) {
  const router = useRouter();
  const dict = useI18n();
  const c = dict.dashAccount.components;
  const [mode, setMode] = React.useState<Mode>("idle");
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState<null | "ACCEPT" | "REJECT" | "COUNTER">(null);
  const [myAmount, setMyAmount] = React.useState<number>(counterAmount);
  const [message, setMessage] = React.useState("");

  async function respond(action: "ACCEPT" | "REJECT" | "COUNTER") {
    setPending(true);
    try {
      const result: NegotiationResult = await travelerRespondToOffer({
        offerId,
        action,
        counterAmount: action === "COUNTER" ? myAmount : undefined,
        message: message || undefined,
      });
      if (!result.ok) {
        toast.error(result.error ?? dict.dash.common.error);
        return;
      }
      toast.success(action === "ACCEPT" ? c.toastAccepted : action === "REJECT" ? c.toastRejected : c.toastCountered);
      // Optimiste : affiche l'issue immediatement ; router.refresh() reconcilie en fond.
      setDone(action);
      router.refresh();
    } catch {
      toast.error(dict.dash.common.error);
    } finally {
      setPending(false);
    }
  }

  if (done) {
    const label = done === "ACCEPT" ? c.offerAccepted : done === "REJECT" ? c.offerRejected : c.counterSent;
    const Icon = done === "REJECT" ? XCircle : done === "COUNTER" ? ArrowLeftRight : CheckCircle2;
    return (
      <p className={cn("flex items-center gap-2 rounded-xl bg-sand-50 px-4 py-3 text-sm font-semibold ring-1 ring-inset ring-sand-200", done === "REJECT" ? "text-danger-700" : "text-success")}>
        <Icon className="h-4 w-4" /> {label}
      </p>
    );
  }

  if (mode === "countering") {
    return (
      <div className="space-y-3 rounded-[1.25rem] bg-sand-50 p-4 ring-1 ring-inset ring-sand-300/70">
        <p className="font-display text-lg text-foreground">{c.yourCounter}</p>
        <div className="flex items-center gap-2 rounded-xl border border-ink/20 bg-white px-3 py-2.5 focus-within:border-terracotta">
          <input
            type="number"
            min={1}
            step={500}
            value={myAmount || ""}
            onChange={(e) => setMyAmount(Math.max(0, Number(e.target.value)))}
            placeholder={String(counterAmount)}
            className="w-full bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted"
            autoFocus
          />
          <span className="shrink-0 text-xs text-muted">F CFA</span>
        </div>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder={c.ownerMessage} className="min-h-0" />
        <div className="flex gap-2">
          <Button size="sm" disabled={pending || myAmount < 1} onClick={() => respond("COUNTER")} className="flex-1">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeftRight className="h-4 w-4" />}
            {c.sendCounter}
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setMode("idle"); setMessage(""); }} disabled={pending}>
            {dict.dash.common.cancel}
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "rejecting") {
    return (
      <div className="space-y-3 rounded-[1.25rem] bg-danger-50 p-4 ring-1 ring-inset ring-danger-200">
        <p className="font-display text-lg text-danger-700">{c.rejectTitle}</p>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder={c.ownerMessage} className="min-h-0" autoFocus />
        <div className="flex gap-2">
          <Button size="sm" variant="danger" disabled={pending} onClick={() => respond("REJECT")} className="flex-1">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            {c.confirmReject}
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setMode("idle"); setMessage(""); }} disabled={pending}>
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
        {c.accept.replace("{amount}", formatPrice(counterAmount))}
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => { setMyAmount(counterAmount); setMode("countering"); }} className="flex-1">
        <ArrowLeftRight className="h-4 w-4" /> {c.counter}
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => setMode("rejecting")} className="border-danger-200 text-danger-600 hover:bg-danger-50">
        <XCircle className="h-4 w-4" /> {c.reject}
      </Button>
    </div>
  );
}
