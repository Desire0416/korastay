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

function StarRow({ name, label }: { name: string; label: string }) {
  const [value, setValue] = React.useState(5);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input type="hidden" name={name} value={value} />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setValue(n)} aria-label={`${n} etoiles`}>
            <Star className={cn("h-6 w-6 transition-colors", n <= value ? "fill-gold-500 text-gold-500" : "text-border")} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function WriteReviewButton({ reservationId, label }: { reservationId: string; label: string }) {
  const router = useRouter();
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
        <Button size="sm"><PenLine className="h-4 w-4" /> Laisser un avis</Button>
      </DrawerTrigger>
      <DrawerContent className="px-5 pb-7">
        <DrawerTitle className="px-1 pt-5 text-xl font-bold">Votre avis</DrawerTitle>
        <p className="px-1 text-sm text-muted">{label}</p>
        <form action={action} className="mt-5 space-y-4 px-1">
          <input type="hidden" name="reservationId" value={reservationId} />
          <div className="space-y-3 rounded-2xl border border-border p-4">
            <StarRow name="rating" label="Note globale" />
            <StarRow name="cleanlinessRating" label="Propreté" />
            <StarRow name="locationRating" label="Emplacement" />
            <StarRow name="valueRating" label="Qualite / prix" />
            <StarRow name="communicationRating" label="Communication" />
          </div>
          <Textarea name="comment" placeholder="Partagez votre expérience (facultatif)..." rows={4} />
          <Button type="submit" size="lg" loading={pending} className="w-full">Publier mon avis</Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
