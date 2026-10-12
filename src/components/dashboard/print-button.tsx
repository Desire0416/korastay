"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/provider";

export function PrintButton({ label }: { label?: string }) {
  const dict = useI18n();
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      <Printer className="h-4 w-4" /> {label ?? dict.dashAccount.components.print}
    </Button>
  );
}
