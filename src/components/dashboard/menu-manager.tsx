"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Loader2, CookingPot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { UploadField } from "@/components/dashboard/upload-field";
import { SmartImage } from "@/components/ui/smart-image";
import { saveMenuItem, deleteMenuItem, toggleMenuItem, type PartnerResult } from "@/server/actions/partner";
import { formatPrice } from "@/lib/utils";

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
}

const CATEGORIES = ["Entrees", "Plats", "Desserts", "Boissons", "Formules"];

export function MenuManager({ items }: { items: MenuItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<MenuItem | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [pending, start] = React.useTransition();
  const [state, action, saving] = useActionState<PartnerResult, FormData>(saveMenuItem, { ok: false });

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      setShowForm(false);
      setEditing(null);
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [state, router]);

  function openAdd() { setEditing(null); setShowForm(true); }
  function openEdit(item: MenuItem) { setEditing(item); setShowForm(true); }

  function runToggle(id: string) {
    setBusyId(id);
    start(async () => { await toggleMenuItem(id); router.refresh(); setBusyId(null); });
  }
  function runDelete(id: string) {
    if (!window.confirm("Supprimer ce plat ?")) return;
    setBusyId(id);
    start(async () => { const r = await deleteMenuItem(id); if (r.ok) toast.success("Plat supprime."); router.refresh(); setBusyId(null); });
  }

  const grouped = CATEGORIES.map((c) => ({ category: c, items: items.filter((i) => (i.category ?? "Plats") === c) }))
    .filter((g) => g.items.length > 0);
  const uncategorized = items.filter((i) => !CATEGORIES.includes(i.category ?? "Plats"));

  return (
    <div className="space-y-6">
      {!showForm && (
        <Button onClick={openAdd}><Plus className="h-4 w-4" /> Ajouter un plat</Button>
      )}

      {showForm && (
        <form key={editing?.id ?? "new"} action={action} className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-foreground">{editing ? "Modifier le plat" : "Nouveau plat"}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="rounded-lg p-1.5 text-muted hover:bg-surface-soft"><X className="h-4 w-4" /></button>
          </div>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nom du plat" htmlFor="name" required>
              <Input id="name" name="name" defaultValue={editing?.name ?? ""} placeholder="Attieke poisson" required />
            </Field>
            <Field label="Prix (F CFA)" htmlFor="price" required>
              <Input id="price" name="price" type="number" min={0} step={100} defaultValue={editing?.price ?? ""} placeholder="3500" required />
            </Field>
            <Field label="Categorie" htmlFor="category">
              <select id="category" name="category" defaultValue={editing?.category ?? "Plats"} className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <div className="sm:row-span-2">
              <UploadField name="imageUrl" label="Photo du plat" defaultUrl={editing?.imageUrl ?? ""} />
            </div>
            <Field label="Description" htmlFor="description" className="sm:col-span-1">
              <Textarea id="description" name="description" rows={2} defaultValue={editing?.description ?? ""} placeholder="Ingredients, accompagnement..." />
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" loading={saving}>{editing ? "Enregistrer" : "Ajouter au menu"}</Button>
            <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Annuler</Button>
          </div>
        </form>
      )}

      {items.length === 0 && !showForm ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center">
          <CookingPot className="mx-auto h-9 w-9 text-muted" />
          <p className="mt-3 font-semibold text-foreground">Votre menu est vide</p>
          <p className="text-sm text-muted">Ajoutez vos plats avec photo et prix pour les presenter aux voyageurs.</p>
        </div>
      ) : (
        [...grouped, ...(uncategorized.length ? [{ category: "Autres", items: uncategorized }] : [])].map((g) => (
          <div key={g.category}>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">{g.category}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {g.items.map((item) => (
                <div key={item.id} className={`flex gap-3 rounded-2xl border border-border bg-surface p-3 shadow-soft ${!item.isAvailable ? "opacity-60" : ""}`}>
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-soft">
                    {item.imageUrl ? <SmartImage src={item.imageUrl} alt={item.name} seed={item.id} /> : <span className="flex h-full items-center justify-center text-muted"><CookingPot className="h-6 w-6" /></span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <span className="shrink-0 font-bold text-brand-600">{formatPrice(item.price)}</span>
                    </div>
                    {item.description && <p className="line-clamp-2 text-xs text-muted">{item.description}</p>}
                    <div className="mt-2 flex items-center gap-1.5">
                      <button onClick={() => runToggle(item.id)} disabled={busyId === item.id || pending} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-muted hover:bg-surface-soft" title={item.isAvailable ? "Rendre indisponible" : "Rendre disponible"}>
                        {busyId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : item.isAvailable ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {item.isAvailable ? "Visible" : "Masque"}
                      </button>
                      <button onClick={() => openEdit(item)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-muted hover:bg-surface-soft"><Pencil className="h-3.5 w-3.5" /> Modifier</button>
                      <button onClick={() => runDelete(item.id)} disabled={busyId === item.id || pending} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-danger hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
