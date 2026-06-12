"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Star, Loader2, ImagePlus } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { Button } from "@/components/ui/button";
import { addResidenceImage, deleteResidenceImage, setCoverImage } from "@/server/actions/owner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Image { id: string; url: string; isCover: boolean }
type ImgResult = { ok: boolean; error?: string };

interface PhotosManagerProps {
  entityId: string;
  images: Image[];
  onAdd?: (entityId: string, url: string) => Promise<ImgResult>;
  onDelete?: (imageId: string) => Promise<ImgResult>;
  onSetCover?: (imageId: string) => Promise<ImgResult>;
}

export function PhotosManager({
  entityId,
  images,
  onAdd = addResidenceImage,
  onDelete = deleteResidenceImage,
  onSetCover = setCoverImage,
}: PhotosManagerProps) {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const [pending, start] = React.useTransition();
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function removeImage(id: string) {
    setBusyId(id);
    start(async () => {
      const r = await onDelete(id);
      if (r.ok) { toast.success("Photo supprimée."); router.refresh(); }
      else toast.error(r.error ?? "Erreur");
      setBusyId(null);
    });
  }
  function makeCover(id: string) {
    setBusyId(id);
    start(async () => {
      await onSetCover(id);
      toast.success("Photo de couverture mise a jour.");
      router.refresh();
      setBusyId(null);
    });
  }

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error ?? "Échec de l'upload."); continue; }
        await onAdd(entityId, data.url);
      }
      toast.success("Photos ajoutees.");
      router.refresh();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border bg-surface-soft/40 px-6 py-10 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} disabled={uploading} />
        {uploading ? <Loader2 className="h-8 w-8 animate-spin text-brand-500" /> : <ImagePlus className="h-8 w-8 text-brand-500" />}
        <p className="font-semibold text-foreground">{uploading ? "Envoi en cours..." : "Ajouter des photos"}</p>
        <p className="text-sm text-muted">JPG, PNG ou WebP - 6 Mo max. Glissez ou cliquez pour sélectionner.</p>
      </label>

      {images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className={cn("group relative overflow-hidden rounded-2xl border border-border transition-opacity", busyId === img.id && "opacity-60")}>
              <div className="aspect-[4/3]"><SmartImage src={img.url} alt="" seed={img.id} /></div>
              {busyId === img.id && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/45 backdrop-blur-[1px]">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              {img.isCover && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand-500 px-2 py-0.5 text-2xs font-semibold text-white">
                  <Star className="h-3 w-3 fill-white" /> Couverture
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-ink/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                {!img.isCover && (
                  <button
                    onClick={() => makeCover(img.id)}
                    disabled={pending}
                    className="rounded-full bg-white/90 px-2 py-1 text-2xs font-semibold text-ink hover:bg-white disabled:opacity-50"
                  >
                    Definir couverture
                  </button>
                )}
                <button
                  onClick={() => removeImage(img.id)}
                  disabled={pending}
                  className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-danger hover:bg-white disabled:opacity-50"
                  aria-label="Supprimer"
                >
                  {busyId === img.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
