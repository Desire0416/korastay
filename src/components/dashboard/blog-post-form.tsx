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

interface Props {
  id?: string;
  defaults?: { title?: string; excerpt?: string; body?: string; coverImageUrl?: string; isPublished?: boolean };
}

export function BlogPostForm({ id, defaults = {} }: Props) {
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
      if (res.ok && data.url) { setCover(data.url); toast.success("Image prête."); }
      else toast.error(data.error ?? "Échec.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="coverImageUrl" value={cover} />

      <Field label="Titre" htmlFor="title" required>
        <Input id="title" name="title" defaultValue={defaults.title} placeholder="Titre de l'article" required />
      </Field>

      <Field label="Image de couverture">
        <div className="flex items-center gap-3">
          <div className="h-16 w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-soft">
            {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-xs text-muted">Aucune</span>}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold hover:border-brand-300">
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} disabled={uploading} />
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} {cover ? "Changer" : "Ajouter"}
          </label>
          {cover && <button type="button" onClick={() => setCover("")} className="text-sm font-medium text-danger">Retirer</button>}
        </div>
      </Field>

      <Field label="Resume / chapeau" htmlFor="excerpt">
        <Textarea id="excerpt" name="excerpt" defaultValue={defaults.excerpt} rows={2} placeholder="Court résumé affiche dans la liste..." />
      </Field>

      <Field label="Contenu" htmlFor="body" required hint="Separez les paragraphes par une ligne vide.">
        <Textarea id="body" name="body" defaultValue={defaults.body} rows={14} placeholder="Redigez votre article..." required />
      </Field>

      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input type="checkbox" name="isPublished" defaultChecked={defaults.isPublished} className="h-4 w-4 rounded border-border text-brand-500" />
        Publier l'article (visible sur le blog)
      </label>

      {state.error && <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-danger"><AlertCircle className="h-4 w-4" /> {state.error}</div>}

      <Button type="submit" size="lg" loading={pending}>{id ? "Enregistrer" : "Créer l'article"}</Button>
    </form>
  );
}
