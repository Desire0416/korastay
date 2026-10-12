"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Camera, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { saveBlogPost, type BlogResult } from "@/server/actions/blog";
import { useI18n } from "@/components/i18n/provider";

interface Props {
  id?: string;
  defaults?: { title?: string; excerpt?: string; body?: string; coverImageUrl?: string; isPublished?: boolean };
}

export function BlogPostForm({ id, defaults = {} }: Props) {
  const t = useI18n().dashAdmin.system.blogForm;
  const action = saveBlogPost.bind(null, id ?? null);
  const [state, formAction, pending] = useActionState<BlogResult, FormData>(action, { ok: false });
  const [cover, setCover] = React.useState(defaults.coverImageUrl ?? "");
  const [uploading, setUploading] = React.useState(false);

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    if (state.error) toast.error(state.error);
  }, [state]);

  async function onFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setCover(data.url);
        toast.success(t.imageReady);
      } else toast.error(data.error ?? t.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="coverImageUrl" value={cover} />

      <Field label={t.title} htmlFor="title" required>
        <Input id="title" name="title" defaultValue={defaults.title} placeholder={t.titlePh} required />
      </Field>

      <Field label={t.cover}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-16 w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-sand-50">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs text-muted">{t.noImage}</span>
            )}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:border-ink/35">
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} disabled={uploading} />
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} {cover ? t.change : t.add}
          </label>
          {cover && (
            <button type="button" onClick={() => setCover("")} className="text-sm font-medium text-danger">
              {t.remove}
            </button>
          )}
        </div>
      </Field>

      <Field label={t.excerpt} htmlFor="excerpt">
        <Textarea id="excerpt" name="excerpt" defaultValue={defaults.excerpt} rows={2} placeholder={t.excerptPh} />
      </Field>

      <Field label={t.body} htmlFor="body" required hint={t.bodyHint}>
        <Textarea id="body" name="body" defaultValue={defaults.body} rows={16} placeholder={t.bodyPh} required />
      </Field>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/15 bg-white p-4 text-sm font-medium text-foreground transition-colors hover:border-ink/30 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50/60">
        <input type="checkbox" name="isPublished" defaultChecked={defaults.isPublished} className="h-5 w-5 rounded border-ink/25 text-brand-500 focus:ring-brand-400" />
        {t.publish}
      </label>

      {state.error && (
        <div className="flex items-center gap-2 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-700 ring-1 ring-inset ring-danger-200/70">
          <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}

      <div className="border-t border-border pt-5">
        <Button type="submit" size="lg" loading={pending}>{id ? t.save : t.create}</Button>
      </div>
    </form>
  );
}
