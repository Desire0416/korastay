"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { approveReservation, rejectReservation, type ReservationResult } from "@/server/actions/reservations";
import { Button } from "@/components/ui/button";

export function ApproveReservationButtons({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();

  function run(fn: (id: string) => Promise<ReservationResult>, successMsg: string) {
    start(async () => {
      const res = await fn(reservationId);
      if (res.ok) {
        toast.success(successMsg);
        router.refresh();
      } else {
        toast.error(res.error ?? "Erreur.");
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => run(approveReservation, "Reservation validee.")} loading={pending} className="flex-1">
        <CheckCircle2 className="h-4 w-4" /> Valider la demande
      </Button>
      <Button
        variant="outline"
        loading={pending}
        className="flex-1"
        onClick={() => {
          if (window.confirm("Decliner cette demande de reservation ?")) run(rejectReservation, "Demande declinee.");
        }}
      >
        <XCircle className="h-4 w-4" /> Decliner
      </Button>
    </div>
  );
}
