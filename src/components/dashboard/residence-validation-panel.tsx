"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, AlertCircle, Pause, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { validateResidence, requestResidenceChanges, setResidenceStatus } from "@/server/actions/admin";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const LEVELS = [
  { value: "ESSENTIAL", label: "Essentiel", stars: 2 },
  { value: "COMFORT", label: "Confort", stars: 3 },
  { value: "PREMIUM", label: "Premium", stars: 4 },
];

export function ResidenceValidationPanel({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [level, setLevel] = React.useState("COMFORT");
  const [note, setNote] = React.useState("");

  const run = (fn: () => Promise<{ ok: boolean; error?: string; message?: string }>) =>
    start(async () => {
      const res = await fn();
      if (res.ok) { toast.success(res.message ?? "Fait."); router.refresh(); }
      else toast.error(res.error ?? "Erreur.");
    });

  const needsValidation = status === "PENDING_VALIDATION" || status === "DRAFT";
  const isPublished = status === "PUBLISHED";

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
      <h3 className="font-bold text-foreground">Actions de validation</h3>

      {needsValidation && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-foreground">Attribuer un niveau de qualite</p>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button key={l.value} onClick={() => setLevel(l.value)} className={cn("rounded-2xl border p-3 text-center transition-colors", level === l.value ? "border-brand-500 bg-brand-50" : "border-border")}>
                <p className="text-sm font-bold text-foreground">{l.label}</p>
                <p className="text-xs text-gold-500">{"★".repeat(l.stars)}</p>
              </button>
            ))}
          </div>
          <Button className="mt-3 w-full" loading={pending} onClick={() => run(() => validateResidence(id, level))}>
            <BadgeCheck className="h-4 w-4" /> Valider et publier
          </Button>

          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 text-sm font-semibold text-foreground">Demander des corrections</p>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Precisez les modifications attendues..." rows={2} />
            <Button variant="outline" className="mt-2 w-full" loading={pending} onClick={() => run(() => requestResidenceChanges(id, note))}>
              <AlertCircle className="h-4 w-4" /> Demander des corrections
            </Button>
          </div>
        </div>
      )}

      {!needsValidation && (
        <div className="mt-4 space-y-2">
          {isPublished ? (
            <Button variant="outline" className="w-full" loading={pending} onClick={() => run(() => setResidenceStatus(id, "UNPUBLISHED"))}>
              <EyeOff className="h-4 w-4" /> Depublier
            </Button>
          ) : (
            <Button className="w-full" loading={pending} onClick={() => run(() => setResidenceStatus(id, "PUBLISHED"))}>
              <Eye className="h-4 w-4" /> Publier
            </Button>
          )}
          <Button variant="outline" className="w-full text-danger hover:bg-red-50" loading={pending} onClick={() => run(() => setResidenceStatus(id, "SUSPENDED"))}>
            <Pause className="h-4 w-4" /> Suspendre
          </Button>
        </div>
      )}
    </div>
  );
}
