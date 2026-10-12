"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Star, Loader2, ImagePlus } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { addResidenceImage, deleteResidenceImage, setCoverImage } from "@/server/actions/owner";
import { useI18n } from "@/components/i18n/provider";
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
  const dict = useI18n();
  const t = dict.dashOwner.photos;
  const [uploading, setUploading] = React.useState(false);
  const [pending, start] = React.useTransition();
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function removeImage(id: string) {
    setBusyId(id);
    start(async () => {
      const r = await onDelete(id);
      if (r.ok) {
        toast.success(t.deleted);
        router.refresh();
      } else toast.error(r.error ?? dict.dash.common.error);
      setBusyId(null);
    });
  }
  function makeCover(id: string) {
    setBusyId(id);
    start(async () => {
      await onSetCover(id);
      toast.success(t.coverUpdated);
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
        if (!res.ok) {
          toast.error(data.error ?? t.uploadFailed);
          continue;
        }
        await onAdd(entityId, data.url);
      }
      toast.success(t.added);
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
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[1.5rem] border-2 border-dashed border-sand-400/80 bg-sand-50/70 px-6 py-10 text-center transition-colors hover:border-terracotta hover:bg-sand-50",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} disabled={uploading} />
        <span className="flex h-14 w-12 items-center justify-center rounded-arch-sm bg-white text-terracotta shadow-soft">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" strokeWidth={1.7} />}
        </span>
        <p className="mt-1 font-display text-lg text-foreground">{uploading ? t.uploading : t.add}</p>
        <p className="text-sm text-muted">{t.hint}</p>
      </label>

      {images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className={cn("group relative overflow-hidden rounded-[1.1rem] border border-border/80 shadow-soft transition-opacity", busyId === img.id && "opacity-60")}>
              <div className="aspect-[4/3]">
                <SmartImage src={img.url} alt="" seed={img.id} sizes="(max-width: 640px) 50vw, 25vw" />
              </div>
              {busyId === img.id && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/45 backdrop-blur-[1px]">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              {img.isCover && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold-400 px-2 py-0.5 text-2xs font-semibold text-ink-900">
                  <Star className="h-3 w-3 fill-ink-900" /> {t.cover}
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-ink/75 to-transparent p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                {!img.isCover && (
                  <button
                    onClick={() => makeCover(img.id)}
                    disabled={pending}
                    className="rounded-full bg-white/90 px-2.5 py-1 text-2xs font-semibold text-ink hover:bg-white disabled:opacity-50"
                  >
                    {t.setCover}
                  </button>
                )}
                <button
                  onClick={() => removeImage(img.id)}
                  disabled={pending}
                  className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-danger hover:bg-white disabled:opacity-50"
                  aria-label={t.delete}
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
