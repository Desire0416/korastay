"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleResidencePublish } from "@/server/actions/owner";
import { useI18n } from "@/components/i18n/provider";
import { toast } from "sonner";

export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const dict = useI18n();
  const t = dict.dashOwner.publish;
  const [pending, start] = React.useTransition();
  return (
    <Button
      size="sm"
      variant={published ? "outline" : "primary"}
      loading={pending}
      onClick={() =>
        start(async () => {
          const res = await toggleResidencePublish(id);
          if (res.ok) {
            toast.success(res.message ?? t.updated);
            router.refresh();
          } else toast.error(res.error ?? dict.dash.common.error);
        })
      }
    >
      {published ? <><EyeOff className="h-4 w-4" /> {t.unpublish}</> : <><Eye className="h-4 w-4" /> {t.publish}</>}
    </Button>
  );
}
