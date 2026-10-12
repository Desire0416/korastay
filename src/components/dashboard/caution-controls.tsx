"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cautionStatusMeta } from "@/lib/enums";
import { formatPrice } from "@/lib/utils";
import { setCautionStatus } from "@/server/actions/payments-admin";
import { useI18n } from "@/components/i18n/provider";

export function CautionControls({ reservationId, amount, status }: { reservationId: string; amount: number; status: string }) {
  const router = useRouter();
  const dict = useI18n();
  const t = dict.dashAdmin.ops.caution;
  const [pending, start] = React.useTransition();

  function run(next: string) {
    let justification: string | undefined;
    if (next === "RETAINED") {
      const input = window.prompt(t.justifyPrompt);
      if (!input || !input.trim()) {
        toast.error(t.justifyRequired);
        return;
      }
      justification = input.trim();
    }
    start(async () => {
      const res = await setCautionStatus(reservationId, next, justification);
      if (res.ok) {
        toast.success(res.message ?? t.updated);
        router.refresh();
      } else toast.error(res.error ?? dict.dash.common.error);
    });
  }

  return (
    <div className="rounded-xl bg-sand-50 p-4 ring-1 ring-inset ring-sand-200">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">{t.label.replace("{amount}", formatPrice(amount))}</span>
        <StatusBadge status={status} map={cautionStatusMeta} size="sm" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="bg-white" loading={pending} onClick={() => run("HELD")}>{t.held}</Button>
        <Button size="sm" variant="primary" loading={pending} onClick={() => run("RELEASED")}>{t.release}</Button>
        <Button size="sm" variant="danger" loading={pending} onClick={() => run("RETAINED")}>{t.retain}</Button>
      </div>
    </div>
  );
}
