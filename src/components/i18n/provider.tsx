"use client";

import * as React from "react";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n";

// Contexte i18n cote client : porte le dictionnaire courant (locale incluse).
// Valeur par defaut = FR pour ne jamais lever d'erreur la ou le provider
// n'est pas (encore) monte — degrade proprement vers le francais.
const I18nContext = React.createContext<Dictionary>(getDictionary("fr"));

export function I18nProvider({
  dict,
  children,
}: {
  dict: Dictionary;
  children: React.ReactNode;
}) {
  return <I18nContext.Provider value={dict}>{children}</I18nContext.Provider>;
}

/** Dictionnaire courant (cote client). */
export function useI18n(): Dictionary {
  return React.useContext(I18nContext);
}

/** Locale courante (cote client). */
export function useLocale(): Locale {
  return React.useContext(I18nContext).locale;
}
