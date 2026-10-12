// Classes partagees des espaces connectes v2 (cartes, tableaux, titres de
// section) : une seule source pour garder proprietaire, partenaire,
// entreprise et admin alignes sur l'espace voyageur.

export const card = "rounded-[1.5rem] border border-border/80 bg-surface shadow-soft";

export const sectionTitle = "font-display text-[1.45rem] font-normal leading-tight text-foreground";

export const cardTitle = "flex items-center gap-2.5 font-display text-xl text-foreground";

export const table = {
  wrap: "overflow-hidden rounded-[1.5rem] border border-border/80 bg-surface shadow-soft",
  table: "w-full text-sm",
  head: "border-b border-border bg-sand-50/80 text-left",
  th: "eyebrow px-5 py-3 text-[9.5px] font-semibold text-muted",
  body: "divide-y divide-border/70",
  row: "transition-colors hover:bg-sand-50/60",
  td: "px-5 py-3.5",
  link: "font-semibold text-terracotta underline-offset-4 hover:underline",
};

// Carte de liste mobile (alternative aux tableaux sous md).
export const mobileItem =
  "block rounded-[1.25rem] border border-border/80 bg-surface p-4 shadow-soft transition-colors active:bg-sand-50";
