"use client";

import { logoutAction } from "@/server/actions/auth";
import { useI18n } from "@/components/i18n/provider";

export function LogoutButton({ className, label }: { className?: string; label?: string }) {
  const dict = useI18n();
  return (
    <button type="button" onClick={() => void logoutAction()} className={className}>
      {label ?? dict.header.logout}
    </button>
  );
}
