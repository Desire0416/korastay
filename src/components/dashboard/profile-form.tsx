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
import { useI18n } from "@/components/i18n/provider";

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
  const dict = useI18n();
  const t = dict.dashAccount.profileForm;
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
        toast.success(t.photoReady);
      } else {
        toast.error(data.error ?? t.uploadFailed);
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
        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-arch-sm bg-sand-200 ring-1 ring-sand-300">
          {avatar ? (
            <img src={avatar} alt={t.photoAlt} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-display text-2xl text-sand-900">
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
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-ink/40">
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} disabled={uploading} />
            <Camera className="h-4 w-4" /> {avatar ? t.changePhoto : t.addPhoto}
          </label>
          {avatar && (
            <button type="button" onClick={() => setAvatar("")} className="ml-2 inline-flex items-center gap-1 text-sm font-medium text-danger hover:underline">
              <Trash2 className="h-3.5 w-3.5" /> {t.remove}
            </button>
          )}
          <p className="mt-1.5 text-xs text-muted">{t.photoHint}</p>
        </div>
      </div>

      {/* Identite */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.firstName} htmlFor="firstName" required>
          <Input id="firstName" name="firstName" defaultValue={defaults.firstName} required />
        </Field>
        <Field label={t.lastName} htmlFor="lastName" required>
          <Input id="lastName" name="lastName" defaultValue={defaults.lastName} required />
        </Field>
      </div>

      <Field label={t.email} hint={t.emailHint}>
        <Input defaultValue={defaults.email} disabled />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.phone} htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={defaults.phone} placeholder="+225 ..." />
        </Field>
        <Field label={t.city} htmlFor="city">
          <Input id="city" name="city" defaultValue={defaults.city} placeholder="Abidjan" />
        </Field>
        <Field label={t.country} htmlFor="country">
          <Input id="country" name="country" defaultValue={defaults.country ?? "Côte d'Ivoire"} placeholder="Côte d'Ivoire" />
        </Field>
      </div>

      <Field label={t.bio} htmlFor="bio" hint={t.bioHint}>
        <Textarea id="bio" name="bio" defaultValue={defaults.bio ?? ""} rows={4} placeholder={t.bioPlaceholder} maxLength={600} />
      </Field>

      <Button type="submit" loading={pending}>{t.save}</Button>
    </form>
  );
}
