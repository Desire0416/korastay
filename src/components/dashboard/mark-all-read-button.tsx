"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markAllNotificationsRead } from "@/server/actions/account";
import { useI18n } from "@/components/i18n/provider";

export function MarkAllReadButton() {
  const router = useRouter();
  const dict = useI18n();
  const [pending, start] = React.useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      loading={pending}
      onClick={() => start(async () => { await markAllNotificationsRead(); router.refresh(); })}
    >
      <CheckCheck className="h-4 w-4" /> {dict.dashAccount.components.markAllRead}
    </Button>
  );
}
