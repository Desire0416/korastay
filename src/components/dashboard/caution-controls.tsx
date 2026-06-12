"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cautionStatusMeta } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";
import { setCautionStatus } from "@/server/actions/payments-admin";

export function CautionControls({
  reservationId,
  amount,
  status,
}: {
  reservationId: string;
  amount: number;
  status: string;
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();

  function run(next: string) {
    let justification: string | undefined;
    if (next === "RETAINED") {
      const input = window.prompt("Justification obligatoire pour retenir la caution :");
      if (!input || !input.trim()) {
        toast.error("Justification requise.");
        return;
      }
      justification = input.trim();
    }
    start(async () => {
      const res = await setCautionStatus(reservationId, next, justification);
      if (res.ok) {
        toast.success(res.message ?? "Caution mise a jour.");
        router.refresh();
      } else toast.error(res.error ?? "Erreur.");
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-soft/50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Caution : {formatPrice(amount)}</span>
        <StatusBadge status={status} map={cautionStatusMeta} size="sm" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" loading={pending} onClick={() => run("HELD")}>Reçue / bloquée</Button>
        <Button size="sm" variant="primary" loading={pending} onClick={() => run("RELEASED")}>Restituer</Button>
        <Button size="sm" variant="danger" loading={pending} onClick={() => run("RETAINED")}>Retenir</Button>
      </div>
    </div>
  );
}
