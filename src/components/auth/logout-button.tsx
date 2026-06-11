"use client";

import { logoutAction } from "@/server/actions/auth";

export function LogoutButton({ className, label = "Se deconnecter" }: { className?: string; label?: string }) {
  return (
    <button type="button" onClick={() => void logoutAction()} className={className}>
      {label}
    </button>
  );
}
