"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { XCircle, AlertTriangle } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cancelReservation } from "@/server/actions/reservations";
import { formatPrice } from "@/lib/utils";
import { useI18n } from "@/components/i18n/provider";
import { toast } from "sonner";

interface CancelButtonProps {
  reservationId: string;
  /** Libelle deja traduit de la regle de remboursement applicable. */
  refundLabel: string;
  refundAmount: number;
}

export function CancelReservationButton({ reservationId, refundLabel, refundAmount }: CancelButtonProps) {
  const router = useRouter();
  const dict = useI18n();
  const c = dict.dashAccount.components;
  const [pending, startTransition] = React.useTransition();
  const [open, setOpen] = React.useState(false);

  function confirm() {
    startTransition(async () => {
      const res = await cancelReservation(reservationId);
      if (res.ok) {
        toast.success(c.cancelled);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error ?? dict.dash.common.error);
      }
    });
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full border-danger-200 text-danger hover:border-danger-400 hover:bg-danger-50">
          <XCircle className="h-4 w-4" /> {c.cancelButton}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="px-5 pb-7">
        <div className="px-1 pt-5">
          <div className="flex h-14 w-12 items-center justify-center rounded-arch-sm bg-terracotta text-white">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DrawerTitle className="mt-5 font-display text-2xl font-normal">{c.cancelTitle}</DrawerTitle>
          <p className="mt-2 text-sm text-muted">{refundLabel}.</p>
          <div className="mt-5 flex items-center justify-between rounded-xl bg-sand-50 px-4 py-3 ring-1 ring-inset ring-sand-200">
            <span className="text-sm font-medium text-foreground">{c.refundEstimate}</span>
            <span className="font-display text-xl text-foreground">{formatPrice(refundAmount)}</span>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <DrawerClose asChild>
            <Button variant="ghost" className="flex-1">{c.keep}</Button>
          </DrawerClose>
          <Button variant="danger" className="flex-1" loading={pending} onClick={confirm}>
            {c.confirmCancel}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
