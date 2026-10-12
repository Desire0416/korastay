"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Reply, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { replyToReview } from "@/server/actions/owner";
import { useI18n } from "@/components/i18n/provider";
import { toast } from "sonner";

export function ReviewReplyForm({ reviewId, existingReply }: { reviewId: string; existingReply?: string | null }) {
  const router = useRouter();
  const dict = useI18n();
  const t = dict.dashOwner.reviewReply;
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(existingReply ?? "");
  const [pending, start] = React.useTransition();

  function submit() {
    const text = value.trim();
    if (!text) return;
    start(async () => {
      const res = await replyToReview(reviewId, text);
      if (res.ok) {
        toast.success(res.message ?? t.published);
        setOpen(false);
        router.refresh();
      } else toast.error(res.error ?? dict.dash.common.error);
    });
  }

  if (existingReply && !open) {
    return (
      <div className="mt-4 rounded-xl bg-sand-50 p-4 text-sm ring-1 ring-inset ring-sand-200">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-[9.5px] text-terracotta">{t.yourReply}</p>
          <button onClick={() => setOpen(true)} className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-ink">
            <Pencil className="h-3 w-3" /> {t.edit}
          </button>
        </div>
        <p className="mt-1 leading-relaxed text-foreground/80">{existingReply}</p>
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="mt-4" onClick={() => setOpen(true)}>
        <Reply className="h-3.5 w-3.5" /> {t.reply}
      </Button>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <Textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder={t.placeholder} rows={3} autoFocus />
      <div className="flex gap-2">
        <Button size="sm" loading={pending} onClick={submit}>{t.publish}</Button>
        <Button size="sm" variant="ghost" onClick={() => { setOpen(false); setValue(existingReply ?? ""); }}>
          {dict.dash.common.cancel}
        </Button>
      </div>
    </div>
  );
}
