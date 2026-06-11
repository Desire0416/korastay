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

interface DestinationFormProps {
  id?: string;
  defaults?: {
    name?: string; region?: string; country?: string; description?: string;
    heroImageUrl?: string; priority?: number; latitude?: number | null; longitude?: number | null; isActive?: boolean;
  };
}

export function DestinationForm({ id, defaults = {} }: DestinationFormProps) {
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
      if (res.ok && data.url) { setImage(data.url); toast.success("Image prete."); }
      else toast.error(data.error ?? "Echec de l'upload.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function geolocate() {
    const fd = new FormData(formRef.current!);
    const q = [fd.get("name"), fd.get("region"), fd.get("country")].map(String).filter((s) => s && s !== "null").join(", ");
    if (!q) { toast.error("Renseignez d'abord la ville."); return; }
    setLocating(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, {
        headers: { Accept: "application/json" },
      });
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
        setLat(Number(data[0].lat).toFixed(6));
        setLng(Number(data[0].lon).toFixed(6));
        toast.success("Coordonnees trouvees automatiquement.");
      } else {
        toast.error("Lieu introuvable. Saisissez les coordonnees manuellement.");
      }
    } catch {
      toast.error("Geolocalisation indisponible pour le moment.");
    } finally {
      setLocating(false);
    }
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="heroImageUrl" value={image} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nom de la ville" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={defaults.name} placeholder="Daloa" required />
        </Field>
        <Field label="Region" htmlFor="region">
          <Input id="region" name="region" defaultValue={defaults.region} placeholder="Haut-Sassandra" />
        </Field>
        <Field label="Pays" htmlFor="country">
          <Input id="country" name="country" defaultValue={defaults.country ?? "Cote d'Ivoire"} />
        </Field>
        <Field label="Priorite d'affichage" htmlFor="priority" hint="Plus petit = affiche en premier">
          <Input id="priority" name="priority" type="number" min={0} defaultValue={defaults.priority ?? 5} />
        </Field>
      </div>

      {/* Position geographique */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-foreground">Position geographique</p>
          <Button type="button" variant="outline" size="sm" onClick={geolocate} loading={locating}>
            <LocateFixed className="h-4 w-4" /> Localiser automatiquement
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
        <p className="mt-1 text-xs text-muted">Cliquez sur « Localiser » pour trouver les coordonnees a partir du nom de la ville.</p>
      </div>

      {/* Image par import */}
      <Field label="Image de la destination" hint="Importez une photo (JPG, PNG, WebP). Sinon, un visuel de marque est utilise.">
        <div className="flex items-center gap-3">
          <div className="h-16 w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-soft">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs text-muted">Aucune</span>
            )}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold hover:border-brand-300">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} disabled={uploading} />
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} {image ? "Changer" : "Importer"}
          </label>
          {image && <button type="button" onClick={() => setImage("")} className="text-sm font-medium text-danger">Retirer</button>}
        </div>
      </Field>

      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={defaults.description} rows={4} placeholder="Presentez la destination..." />
      </Field>

      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input type="checkbox" name="isActive" defaultChecked={defaults.isActive ?? true} className="h-4 w-4 rounded border-border text-brand-500" />
        Destination active (visible sur le site)
      </label>

      {state.error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          <AlertCircle className="h-4 w-4" /> {state.error}
        </div>
      )}

      <Button type="submit" size="lg" loading={pending}>{id ? "Enregistrer" : "Creer la destination"}</Button>
    </form>
  );
}
