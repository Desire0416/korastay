"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePack } from "@/server/actions/packs";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";
import { toast } from "sonner";

export function DeletePackButton({ id }: { id: string }) {
  const router = useRouter();
  const dict = useI18n();
  const t = dict.dashAdmin.catalog.pack;
  const [pending, start] = React.useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      className="border-danger-200 text-danger-600 hover:bg-danger-50"
      loading={pending}
      onClick={() => {
        if (!window.confirm(t.confirmDelete)) return;
        start(async () => {
          const res = await deletePack(id);
          if (res.ok) {
            toast.success(res.message ?? t.deleted);
            router.push(localePath("/admin/packs", dict.locale));
          } else toast.error(res.error ?? dict.dash.common.error);
        });
      }}
    >
      <Trash2 className="h-3.5 w-3.5" /> {t.delete}
    </Button>
  );
}
