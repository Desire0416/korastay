// ============================================================
// Libelles traduits des enums affiches cote public. Les *Meta de
// src/lib/enums.ts restent la source FR (tons, etoiles...) ; ce module
// donne le libelle par locale. Etendu au fil des pages refaites.
// ============================================================

export interface EnumsDict {
  quality: Record<string, string>;
  activityCategory: Record<string, string>;
  stayType: Record<string, string>;
}

export const enumsFr: EnumsDict = {
  quality: { ESSENTIAL: "Essentiel", COMFORT: "Confort", PREMIUM: "Premium" },
  activityCategory: {
    EXCURSION: "Excursion",
    VISITE: "Visite de site",
    CULTURE: "Expérience culturelle",
    NATURE: "Sortie nature",
    AVENTURE: "Aventure",
    GASTRONOMIE: "Gastronomie",
  },
  stayType: { any: "Tout type", STUDIO: "Studio", T2: "Appartement T2", T3: "Appartement T3", VILLA: "Villa / Maison" },
};

export const enumsEn: EnumsDict = {
  quality: { ESSENTIAL: "Essential", COMFORT: "Comfort", PREMIUM: "Premium" },
  activityCategory: {
    EXCURSION: "Excursion",
    VISITE: "Site visit",
    CULTURE: "Cultural experience",
    NATURE: "Nature outing",
    AVENTURE: "Adventure",
    GASTRONOMIE: "Food & drink",
  },
  stayType: { any: "Any type", STUDIO: "Studio", T2: "1-bedroom flat", T3: "2-bedroom flat", VILLA: "Villa / House" },
};

/** Libelle d'un enum dans la locale courante, avec repli sur la valeur brute. */
export function enumLabel(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return "";
  return map[value] ?? value;
}
