"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Upload, FileCheck2, X } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { useI18n } from "@/components/i18n/provider";

interface UploadFieldProps {
  name: string;
  label?: string;
  hint?: string;
  defaultUrl?: string;
  accept?: string;
  /** "image" shows a thumbnail preview ; "document" shows a filename chip. */
  kind?: "image" | "document";
  required?: boolean;
}

export function UploadField({
  name,
  label,
  hint,
  defaultUrl = "",
  accept = "image/*",
  kind = "image",
  required,
}: UploadFieldProps) {
  const dict = useI18n();
  const u = dict.dash.upload;
  const [url, setUrl] = React.useState(defaultUrl);
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function onFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setUrl(data.url);
        toast.success(u.done);
      } else toast.error(data.error ?? u.failed);
    } catch {
      toast.error(u.unavailable);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-foreground">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-sand-50 p-3">
          {kind === "image" ? (
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
              <SmartImage src={url} alt={label ?? u.preview} seed={name} sizes="64px" />
            </div>
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <FileCheck2 className="h-6 w-6" />
            </span>
          )}
          <span className="flex-1 truncate text-sm text-muted">{kind === "document" ? u.docImported : u.imageImported}</span>
          <button type="button" onClick={() => setUrl("")} className="rounded-lg p-1.5 text-muted hover:bg-white hover:text-danger" aria-label={u.remove}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-sand-400/80 bg-sand-50/70 px-4 py-5 text-sm font-semibold text-muted transition-colors hover:border-terracotta hover:text-ink disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? u.uploading : u.upload}
        </button>
      )}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
    </div>
  );
}
