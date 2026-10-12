"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptCustomPackQuote } from "@/server/actions/custom-pack";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n/provider";

export function AcceptCustomPackButton({ id }: { id: string }) {
  const router = useRouter();
  const dict = useI18n();
  const [pending, start] = React.useTransition();
  return (
    <Button
      loading={pending}
      onClick={() =>
        start(async () => {
          const res = await acceptCustomPackQuote(id);
          if (res.ok) { toast.success(res.message ?? dict.dash.common.saved); router.refresh(); }
          else toast.error(res.error ?? dict.dash.common.error);
        })
      }
    >
      <CheckCircle2 className="h-4 w-4" /> {dict.dashAccount.components.acceptQuote}
    </Button>
  );
}
