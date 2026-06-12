"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { updateProfile, type FormResult } from "@/server/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { initials } from "@/lib/utils";

interface ProfileFormProps {
  defaults: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    country?: string;
    bio?: string;
    avatarUrl?: string | null;
  };
}

export function ProfileForm({ defaults }: ProfileFormProps) {
  const [state, action, pending] = useActionState<FormResult, FormData>(updateProfile, { ok: false });
  const [avatar, setAvatar] = React.useState<string>(defaults.avatarUrl ?? "");
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

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
        setAvatar(data.url);
        toast.success("Photo prête. N'oubliez pas d'enregistrer.");
      } else {
        toast.error(data.error ?? "Échec de l'upload.");
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="avatarUrl" value={avatar} />

      {/* Photo de profil */}
      <div className="flex items-center gap-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border bg-brand-100">
          {avatar ? (
            <img src={avatar} alt="Photo de profil" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-700">
              {initials(defaults.firstName, defaults.lastName)}
            </span>
          )}
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-ink/40">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </span>
          )}
        </div>
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand-300">
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} disabled={uploading} />
            <Camera className="h-4 w-4" /> {avatar ? "Changer la photo" : "Ajouter une photo"}
          </label>
          {avatar && (
            <button type="button" onClick={() => setAvatar("")} className="ml-2 inline-flex items-center gap-1 text-sm font-medium text-danger hover:underline">
              <Trash2 className="h-3.5 w-3.5" /> Retirer
            </button>
          )}
          <p className="mt-1.5 text-xs text-muted">JPG, PNG ou WebP — 6 Mo max.</p>
        </div>
      </div>

      {/* Identite */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Prenom" htmlFor="firstName" required>
          <Input id="firstName" name="firstName" defaultValue={defaults.firstName} required />
        </Field>
        <Field label="Nom" htmlFor="lastName" required>
          <Input id="lastName" name="lastName" defaultValue={defaults.lastName} required />
        </Field>
      </div>

      <Field label="Email" hint="L'email ne peut pas être modifié ici.">
        <Input defaultValue={defaults.email} disabled />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Téléphone" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={defaults.phone} placeholder="+225 ..." />
        </Field>
        <Field label="Ville" htmlFor="city">
          <Input id="city" name="city" defaultValue={defaults.city} placeholder="Abidjan" />
        </Field>
        <Field label="Pays" htmlFor="country">
          <Input id="country" name="country" defaultValue={defaults.country ?? "Côte d'Ivoire"} placeholder="Côte d'Ivoire" />
        </Field>
      </div>

      <Field label="A propos de moi" htmlFor="bio" hint="Une courte présentation (facultatif).">
        <Textarea id="bio" name="bio" defaultValue={defaults.bio ?? ""} rows={4} placeholder="Parlez un peu de vous, de vos préférences de voyage..." maxLength={600} />
      </Field>

      <Button type="submit" loading={pending}>Enregistrer les modifications</Button>
    </form>
  );
}
