"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptBusinessQuote } from "@/server/actions/business";
import { toast } from "sonner";

export function AcceptQuoteButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  return (
    <Button
      size="lg"
      loading={pending}
      onClick={() =>
        start(async () => {
          const res = await acceptBusinessQuote(requestId);
          if (res.ok) { toast.success(res.message ?? "Devis accepte."); router.refresh(); }
          else toast.error(res.error ?? "Erreur.");
        })
      }
    >
      <CheckCircle2 className="h-4 w-4" /> Accepter le devis
    </Button>
  );
}
