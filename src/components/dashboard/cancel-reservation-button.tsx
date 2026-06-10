"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { XCircle, AlertTriangle } from "lucide-react";
import {
  Drawer, DrawerContent, DrawerTrigger, DrawerClose, DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cancelReservation } from "@/server/actions/reservations";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface CancelButtonProps {
  reservationId: string;
  refundLabel: string;
  refundAmount: number;
}

export function CancelReservationButton({ reservationId, refundLabel, refundAmount }: CancelButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [open, setOpen] = React.useState(false);

  function confirm() {
    startTransition(async () => {
      const res = await cancelReservation(reservationId);
      if (res.ok) {
        toast.success("Reservation annulee.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error ?? "Erreur lors de l'annulation.");
      }
    });
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full text-danger hover:bg-red-50">
          <XCircle className="h-4 w-4" /> Annuler la reservation
        </Button>
      </DrawerTrigger>
      <DrawerContent className="px-5 pb-7">
        <div className="px-1 pt-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-danger">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DrawerTitle className="mt-4 text-xl font-bold">Annuler cette reservation ?</DrawerTitle>
          <p className="mt-2 text-sm text-muted">{refundLabel}.</p>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-surface-soft px-4 py-3">
            <span className="text-sm font-medium text-foreground">Remboursement estime</span>
            <span className="font-bold text-foreground">{formatPrice(refundAmount)}</span>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <DrawerClose asChild>
            <Button variant="ghost" className="flex-1">Conserver</Button>
          </DrawerClose>
          <Button variant="danger" className="flex-1" loading={pending} onClick={confirm}>
            Confirmer l'annulation
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
