"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { approveReservation, rejectReservation, type ReservationResult } from "@/server/actions/reservations";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/provider";

export function ApproveReservationButtons({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const dict = useI18n();
  const t = dict.dashOwner.approve;
  const [pending, start] = React.useTransition();

  function run(fn: (id: string) => Promise<ReservationResult>, successMsg: string) {
    start(async () => {
      const res = await fn(reservationId);
      if (res.ok) {
        toast.success(successMsg);
        router.refresh();
      } else {
        toast.error(res.error ?? dict.dash.common.error);
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => run(approveReservation, t.approved)} loading={pending} className="flex-1">
        <CheckCircle2 className="h-4 w-4" /> {t.approve}
      </Button>
      <Button
        variant="outline"
        loading={pending}
        className="flex-1 bg-white"
        onClick={() => {
          if (window.confirm(t.confirmDecline)) run(rejectReservation, t.declined);
        }}
      >
        <XCircle className="h-4 w-4" /> {t.decline}
      </Button>
    </div>
  );
}
