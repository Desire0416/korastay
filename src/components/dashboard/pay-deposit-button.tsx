"use client";

import * as React from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { payReservationDeposit } from "@/server/actions/reservations";
import { Button } from "@/components/ui/button";

const METHODS = [
  { value: "ORANGE_MONEY", label: "Orange Money" },
  { value: "WAVE", label: "Wave" },
  { value: "CARD", label: "Carte bancaire" },
];

export function PayDepositButton({ reservationId, amountLabel }: { reservationId: string; amountLabel: string }) {
  const [method, setMethod] = React.useState("ORANGE_MONEY");
  const [pending, start] = React.useTransition();

  function pay() {
    start(async () => {
      const res = await payReservationDeposit(reservationId, method);
      // En cas de succes, l'action redirige (le code ci-dessous ne s'execute pas).
      if (res && !res.ok) toast.error(res.error ?? "Echec du paiement.");
    });
  }

  return (
    <div className="space-y-2.5">
      <label className="block">
        <span className="mb-1 block text-2xs font-bold uppercase tracking-wide text-muted">Moyen de paiement</span>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="h-11 w-full rounded-2xl border border-border bg-surface px-3 text-sm font-medium focus-visible:border-brand-400 focus-visible:outline-none"
        >
          {METHODS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </label>
      <Button onClick={pay} loading={pending} size="lg" className="w-full">
        <CreditCard className="h-5 w-5" /> Payer l'acompte de {amountLabel}
      </Button>
      <p className="text-center text-xs text-muted">Paiement securise. Le solde sera regle sur place.</p>
    </div>
  );
}
