import type { Metadata } from "next";

// Construit les balises canonical + hreflang (FR/EN) pour une page donnee.
// Les chemins sont relatifs : ils sont resolus contre metadataBase (SITE_URL).
//   alternatesFor("/")           -> en = /en
//   alternatesFor("/residences") -> en = /en/residences
export function alternatesFor(path: string): NonNullable<Metadata["alternates"]> {
  const clean = path === "/" ? "" : path;
  return {
    canonical: path,
    languages: {
      "fr-FR": path,
      "en-US": `/en${clean}`,
      "x-default": path,
    },
  };
}
