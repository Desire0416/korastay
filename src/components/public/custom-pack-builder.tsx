"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, ShoppingBag, Sparkles, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Stepper } from "@/components/ui/stepper";
import { Motif } from "@/components/brand/motif";
import { StepHeading } from "./step-heading";
import { cn, formatPrice } from "@/lib/utils";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";
import { submitCustomPack, type CustomPackResult } from "@/server/actions/custom-pack";
import type { CityService } from "@/lib/custom-pack-queries";

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
  const dict = useI18n();
  const t = dict.customPack;
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
    if (cartForCity.length === 0) { setError(t.errorEmpty); return; }
    if (!name.trim() || !email.includes("@")) { setError(t.errorContact); return; }
    start(async () => {
      const res = await submitCustomPack({
        cityName: city,
        serviceIds: cartForCity.map((s) => s.id),
        persons, startDate: startDate || undefined, notes,
        contactName: name, email, phone,
      });
      if (res.ok) setDone(res);
      else setError(res.error ?? t.errorGeneric);
    });
  }

  if (done) {
    return (
      <div className="relative mx-auto max-w-xl overflow-hidden rounded-[2rem] bg-brand-500 p-10 text-center text-white">
        <Motif variant="bogolan" fade="bottom" className="text-white/[0.08]" />
        <div className="relative mx-auto flex h-16 w-14 items-center justify-center rounded-arch-sm bg-white/15">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="relative mt-5 font-display text-3xl">{t.doneTitle}</h2>
        <p className="relative mt-3 leading-relaxed text-white/80">
          {t.doneText.replace("{ref}", done.reference ?? "")}
        </p>
        <div className="relative mt-7 flex flex-wrap justify-center gap-3">
          <Button variant="white" onClick={() => router.push(localePath("/account/custom-packs", dict.locale))}>{t.track}</Button>
          <Button variant="outline-light" onClick={() => { setDone(null); setSelected({}); }}>{t.another}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px]">
      {/* Selection */}
      <div>
        <StepHeading step={1} title={t.step1} />
        <div className="no-scrollbar -mx-5 mb-12 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
          {cities.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => changeCity(c.name)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                city === c.name ? "border-ink bg-ink text-white" : "border-ink/15 bg-white text-foreground hover:border-ink/40"
              )}
            >
              <MapPin className="h-3.5 w-3.5" /> {c.name}
            </button>
          ))}
        </div>

        <StepHeading step={2} title={t.step2} />
        {services.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-sand-400/70 bg-sand-50/70 p-8 text-center text-muted">
            {t.noServices}
          </div>
        ) : (
          <div className="space-y-9">
            {Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <h3 className="eyebrow mb-3 text-[10.5px] text-terracotta">{t.types[type] ?? type}</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {items.map((s) => {
                    const isSel = !!selected[s.id];
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggle(s)}
                        aria-pressed={isSel}
                        className={cn(
                          "flex flex-col rounded-[1.25rem] border p-5 text-left transition-all",
                          isSel ? "border-ink bg-white shadow-soft ring-1 ring-ink" : "border-ink/15 bg-white hover:border-ink/35"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-display text-[17px] leading-snug text-foreground">{s.title}</span>
                          <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors", isSel ? "border-ink bg-ink text-white" : "border-ink/20 text-muted")}>
                            {isSel ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </span>
                        </div>
                        <span className="mt-1 text-xs text-muted">{s.partnerName}{s.duration ? ` · ${s.duration}` : ""}</span>
                        {s.description && <span className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">{s.description}</span>}
                        <span className="mt-3 text-sm font-bold text-foreground">{t.from.replace("{price}", formatPrice(s.priceFrom))}</span>
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
        <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-surface p-6 pt-7 shadow-card lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 overflow-hidden">
            <div className="motif motif-kente text-terracotta/70" />
          </div>
          <h2 className="flex items-center gap-2.5 font-display text-xl text-foreground">
            <ShoppingBag className="h-5 w-5 text-terracotta" strokeWidth={1.7} /> {t.cart.replace("{city}", city)}
          </h2>

          {cartForCity.length === 0 ? (
            <p className="mt-3 text-sm text-muted">{t.cartEmpty}</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {cartForCity.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate text-foreground">{s.title}</span>
                  <span className="shrink-0 text-muted">{formatPrice(s.priceFrom)}</span>
                  <button type="button" onClick={() => toggle(s)} className="shrink-0 text-xs font-semibold text-danger hover:underline">{t.remove}</button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 space-y-3 border-t border-border pt-5">
            <div className="rounded-xl border border-ink/15 px-4">
              <Stepper label={t.travelers} value={persons} onChange={setPersons} min={1} max={20} />
            </div>
            <Field label={t.desiredDate}>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
            </Field>
          </div>

          {/* Prix */}
          <div className="mt-5 space-y-2 rounded-[1.25rem] bg-sand-50 p-4 text-sm ring-1 ring-inset ring-sand-200">
            <div className="flex justify-between text-muted"><span>{t.subtotal}</span><span className="text-foreground">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-muted"><span>{t.serviceFee}</span><span className="text-foreground">{formatPrice(fee)}</span></div>
            <div className="flex items-baseline justify-between border-t border-sand-300 pt-2.5 font-bold text-foreground">
              <span>{t.estimatedTotal}</span><span className="font-display text-xl font-normal">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-5 space-y-3 border-t border-border pt-5">
            <Field label={t.name} required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePlaceholder} /></Field>
            <Field label={t.email} required><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@email.com" /></Field>
            <Field label={t.phone}><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+225 ..." /></Field>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.notesPlaceholder} rows={2} />
          </div>

          {error && (
            <div role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-danger ring-1 ring-inset ring-red-200/70">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <Button onClick={submit} loading={pending} size="lg" className="mt-5 w-full">
            <Sparkles className="h-4 w-4" /> {t.submit}
          </Button>
          <p className="mt-2.5 text-center text-xs text-muted">{t.disclaimer}</p>
        </div>
      </aside>
    </div>
  );
}
