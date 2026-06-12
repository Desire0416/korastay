"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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
  const [pending, start] = React.useTransition();

  function run(a: AdminAction) {
    if (a.confirm && !window.confirm(a.confirm)) return;
    start(async () => {
      const res = await a.fn();
      if (res.ok) {
        toast.success(res.message ?? "Action effectuée.");
        if (a.redirectTo) router.push(a.redirectTo);
        else router.refresh();
      } else toast.error(res.error ?? "Erreur.");
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
