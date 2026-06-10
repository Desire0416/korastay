"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Reply, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { replyToReview } from "@/server/actions/owner";
import { toast } from "sonner";

export function ReviewReplyForm({ reviewId, existingReply }: { reviewId: string; existingReply?: string | null }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(existingReply ?? "");
  const [pending, start] = React.useTransition();

  function submit() {
    const text = value.trim();
    if (!text) return;
    start(async () => {
      const res = await replyToReview(reviewId, text);
      if (res.ok) { toast.success(res.message ?? "Reponse publiee."); setOpen(false); router.refresh(); }
      else toast.error(res.error ?? "Erreur.");
    });
  }

  if (existingReply && !open) {
    return (
      <div className="mt-3 rounded-2xl bg-surface-soft p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-foreground">Votre reponse</p>
          <button onClick={() => setOpen(true)} className="flex items-center gap-1 text-xs font-semibold text-brand-600">
            <Pencil className="h-3 w-3" /> Modifier
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">{existingReply}</p>
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="mt-3" onClick={() => setOpen(true)}>
        <Reply className="h-3.5 w-3.5" /> Repondre
      </Button>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <Textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder="Repondez a ce voyageur..." rows={3} />
      <div className="flex gap-2">
        <Button size="sm" loading={pending} onClick={submit}>Publier la reponse</Button>
        <Button size="sm" variant="ghost" onClick={() => { setOpen(false); setValue(existingReply ?? ""); }}>Annuler</Button>
      </div>
    </div>
  );
}
