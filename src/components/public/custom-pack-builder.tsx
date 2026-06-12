"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, ShoppingBag, Sparkles, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Stepper } from "@/components/ui/stepper";
import { cn, formatPrice } from "@/lib/utils";
import { submitCustomPack, type CustomPackResult } from "@/server/actions/custom-pack";
import type { CityService } from "@/lib/custom-pack-queries";

const TYPE_LABELS: Record<string, string> = {
  GUIDE: "Guides & visites", TRANSPORT: "Transport", RESTAURANT: "Restauration", ACTIVITY: "Activités", OTHER: "Autres prestations",
};
const SERVICE_FEE = 0.07; // apercu (le total faisant foi est calcule cote serveur)

interface City { slug: string; name: string }

interface CustomPackBuilderProps {
  cities: City[];
  servicesByCity: Record<string, CityService[]>;
  initialCityName?: string;
  defaultContact: { name: string; email: string; phone: string };
}

export function CustomPackBuilder({ cities, servicesByCity, initialCityName, defaultContact }: CustomPackBuilderProps) {
  const router = useRouter();
  const [city, setCity] = React.useState<string>(initialCityName && servicesByCity[initialCityName] ? initialCityName : cities[0]?.name ?? "");
  const [selected, setSelected] = React.useState<Record<string, CityService>>({});
  const [persons, setPersons] = React.useState(2);
  const [startDate, setStartDate] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [name, setName] = React.useState(defaultContact.name);
  const [email, setEmail] = React.useState(defaultContact.email);
  const [phone, setPhone] = React.useState(defaultContact.phone);
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<CustomPackResult | null>(null);

  const services = servicesByCity[city] ?? [];
  const grouped = React.useMemo(() => {
    const g: Record<string, CityService[]> = {};
    for (const s of services) (g[s.partnerType] ??= []).push(s);
    return g;
  }, [services]);

  // ne garde dans le panier que les services de la ville courante
  const cartForCity = Object.values(selected).filter((s) => services.some((sv) => sv.id === s.id));
  const subtotal = cartForCity.reduce((sum, s) => sum + s.priceFrom, 0);
  const fee = Math.round(subtotal * SERVICE_FEE);
  const total = subtotal + fee;

  function toggle(s: CityService) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[s.id]) delete next[s.id];
      else next[s.id] = s;
      return next;
    });
  }

  function changeCity(c: string) {
    setCity(c);
    setSelected({}); // reset panier en changeant de ville
  }

  function submit() {
    setError(null);
    if (cartForCity.length === 0) { setError("Ajoutez au moins une prestation a votre pack."); return; }
    if (!name.trim() || !email.includes("@")) { setError("Renseignez votre nom et un email valide."); return; }
    start(async () => {
      const res = await submitCustomPack({
        cityName: city,
        serviceIds: cartForCity.map((s) => s.id),
        persons, startDate: startDate || undefined, notes,
        contactName: name, email, phone,
      });
      if (res.ok) setDone(res);
      else setError(res.error ?? "Une erreur est survenue.");
    });
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-4xl border border-success/30 bg-emerald-50 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success text-white">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-success">Pack envoyé !</h2>
        <p className="mt-2 text-emerald-800/80">
          Votre pack personnalisé <span className="font-bold">{done.reference}</span> a ete soumis. Notre équipe et les
          partenaires concernes ont ete notifiés et reviennent vers vous rapidement.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => router.push("/account/custom-packs")}>Suivre ma demande</Button>
          <Button variant="outline" onClick={() => { setDone(null); setSelected({}); }}>Composer un autre pack</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
      {/* Selection */}
      <div>
        {/* Villes */}
        <p className="mb-2 text-sm font-bold text-foreground">1. Choisissez votre destination</p>
        <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
          {cities.map((c) => (
            <button
              key={c.slug}
              onClick={() => changeCity(c.name)}
              className={cn("flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                city === c.name ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border hover:border-brand-300")}
            >
              <MapPin className="h-3.5 w-3.5" /> {c.name}
            </button>
          ))}
        </div>

        <p className="mb-3 text-sm font-bold text-foreground">2. Sélectionnez vos activités & partenaires</p>
        {services.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface-soft/40 p-8 text-center text-muted">
            Aucun partenaire disponible pour cette ville pour le moment.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-600">{TYPE_LABELS[type] ?? type}</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {items.map((s) => {
                    const isSel = !!selected[s.id];
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggle(s)}
                        className={cn("flex flex-col rounded-3xl border p-4 text-left transition-all",
                          isSel ? "border-brand-500 bg-brand-50 ring-1 ring-brand-200" : "border-border bg-surface hover:border-brand-300")}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-foreground">{s.title}</span>
                          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border", isSel ? "border-brand-500 bg-brand-500 text-white" : "border-border text-muted")}>
                            {isSel ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </span>
                        </div>
                        <span className="mt-0.5 text-xs text-muted">{s.partnerName}{s.duration ? ` · ${s.duration}` : ""}</span>
                        {s.description && <span className="mt-1 line-clamp-2 text-xs text-muted">{s.description}</span>}
                        <span className="mt-2 text-sm font-extrabold text-foreground">des {formatPrice(s.priceFrom)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panier */}
      <aside>
        <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] rounded-3xl border border-border bg-surface p-5 shadow-card">
          <h2 className="flex items-center gap-2 font-bold text-foreground"><ShoppingBag className="h-5 w-5 text-brand-600" /> Votre pack {city}</h2>

          {cartForCity.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Ajoutez des prestations pour composer votre pack.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {cartForCity.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate text-foreground">{s.title}</span>
                  <span className="shrink-0 text-muted">{formatPrice(s.priceFrom)}</span>
                  <button onClick={() => toggle(s)} className="shrink-0 text-xs font-semibold text-danger">retirer</button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <div className="rounded-2xl border border-border px-4">
              <Stepper label="Voyageurs" value={persons} onChange={setPersons} min={1} max={20} />
            </div>
            <Field label="Date souhaitee">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
            </Field>
          </div>

          {/* Prix */}
          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted"><span>Sous-total</span><span className="text-foreground">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-muted"><span>Frais de service</span><span className="text-foreground">{formatPrice(fee)}</span></div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-extrabold text-foreground"><span>Total estime</span><span>{formatPrice(total)}</span></div>
          </div>

          {/* Contact */}
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <Field label="Nom" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" /></Field>
            <Field label="Email" required><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@email.com" /></Field>
            <Field label="Téléphone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+225 ..." /></Field>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Précisions (facultatif)..." rows={2} />
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-sm font-medium text-danger">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          <Button onClick={submit} loading={pending} size="lg" className="mt-4 w-full">
            <Sparkles className="h-4 w-4" /> Soumettre mon pack
          </Button>
          <p className="mt-2 text-center text-xs text-muted">Devis indicatif. Notre équipe confirmé la disponibilité.</p>
        </div>
      </aside>
    </div>
  );
}
