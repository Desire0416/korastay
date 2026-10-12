"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle, Camera, Loader2, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { saveDestination, type DestResult } from "@/server/actions/destinations";
import { useI18n } from "@/components/i18n/provider";

interface DestinationFormProps {
  id?: string;
  defaults?: {
    name?: string; region?: string; country?: string; description?: string;
    heroImageUrl?: string; priority?: number; latitude?: number | null; longitude?: number | null; isActive?: boolean;
  };
}

export function DestinationForm({ id, defaults = {} }: DestinationFormProps) {
  const t = useI18n().dashAdmin.catalog.destinationForm;
  const action = saveDestination.bind(null, id ?? null);
  const [state, formAction, pending] = useActionState<DestResult, FormData>(action, { ok: false });
  const formRef = React.useRef<HTMLFormElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [image, setImage] = React.useState(defaults.heroImageUrl ?? "");
  const [uploading, setUploading] = React.useState(false);
  const [lat, setLat] = React.useState(defaults.latitude != null ? String(defaults.latitude) : "");
  const [lng, setLng] = React.useState(defaults.longitude != null ? String(defaults.longitude) : "");
  const [locating, setLocating] = React.useState(false);

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
        setImage(data.url);
        toast.success(t.imageReady);
      } else toast.error(data.error ?? t.uploadFailed);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function geolocate() {
    const fd = new FormData(formRef.current!);
    const q = [fd.get("name"), fd.get("region"), fd.get("country")].map(String).filter((s) => s && s !== "null").join(", ");
    if (!q) {
      toast.error(t.cityFirst);
      return;
    }
    setLocating(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, {
        headers: { Accept: "application/json" },
      });
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
        setLat(Number(data[0].lat).toFixed(6));
        setLng(Number(data[0].lon).toFixed(6));
        toast.success(t.located);
      } else {
        toast.error(t.notFound);
      }
    } catch {
      toast.error(t.geoUnavailable);
    } finally {
      setLocating(false);
    }
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <input type="hidden" name="heroImageUrl" value={image} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.name} htmlFor="name" required>
          <Input id="name" name="name" defaultValue={defaults.name} placeholder="Daloa" required />
        </Field>
        <Field label={t.region} htmlFor="region">
          <Input id="region" name="region" defaultValue={defaults.region} placeholder="Haut-Sassandra" />
        </Field>
        <Field label={t.country} htmlFor="country">
          <Input id="country" name="country" defaultValue={defaults.country ?? "Côte d'Ivoire"} />
        </Field>
        <Field label={t.priority} htmlFor="priority" hint={t.priorityHint}>
          <Input id="priority" name="priority" type="number" min={0} defaultValue={defaults.priority ?? 5} />
        </Field>
      </div>

      {/* Position geographique */}
      <div className="rounded-xl bg-sand-50 p-4 ring-1 ring-inset ring-sand-200">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-foreground">{t.position}</p>
          <Button type="button" variant="outline" size="sm" className="bg-white" onClick={geolocate} loading={locating}>
            <LocateFixed className="h-4 w-4" /> {t.locate}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitude" htmlFor="latitude">
            <Input id="latitude" name="latitude" type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="6.877" />
          </Field>
          <Field label="Longitude" htmlFor="longitude">
            <Input id="longitude" name="longitude" type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-6.45" />
          </Field>
        </div>
        <p className="mt-2 text-xs text-muted">{t.locateHint}</p>
      </div>

      {/* Image par import */}
      <Field label={t.image} hint={t.imageHint}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-16 w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-sand-50">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs text-muted">{t.noImage}</span>
            )}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:border-ink/35">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} disabled={uploading} />
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} {image ? t.change : t.upload}
          </label>
          {image && (
            <button type="button" onClick={() => setImage("")} className="text-sm font-medium text-danger">
              {t.remove}
            </button>
          )}
        </div>
      </Field>

      <Field label={t.description} htmlFor="description">
        <Textarea id="description" name="description" defaultValue={defaults.description} rows={4} placeholder={t.descriptionPh} />
      </Field>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/15 bg-white p-4 text-sm font-medium text-foreground transition-colors hover:border-ink/30 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50/60">
        <input type="checkbox" name="isActive" defaultChecked={defaults.isActive ?? true} className="h-5 w-5 rounded border-ink/25 text-brand-500 focus:ring-brand-400" />
        {t.active}
      </label>

      {state.error && (
        <div className="flex items-center gap-2 rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700 ring-1 ring-inset ring-danger-200/70">
          <AlertCircle className="h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}

      <div className="border-t border-border pt-5">
        <Button type="submit" size="lg" loading={pending}>{id ? t.save : t.create}</Button>
      </div>
    </form>
  );
}
