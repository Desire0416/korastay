"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";
import { toast } from "sonner";

type Result = { ok: boolean; error?: string; message?: string };

export interface AdminAction {
  label: string;
  fn: () => Promise<Result>;
  variant?: ButtonProps["variant"];
  icon?: string;
  confirm?: string;
  redirectTo?: string;
}

export function AdminActions({ actions, size = "sm" }: { actions: AdminAction[]; size?: ButtonProps["size"] }) {
  const router = useRouter();
  const dict = useI18n();
  const [pending, start] = React.useTransition();

  function run(a: AdminAction) {
    if (a.confirm && !window.confirm(a.confirm)) return;
    start(async () => {
      const res = await a.fn();
      if (res.ok) {
        toast.success(res.message ?? dict.dash.common.done);
        if (a.redirectTo) router.push(localePath(a.redirectTo, dict.locale));
        else router.refresh();
      } else toast.error(res.error ?? dict.dash.common.error);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <Button key={a.label} variant={a.variant ?? "outline"} size={size} loading={pending} onClick={() => run(a)}>
          {a.icon && <Icon name={a.icon} className="h-4 w-4" />}
          {a.label}
        </Button>
      ))}
    </div>
  );
}
