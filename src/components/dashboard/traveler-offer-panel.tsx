"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ArrowLeftRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { travelerRespondToOffer, type NegotiationResult } from "@/server/actions/negotiation";
import { formatPrice } from "@/lib/utils";

interface TravelerOfferPanelProps {
  offerId: string;
  counterAmount: number; // amount proposed by owner
}

type Mode = "idle" | "rejecting" | "countering";

export function TravelerOfferPanel({ offerId, counterAmount }: TravelerOfferPanelProps) {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>("idle");
  const [pending, setPending] = React.useState(false);
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
        toast.error(result.error ?? "Erreur lors de l'opération.");
        return;
      }
      if (action === "ACCEPT") toast.success("Offre acceptée ! Votre réservation est en attente de confirmation.");
      else if (action === "REJECT") toast.success("Contre-offre refusée. Le propriétaire a été notifié.");
      else toast.success("Votre contre-offre a été envoyée. Le propriétaire a 24h pour répondre.");
      router.refresh();
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setPending(false);
    }
  }

  if (mode === "countering") {
    return (
      <div className="space-y-3 rounded-2xl border border-brand-200 bg-brand-50/40 p-4">
        <p className="text-sm font-semibold text-brand-900">Votre contre-offre</p>
        <div className="flex items-center gap-2 rounded-xl border border-brand-300 bg-white px-3 py-2.5">
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
          <span className="shrink-0 text-xs text-muted">FCFA</span>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="Message au propriétaire (optionnel)..."
          className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={pending || myAmount < 1}
            onClick={() => respond("COUNTER")}
            className="flex-1"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeftRight className="h-4 w-4" />}
            Envoyer ma contre-offre
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setMode("idle"); setMessage(""); }} disabled={pending}>
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "rejecting") {
    return (
      <div className="space-y-3 rounded-2xl border border-danger-200 bg-danger-50/40 p-4">
        <p className="text-sm font-semibold text-danger-700">Refuser la contre-offre ?</p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="Message au propriétaire (optionnel)..."
          className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground outline-none focus:border-danger-400 focus:ring-2 focus:ring-danger-100"
          autoFocus
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="danger"
            disabled={pending}
            onClick={() => respond("REJECT")}
            className="flex-1"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Confirmer le refus
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setMode("idle"); setMessage(""); }} disabled={pending}>
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() => respond("ACCEPT")}
        className="flex-1"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        Accepter {formatPrice(counterAmount)}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => { setMyAmount(counterAmount); setMode("countering"); }}
        className="flex-1"
      >
        <ArrowLeftRight className="h-4 w-4" /> Contre-proposer
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => setMode("rejecting")}
        className="border-danger-200 text-danger-600 hover:bg-danger-50"
      >
        <XCircle className="h-4 w-4" /> Refuser
      </Button>
    </div>
  );
}
