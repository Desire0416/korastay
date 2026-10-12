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
import { NativeSelect } from "@/components/ui/native-select";
import { EmptyState } from "@/components/ui/empty-state";
import { UploadField } from "@/components/dashboard/upload-field";
import { SmartImage } from "@/components/ui/smart-image";
import { saveMenuItem, deleteMenuItem, toggleMenuItem, type PartnerResult } from "@/server/actions/partner";
import { useI18n } from "@/components/i18n/provider";
import { formatPrice, cn } from "@/lib/utils";

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
}

// Valeurs stockees en base (FR) ; le libelle affiche vient du dictionnaire.
const CATEGORIES = ["Entrées", "Plats", "Desserts", "Boissons", "Formules"];

export function MenuManager({ items }: { items: MenuItem[] }) {
  const router = useRouter();
  const dict = useI18n();
  const t = dict.dashPartner.menu;
  const catLabel = (c: string) => t.categories[c] ?? c;
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

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(item: MenuItem) {
    setEditing(item);
    setShowForm(true);
  }
  function close() {
    setShowForm(false);
    setEditing(null);
  }

  function runToggle(id: string) {
    setBusyId(id);
    start(async () => {
      await toggleMenuItem(id);
      router.refresh();
      setBusyId(null);
    });
  }
  function runDelete(id: string) {
    if (!window.confirm(t.confirmDelete)) return;
    setBusyId(id);
    start(async () => {
      const r = await deleteMenuItem(id);
      if (r.ok) toast.success(t.deleted);
      router.refresh();
      setBusyId(null);
    });
  }

  const grouped = CATEGORIES.map((c) => ({ category: catLabel(c), key: c, items: items.filter((i) => (i.category ?? "Plats") === c) })).filter(
    (g) => g.items.length > 0
  );
  const uncategorized = items.filter((i) => !CATEGORIES.includes(i.category ?? "Plats"));
  const groups = [...grouped, ...(uncategorized.length ? [{ category: t.other, key: "other", items: uncategorized }] : [])];

  return (
    <div className="space-y-8">
      {!showForm && (
        <Button onClick={openAdd} variant="terracotta">
          <Plus className="h-4 w-4" /> {t.add}
        </Button>
      )}

      {showForm && (
        <form key={editing?.id ?? "new"} action={action} className="rounded-[1.5rem] border border-border/80 bg-surface p-6 shadow-card sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-xl text-foreground">{editing ? t.editTitle : t.newTitle}</h3>
            <button type="button" onClick={close} className="rounded-full p-2 text-muted transition-colors hover:bg-sand-50 hover:text-ink" aria-label={t.close}>
              <X className="h-4 w-4" />
            </button>
          </div>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t.name} htmlFor="name" required>
              <Input id="name" name="name" defaultValue={editing?.name ?? ""} placeholder={t.namePh} required />
            </Field>
            <Field label={t.price} htmlFor="price" required>
              <Input id="price" name="price" type="number" min={0} step={100} defaultValue={editing?.price ?? ""} placeholder="3500" required />
            </Field>
            <Field label={t.category} htmlFor="category">
              <NativeSelect id="category" name="category" defaultValue={editing?.category ?? "Plats"}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{catLabel(c)}</option>
                ))}
              </NativeSelect>
            </Field>
            <div className="sm:row-span-2">
              <UploadField name="imageUrl" label={t.photo} defaultUrl={editing?.imageUrl ?? ""} />
            </div>
            <Field label={t.description} htmlFor="description">
              <Textarea id="description" name="description" rows={2} defaultValue={editing?.description ?? ""} placeholder={t.descriptionPh} />
            </Field>
          </div>
          <div className="mt-6 flex gap-2 border-t border-border pt-5">
            <Button type="submit" loading={saving}>{editing ? t.save : t.addToMenu}</Button>
            <Button type="button" variant="ghost" onClick={close}>{dict.dash.common.cancel}</Button>
          </div>
        </form>
      )}

      {items.length === 0 && !showForm ? (
        <EmptyState icon={CookingPot} title={t.emptyTitle} description={t.emptyText} />
      ) : (
        groups.map((g) => (
          <div key={g.key}>
            <h3 className="mb-3 flex items-center gap-3 font-display text-xl text-foreground">
              {g.category}
              <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-sand-300 to-transparent" />
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {g.items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex gap-3.5 rounded-[1.25rem] border border-border/80 bg-surface p-3 shadow-soft transition-opacity",
                    !item.isAvailable && "opacity-60"
                  )}
                >
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded-arch-sm bg-sand-100">
                    {item.imageUrl ? (
                      <SmartImage src={item.imageUrl} alt={item.name} seed={item.id} sizes="80px" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-terracotta/60">
                        <CookingPot className="h-6 w-6" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold leading-snug text-foreground">{item.name}</p>
                      <span className="shrink-0 font-display text-lg leading-none text-terracotta">{formatPrice(item.price)}</span>
                    </div>
                    {item.description && <p className="mt-1 line-clamp-2 text-xs text-muted">{item.description}</p>}
                    <div className="mt-2.5 flex items-center gap-1">
                      <button
                        onClick={() => runToggle(item.id)}
                        disabled={busyId === item.id || pending}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:bg-sand-50 hover:text-ink"
                        title={item.isAvailable ? t.makeUnavailable : t.makeAvailable}
                      >
                        {busyId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : item.isAvailable ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                        {item.isAvailable ? t.visible : t.hidden}
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:bg-sand-50 hover:text-ink"
                      >
                        <Pencil className="h-3.5 w-3.5" /> {t.edit}
                      </button>
                      <button
                        onClick={() => runDelete(item.id)}
                        disabled={busyId === item.id || pending}
                        className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-danger transition-colors hover:bg-danger-50"
                        aria-label={t.delete}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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
