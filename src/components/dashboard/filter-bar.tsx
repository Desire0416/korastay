"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/provider";
import { statusText } from "@/lib/dictionaries/enums";

export type FilterField =
  | { type: "search"; name: string; placeholder?: string }
  | { type: "select"; name: string; label: string; options: { value: string; label: string }[] };

interface FilterBarProps {
  fields: FilterField[];
  className?: string;
}

// Barre de filtres avancee, pilotee par l'URL (searchParams).
// Reutilisable sur toutes les listes des espaces connectes.
export function FilterBar({ fields, className }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const dict = useI18n();

  const searchField = fields.find((f) => f.type === "search") as Extract<FilterField, { type: "search" }> | undefined;
  const selects = fields.filter((f) => f.type === "select") as Extract<FilterField, { type: "select" }>[];

  const [text, setText] = React.useState(searchField ? sp.get(searchField.name) ?? "" : "");

  const buildUrl = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(Array.from(sp.entries()));
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "") params.delete(k);
        else params.set(k, v);
      }
      params.delete("page");
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [sp, pathname]
  );

  // Recherche texte debouncee
  React.useEffect(() => {
    if (!searchField) return;
    const current = sp.get(searchField.name) ?? "";
    if (text === current) return;
    const t = setTimeout(() => {
      router.push(buildUrl({ [searchField.name]: text || null }), { scroll: false });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Synchronise le champ texte si l'URL change ailleurs (ex: reinitialisation)
  React.useEffect(() => {
    if (!searchField) return;
    setText(sp.get(searchField.name) ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const activeCount = fields.reduce((n, f) => (sp.get(f.name) ? n + 1 : n), 0);

  return (
    <div className={cn("mb-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center", className)}>
      {searchField && (
        <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={searchField.placeholder ?? dict.dash.common.search}
            className="h-11 w-full rounded-full border border-ink/15 bg-white pl-10 pr-4 text-sm text-foreground placeholder:text-muted transition-colors hover:border-ink/30 focus-visible:border-terracotta focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-terracotta/10"
          />
        </div>
      )}

      {selects.map((f) => {
        const value = sp.get(f.name) ?? "";
        return (
          <div key={f.name} className="relative">
            <select
              value={value}
              onChange={(e) => router.push(buildUrl({ [f.name]: e.target.value || null }), { scroll: false })}
              className={cn(
                "h-11 appearance-none rounded-full border bg-white pl-4 pr-9 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-terracotta/10",
                value ? "border-ink text-ink" : "border-ink/15 text-muted hover:border-ink/30"
              )}
            >
              <option value="">{statusText(dict, f.label)}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {statusText(dict, o.label)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </div>
        );
      })}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => {
            setText("");
            router.push(pathname, { scroll: false });
          }}
          className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-terracotta transition-colors hover:bg-terracotta-50"
        >
          <X className="h-4 w-4" /> {dict.dash.common.reset}
        </button>
      )}
    </div>
  );
}
