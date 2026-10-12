"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { Star, PenLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Drawer, DrawerContent, DrawerTrigger, DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createReview, type FormResult } from "@/server/actions/account";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/provider";

function StarRow({ name, label }: { name: string; label: string }) {
  const dict = useI18n();
  const [value, setValue] = React.useState(5);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input type="hidden" name={name} value={value} />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setValue(n)} aria-label={dict.dashAccount.components.starsAria.replace("{n}", String(n))}>
            <Star className={cn("h-6 w-6 transition-colors", n <= value ? "fill-gold-500 text-gold-500" : "text-sand-300")} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function WriteReviewButton({ reservationId, label }: { reservationId: string; label: string }) {
  const router = useRouter();
  const dict = useI18n();
  const c = dict.dashAccount.components;
  const [open, setOpen] = React.useState(false);
  const [state, action, pending] = useActionState<FormResult, FormData>(createReview, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      setOpen(false);
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [state, router]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="sm"><PenLine className="h-4 w-4" /> {c.leaveReview}</Button>
      </DrawerTrigger>
      <DrawerContent className="px-5 pb-7">
        <DrawerTitle className="px-1 pt-5 font-display text-2xl font-normal">{c.yourReview}</DrawerTitle>
        <p className="px-1 text-sm text-muted">{label}</p>
        <form action={action} className="mt-5 space-y-4 px-1">
          <input type="hidden" name="reservationId" value={reservationId} />
          <div className="space-y-3 rounded-[1.25rem] bg-sand-50 p-4 ring-1 ring-inset ring-sand-200">
            <StarRow name="rating" label={c.overall} />
            <StarRow name="cleanlinessRating" label={c.cleanliness} />
            <StarRow name="locationRating" label={c.location} />
            <StarRow name="valueRating" label={c.value} />
            <StarRow name="communicationRating" label={c.communication} />
          </div>
          <Textarea name="comment" placeholder={c.reviewPlaceholder} rows={4} />
          <Button type="submit" size="lg" loading={pending} className="w-full">{c.publish}</Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
