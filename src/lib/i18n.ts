// ============================================================
// Internationalisation (FR par defaut, EN disponible)
// Fondation bilingue : chrome public (header, footer, accueil).
// Module pur (importable cote client). La lecture de la locale
// via cookie se trouve dans i18n.server.ts.
// ============================================================

export type Locale = "fr" | "en";
export const LOCALES: Locale[] = ["fr", "en"];
export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_COOKIE = "korastay_locale";

export const LOCALE_LABELS: Record<Locale, string> = { fr: "Francais", en: "English" };

export interface Dictionary {
  locale: Locale;
  header: {
    becomeHost: string;
    login: string;
    register: string;
    logout: string;
    language: string;
  };
  footer: {
    tagline: string;
    reassurance: { title: string; text: string }[];
    rights: string;
    madeInPrefix: string;
    madeIn: string;
  };
  home: {
    heroBadge: string;
    heroTitleLine1: string;
    heroTitleHighlight: string;
    heroSubtitle: string;
    searchCta: string;
  };
  common: {
    discover: string;
    seeAll: string;
  };
  // Libelles de navigation / pied de page, indexes par href.
  nav: Record<string, string>;
  // Titres des colonnes du pied de page (cle = libelle francais).
  footerColumns: Record<string, string>;
}

const NAV_EN: Record<string, string> = {
  "/residences": "Stays",
  "/packs": "Discovery packs",
  "/destinations": "Destinations",
  "/business": "Business",
  "/packs/custom": "Custom pack",
  "/devenir-proprietaire": "Become a host",
  "/partners": "Become a partner",
  "/about": "About",
  "/blog": "Blog",
  "/quality": "Quality charter",
  "/contact": "Contact",
  "/faq": "FAQ",
  "/conditions-generales": "Terms & conditions",
  "/politique-annulation": "Cancellation policy",
  "/confidentialite": "Privacy policy",
  "/mentions-legales": "Legal notice",
};

const FOOTER_COLUMNS_EN: Record<string, string> = {
  Explorer: "Explore",
  Rejoindre: "Join us",
  KoraStay: "KoraStay",
  Legal: "Legal",
};

const FR: Dictionary = {
  locale: "fr",
  header: {
    becomeHost: "Devenir proprietaire",
    login: "Connexion",
    register: "S'inscrire",
    logout: "Se deconnecter",
    language: "Langue",
  },
  footer: {
    tagline:
      "La plateforme ouest-africaine qui simplifie la reservation de residences verifiees et l'organisation de sejours authentiques.",
    reassurance: [
      { title: "Residences verifiees", text: "Chaque logement controle par KoraStay." },
      { title: "Paiement mobile", text: "Orange Money, Wave et carte bancaire." },
      { title: "Assistance locale", text: "Avant, pendant et apres le sejour." },
    ],
    rights: "Tous droits reserves.",
    madeInPrefix: "Concu en Cote d'Ivoire",
    madeIn: "pour l'Afrique de l'Ouest.",
  },
  home: {
    heroBadge: "La plateforme ouest-africaine du sejour verifie",
    heroTitleLine1: "Reservez des residences verifiees,",
    heroTitleHighlight: "vivez des sejours d'exception.",
    heroSubtitle:
      "KoraStay reunit hebergements meubles, packs touristiques et partenaires locaux pour voyager sans incertitude en Afrique de l'Ouest.",
    searchCta: "Rechercher",
  },
  common: { discover: "Decouvrir", seeAll: "Voir tout" },
  nav: {},
  footerColumns: {},
};

const EN: Dictionary = {
  locale: "en",
  header: {
    becomeHost: "Become a host",
    login: "Log in",
    register: "Sign up",
    logout: "Log out",
    language: "Language",
  },
  footer: {
    tagline:
      "The West-African platform that makes booking verified homes and organising authentic stays effortless.",
    reassurance: [
      { title: "Verified homes", text: "Every property is vetted by KoraStay." },
      { title: "Mobile payment", text: "Orange Money, Wave and bank cards." },
      { title: "Local support", text: "Before, during and after your stay." },
    ],
    rights: "All rights reserved.",
    madeInPrefix: "Made in Cote d'Ivoire",
    madeIn: "for West Africa.",
  },
  home: {
    heroBadge: "West Africa's verified-stay platform",
    heroTitleLine1: "Book verified homes,",
    heroTitleHighlight: "live exceptional stays.",
    heroSubtitle:
      "KoraStay brings together furnished homes, curated tour packs and trusted local partners so you can travel with confidence across West Africa.",
    searchCta: "Search",
  },
  common: { discover: "Discover", seeAll: "See all" },
  nav: NAV_EN,
  footerColumns: FOOTER_COLUMNS_EN,
};

const DICTIONARIES: Record<Locale, Dictionary> = { fr: FR, en: EN };

export function isLocale(value: unknown): value is Locale {
  return value === "fr" || value === "en";
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? FR;
}

/** Traduit un libelle de navigation par href, avec repli sur le libelle francais. */
export function navLabel(dict: Dictionary, href: string, frenchLabel: string): string {
  if (dict.locale === "fr") return frenchLabel;
  return dict.nav[href] ?? frenchLabel;
}

/** Traduit un titre de colonne de pied de page, avec repli francais. */
export function footerColumnLabel(dict: Dictionary, frenchTitle: string): string {
  if (dict.locale === "fr") return frenchTitle;
  return dict.footerColumns[frenchTitle] ?? frenchTitle;
}
