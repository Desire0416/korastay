import { headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  getDictionary,
  isLocale,
  type Dictionary,
  type Locale,
} from "./i18n";

/**
 * Lit la locale courante depuis l'en-tete pose par le middleware (x-locale).
 * La source de verite est l'URL : /en/... -> en, sinon fr.
 */
export async function getLocale(): Promise<Locale> {
  const store = await headers();
  const value = store.get("x-locale");
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Chemin d'origine de la requete (avec eventuel prefixe /en) — pour la bascule de langue. */
export async function getPathname(): Promise<string> {
  const store = await headers();
  return store.get("x-pathname") ?? "/";
}

/** Raccourci : renvoie locale + dictionnaire. */
export async function getI18n(): Promise<{ locale: Locale; dict: Dictionary }> {
  const locale = await getLocale();
  return { locale, dict: getDictionary(locale) };
}
