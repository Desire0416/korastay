"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptBusinessQuote } from "@/server/actions/business";
import { useI18n } from "@/components/i18n/provider";
import { toast } from "sonner";

export function AcceptQuoteButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const dict = useI18n();
  const t = dict.dashBusiness.acceptQuote;
  const [pending, start] = React.useTransition();
  return (
    <Button
      size="lg"
      loading={pending}
      onClick={() =>
        start(async () => {
          const res = await acceptBusinessQuote(requestId);
          if (res.ok) {
            toast.success(res.message ?? t.done);
            router.refresh();
          } else toast.error(res.error ?? dict.dash.common.error);
        })
      }
    >
      <CheckCircle2 className="h-4 w-4" /> {t.label}
    </Button>
  );
}
