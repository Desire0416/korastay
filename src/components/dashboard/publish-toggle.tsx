"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleResidencePublish } from "@/server/actions/owner";
import { toast } from "sonner";

export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  return (
    <Button
      variant={published ? "outline" : "primary"}
      loading={pending}
      onClick={() => start(async () => {
        const res = await toggleResidencePublish(id);
        if (res.ok) { toast.success(res.message ?? "Mis a jour."); router.refresh(); }
        else toast.error(res.error ?? "Erreur.");
      })}
    >
      {published ? <><EyeOff className="h-4 w-4" /> Depublier</> : <><Eye className="h-4 w-4" /> Publier</>}
    </Button>
  );
}
