"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePack } from "@/server/actions/packs";
import { toast } from "sonner";

export function DeletePackButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      className="text-danger hover:bg-red-50"
      loading={pending}
      onClick={() => {
        if (!window.confirm("Supprimer définitivement ce pack ?")) return;
        start(async () => {
          const res = await deletePack(id);
          if (res.ok) { toast.success(res.message ?? "Supprimé."); router.push("/admin/packs"); }
          else toast.error(res.error ?? "Erreur.");
        });
      }}
    >
      <Trash2 className="h-3.5 w-3.5" /> Supprimer
    </Button>
  );
}
