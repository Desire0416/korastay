"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-2xl !border !border-border !bg-surface !text-foreground !shadow-card !font-sans",
          title: "!font-semibold",
          description: "!text-muted",
          actionButton: "!bg-brand-500 !text-white !rounded-full",
          success: "!text-success",
          error: "!text-danger",
        },
      }}
    />
  );
}
