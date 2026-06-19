// ============================================================
// Internationalisation (FR par defaut, EN disponible)
// Fondation bilingue : chrome public (header, footer, accueil).
// Module pur (importable cote client). La lecture de la locale
// via cookie se trouve dans i18n.server.ts.
// ============================================================

export type Locale = "fr" | "en";
export const LOCALES: Locale[] = ["fr", "en"];
export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_LABELS: Record<Locale, string> = { fr: "Français", en: "English" };

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
    heroStats: { stays: string; destinations: string; packs: string };
    categories: Record<"residences" | "packs" | "business" | "partners", { label: string; desc: string }>;
    sections: {
      destinationsEyebrow: string; destinationsTitle: string; destinationsDesc: string;
      residencesEyebrow: string; residencesTitle: string; residencesDesc: string;
      packsEyebrow: string; packsTitle: string; packsDesc: string;
      whyEyebrow: string; whyTitle: string; whyDesc: string;
      testimonialsEyebrow: string; testimonialsTitle: string;
      faqEyebrow: string; faqTitle: string;
    };
    why: { title: string; text: string }[];
    faq: { q: string; a: string }[];
    businessCard: { title: string; text: string; cta: string };
    ownerCard: { title: string; text: string; cta: string };
    faqMore: string; faqMoreLink: string;
  };
  common: {
    discover: string;
    seeAll: string;
  };
  card: {
    perNight: string;
    guestsUnit: string;
    bedroomsUnit: string;
    dayShort: string;
    nightShort: string;
    fromPeople: string; // gabarit avec {n}
    homeSingular: string;
    homePlural: string;
    perPerson: string;
    travelerFavorite: string;
  };
  search: {
    destination: string;
    allCities: string;
    all: string;
    dates: string;
    when: string;
    guests: string;
    adults: string;
    children: string;
    childrenHint: string;
    search: string;
    searchStay: string;
    startSearch: string;
    whereTo: string;
    datesGuests: string;
    travelerSingular: string;
    travelerPlural: string;
  };
  mobileTabs: {
    explore: string;
    favorites: string;
    stays: string;
    profile: string;
  };
  mobileHome: {
    tabResidences: string;
    tabPacks: string;
    tabActivities: string;
    badgePopular: string;
    trust: { title: string; text: string }[];
    tiles: { visits: string; travelers: string; owners: string; guides: string; partners: string; stays: string };
    residencesTitle: string;
    residencesSubtitle: string;
    destinationsTitle: string;
    destinationsSubtitle: string;
    packsTitle: string;
    packsSubtitle: string;
    ownerCtaText: string;
    statsTitle: string;
    packsTabSubtitle: string;
    noPacks: string;
    seeAllPacks: string;
    activitiesTitle: string;
    activitiesSubtitle: string;
    noActivities: string;
    seeAllActivities: string;
    viewAria: string; // gabarit avec {title}
  };
  platformStats: {
    eyebrow: string;
    title: string;
    description: string;
    visits: string;
    travelers: string;
    owners: string;
    guides: string;
    partners: string;
    residences: string;
    destinations: string;
    packs: string;
  };
  residences: {
    metaTitle: string;
    metaDescription: string;
    titleIn: string; // gabarit avec {city}
    titleDefault: string;
    countSingular: string; // gabarit avec {n}
    countPlural: string; // gabarit avec {n}
    inCotedivoire: string;
    availableFromTo: string; // gabarit avec {from} {to}
    removeDates: string;
    emptyTitle: string;
    emptyDesc: string;
    resetSearch: string;
    prevPage: string;
    nextPage: string;
  };
  filters: {
    stayDates: string;
    checkinLabel: string;
    checkoutLabel: string;
    clearDates: string;
    city: string;
    type: string;
    pricePerNight: string;
    min: string;
    max: string;
    minCapacity: string;
    verifiedOnly: string;
    amenities: string;
    filters: string;
    reset: string;
    showResults: string; // gabarit avec {n}
    apply: string;
    verified: string;
    sortBy: string;
  };
  map: {
    loading: string;
    hide: string;
    show: string;
    viewListing: string;
  };
  // Libelles de navigation / pied de page, indexes par href.
  nav: Record<string, string>;
  // Titres des colonnes du pied de page (cle = libelle francais).
  footerColumns: Record<string, string>;
}

const NAV_EN: Record<string, string> = {
  "/residences": "Stays",
  "/packs": "Discovery packs",
  "/activites": "Activities",
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
  "/mentions-legales": "Légal notice",
};

const FOOTER_COLUMNS_EN: Record<string, string> = {
  Explorer: "Explore",
  Rejoindre: "Join us",
  KoraStay: "KoraStay",
  Legal: "Légal",
};

const FR: Dictionary = {
  locale: "fr",
  header: {
    becomeHost: "Devenir propriétaire",
    login: "Connexion",
    register: "S'inscrire",
    logout: "Se deconnecter",
    language: "Langue",
  },
  footer: {
    tagline:
      "La plateforme ouest-africaine qui simplifie la réservation de résidences vérifiées et l'organisation de séjours authentiques.",
    reassurance: [
      { title: "Résidences vérifiées", text: "Chaque logement contrôle par KoraStay." },
      { title: "Paiement mobile", text: "Orange Money, Wave et carte bancaire." },
      { title: "Assistance locale", text: "Avant, pendant et après le séjour." },
    ],
    rights: "Tous droits reserves.",
    madeInPrefix: "Concu en Côte d'Ivoire",
    madeIn: "pour l'Afrique de l'Ouest.",
  },
  home: {
    heroBadge: "La plateforme ouest-africaine du séjour vérifié",
    heroTitleLine1: "Réservez des résidences vérifiées,",
    heroTitleHighlight: "vivez des séjours d'exception.",
    heroSubtitle:
      "KoraStay reunit hébergements meublés, packs touristiques et partenaires locaux pour voyager sans incertitude en Afrique de l'Ouest.",
    searchCta: "Rechercher",
    heroStats: { stays: "Locations", destinations: "Destinations", packs: "Packs" },
    categories: {
      residences: { label: "Location meublée", desc: "Logements meublés contrôlés" },
      packs: { label: "Packs Découverte", desc: "Séjours clé en main" },
      business: { label: "KoraStay Business", desc: "Missions & entreprises" },
      partners: { label: "Devenir partenaire", desc: "Guides, transport, resto" },
    },
    sections: {
      destinationsEyebrow: "Explorer",
      destinationsTitle: "Destinations populaires",
      destinationsDesc: "De Daloa à Assinie, découvrez les villes où KoraStay vous accueille.",
      residencesEyebrow: "Sélection",
      residencesTitle: "Locations meublées vedettes",
      residencesDesc: "Les logements les mieux notés, vérifiés par KoraStay.",
      packsEyebrow: "KoraStay Découverte",
      packsTitle: "Packs touristiques accompagnés",
      packsDesc: "Des séjours clé en main avec hébergement, transport et guide local.",
      whyEyebrow: "Pourquoi KoraStay",
      whyTitle: "Voyagez l'esprit tranquille",
      whyDesc: "Une plateforme pensée pour la confiance, du premier clic au retour de séjour.",
      testimonialsEyebrow: "Témoignages",
      testimonialsTitle: "Ils ont voyagé avec KoraStay",
      faqEyebrow: "FAQ",
      faqTitle: "Questions fréquentes",
    },
    why: [
      { title: "Locations meublées vérifiées", text: "Chaque logement est contrôlé selon des standards stricts de propreté, sécurité et équipement avant publication." },
      { title: "Paiement mobile", text: "Réservez et payez en toute simplicité via Orange Money, Wave ou carte bancaire." },
      { title: "Assistance locale", text: "Une équipe disponible avant, pendant et après votre séjour, partout en Côte d'Ivoire." },
      { title: "Partenaires locaux", text: "Guides, transporteurs et restaurants sélectionnés pour une expérience authentique." },
    ],
    faq: [
      { q: "Comment savoir si une résidence est fiable ?", a: "Chaque résidence affichant le badge « Résidence vérifiée KoraStay » a été contrôlée par notre équipe selon des critères de propreté, sécurité, équipement et conformité." },
      { q: "Quels moyens de paiement sont acceptés ?", a: "Orange Money, Wave, carte bancaire Visa/Mastercard et bientôt MTN MoMo. Le paiement est sécurisé et la réservation confirmée immédiatement." },
      { q: "Puis-je annuler ma réservation ?", a: "Oui. Pour les résidences : remboursement intégral à plus de 72h du check-in, 50% entre 24 et 72h. Les conditions détaillées sont sur chaque fiche." },
      { q: "Qu'est-ce qu'un Pack Découverte ?", a: "Un séjour clé en main incluant hébergement vérifié, petit déjeuner, transport en ville et guide local certifié, pour découvrir une destination sans rien organiser." },
    ],
    businessCard: {
      title: "KoraStay Business",
      text: "Hébergements fiables et facturables pour vos équipes en mission. Contrats cadres, assistance dédiée et rapports mensuels.",
      cta: "Demander un devis",
    },
    ownerCard: {
      title: "Vous êtes propriétaire ?",
      text: "Publiez votre résidence, gérez votre calendrier et vos revenus, et recevez des réservations vérifiées partout en Côte d'Ivoire.",
      cta: "Rejoindre le réseau",
    },
    faqMore: "Une autre question ?",
    faqMoreLink: "Contactez-nous",
  },
  common: { discover: "Découvrir", seeAll: "Voir tout" },
  card: {
    perNight: "/ nuit",
    guestsUnit: "pers.",
    bedroomsUnit: "ch.",
    dayShort: "j",
    nightShort: "n",
    fromPeople: "Dès {n} personnes",
    homeSingular: "résidence",
    homePlural: "résidences",
    perPerson: "/ pers.",
    travelerFavorite: "Coup de cœur voyageurs",
  },
  search: {
    destination: "Destination",
    allCities: "Toutes les villes",
    all: "Toutes",
    dates: "Dates",
    when: "Quand ?",
    guests: "Voyageurs",
    adults: "Adultes",
    children: "Enfants",
    childrenHint: "Moins de 12 ans",
    search: "Rechercher",
    searchStay: "Rechercher un séjour",
    startSearch: "Commencer ma recherche",
    whereTo: "Où allez-vous ?",
    datesGuests: "Dates · Voyageurs",
    travelerSingular: "voyageur",
    travelerPlural: "voyageurs",
  },
  mobileTabs: {
    explore: "Explorer",
    favorites: "Favoris",
    stays: "Séjours",
    profile: "Profil",
  },
  mobileHome: {
    tabResidences: "Location meublée",
    tabPacks: "Packs",
    tabActivities: "Activités",
    badgePopular: "Populaire",
    trust: [
      { title: "Locations meublées vérifiées", text: "Contrôlées par KoraStay." },
      { title: "Paiement mobile", text: "Orange Money, Wave, carte." },
      { title: "Assistance locale", text: "Avant, pendant, après." },
    ],
    tiles: {
      visits: "Visites",
      travelers: "Voyageurs",
      owners: "Propriétaires",
      guides: "Guides",
      partners: "Partenaires",
      stays: "Locations",
    },
    residencesTitle: "Locations meublées populaires",
    residencesSubtitle: "Les mieux notées, vérifiées KoraStay",
    destinationsTitle: "Destinations",
    destinationsSubtitle: "Où KoraStay vous accueille",
    packsTitle: "Packs Découverte",
    packsSubtitle: "Séjours clé en main, guide inclus",
    ownerCtaText: "Publiez votre résidence et recevez des réservations.",
    statsTitle: "KoraStay en chiffres",
    packsTabSubtitle: "Séjours clé en main : hébergement, transport et guide local.",
    noPacks: "Aucun pack disponible pour le moment.",
    seeAllPacks: "Voir tous les packs",
    activitiesTitle: "Activités & expériences",
    activitiesSubtitle: "Excursions, visites et sorties nature, avec guide certifié.",
    noActivities: "Aucune activité disponible pour le moment.",
    seeAllActivities: "Voir toutes les activités",
    viewAria: "Voir : {title}",
  },
  platformStats: {
    eyebrow: "La communauté grandit",
    title: "KoraStay en chiffres",
    description: "La confiance se construit chaque jour : visiteurs, hôtes et partenaires qui font vivre la plateforme.",
    visits: "Visites de la plateforme",
    travelers: "Voyageurs inscrits",
    owners: "Propriétaires",
    guides: "Guides touristiques",
    partners: "Partenaires locaux",
    residences: "Locations meublées",
    destinations: "Destinations",
    packs: "Packs Découverte",
  },
  residences: {
    metaTitle: "Locations meublées vérifiées",
    metaDescription: "Parcourez les locations meublées vérifiées KoraStay en Côte d'Ivoire : studios, appartements et villas.",
    titleIn: "Locations meublées à {city}",
    titleDefault: "Locations meublées vérifiées",
    countSingular: "{n} logement disponible",
    countPlural: "{n} logements disponibles",
    inCotedivoire: " en Côte d'Ivoire",
    availableFromTo: "Disponibles du {from} au {to}",
    removeDates: "Retirer les dates",
    emptyTitle: "Aucune résidence ne correspond",
    emptyDesc: "Essayez d'élargir votre recherche ou de modifier vos filtres.",
    resetSearch: "Réinitialiser la recherche",
    prevPage: "Page précédente",
    nextPage: "Page suivante",
  },
  filters: {
    stayDates: "Dates du séjour",
    checkinLabel: "Arrivée",
    checkoutLabel: "Départ",
    clearDates: "Effacer les dates",
    city: "Ville",
    type: "Type de logement",
    pricePerNight: "Prix par nuit (F CFA)",
    min: "Min",
    max: "Max",
    minCapacity: "Capacité minimum",
    verifiedOnly: "Locations vérifiées uniquement",
    amenities: "Équipements",
    filters: "Filtres",
    reset: "Réinitialiser",
    showResults: "Afficher {n} résultats",
    apply: "Appliquer",
    verified: "Vérifiées",
    sortBy: "Trier :",
  },
  map: {
    loading: "Chargement de la carte…",
    hide: "Masquer la carte",
    show: "Afficher la carte",
    viewListing: "Voir le logement →",
  },
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
    madeInPrefix: "Made in Côte d'Ivoire",
    madeIn: "for West Africa.",
  },
  home: {
    heroBadge: "West Africa's verified-stay platform",
    heroTitleLine1: "Book verified homes,",
    heroTitleHighlight: "live exceptional stays.",
    heroSubtitle:
      "KoraStay brings together furnished homes, curated tour packs and trusted local partners so you can travel with confidence across West Africa.",
    searchCta: "Search",
    heroStats: { stays: "Stays", destinations: "Destinations", packs: "Packs" },
    categories: {
      residences: { label: "Furnished rentals", desc: "Vetted furnished homes" },
      packs: { label: "Discovery packs", desc: "All-inclusive getaways" },
      business: { label: "KoraStay Business", desc: "Corporate stays & missions" },
      partners: { label: "Become a partner", desc: "Guides, transport, dining" },
    },
    sections: {
      destinationsEyebrow: "Explore",
      destinationsTitle: "Popular destinations",
      destinationsDesc: "From Daloa to Assinie, discover the cities where KoraStay welcomes you.",
      residencesEyebrow: "Selection",
      residencesTitle: "Featured furnished rentals",
      residencesDesc: "The top-rated homes, vetted by KoraStay.",
      packsEyebrow: "KoraStay Discovery",
      packsTitle: "Guided tour packs",
      packsDesc: "All-inclusive getaways with accommodation, transport and a local guide.",
      whyEyebrow: "Why KoraStay",
      whyTitle: "Travel with peace of mind",
      whyDesc: "A platform built on trust, from the first click to the end of your stay.",
      testimonialsEyebrow: "Testimonials",
      testimonialsTitle: "They travelled with KoraStay",
      faqEyebrow: "FAQ",
      faqTitle: "Frequently asked questions",
    },
    why: [
      { title: "Verified furnished rentals", text: "Every home is inspected against strict cleanliness, safety and amenity standards before going live." },
      { title: "Mobile payment", text: "Book and pay with ease via Orange Money, Wave or bank card." },
      { title: "Local support", text: "A team available before, during and after your stay, everywhere in Côte d'Ivoire." },
      { title: "Local partners", text: "Hand-picked guides, drivers and restaurants for an authentic experience." },
    ],
    faq: [
      { q: "How do I know a home is trustworthy?", a: "Every home showing the « KoraStay verified home » badge has been inspected by our team against cleanliness, safety, amenity and compliance criteria." },
      { q: "Which payment methods are accepted?", a: "Orange Money, Wave, Visa/Mastercard bank cards and soon MTN MoMo. Payment is secure and your booking is confirmed instantly." },
      { q: "Can I cancel my booking?", a: "Yes. For homes: full refund more than 72h before check-in, 50% between 24 and 72h. Detailed terms are on each listing." },
      { q: "What is a Discovery Pack?", a: "An all-inclusive stay with a verified home, breakfast, in-town transport and a certified local guide, so you can discover a destination with nothing to organise." },
    ],
    businessCard: {
      title: "KoraStay Business",
      text: "Reliable, invoiceable accommodation for your teams on assignment. Framework contracts, dedicated support and monthly reports.",
      cta: "Request a quote",
    },
    ownerCard: {
      title: "Are you a host?",
      text: "List your home, manage your calendar and revenue, and receive verified bookings everywhere in Côte d'Ivoire.",
      cta: "Join the network",
    },
    faqMore: "Another question?",
    faqMoreLink: "Contact us",
  },
  common: { discover: "Discover", seeAll: "See all" },
  card: {
    perNight: "/ night",
    guestsUnit: "guests",
    bedroomsUnit: "bd",
    dayShort: "d",
    nightShort: "n",
    fromPeople: "From {n} people",
    homeSingular: "home",
    homePlural: "homes",
    perPerson: "/ person",
    travelerFavorite: "Travelers' favorite",
  },
  search: {
    destination: "Destination",
    allCities: "All cities",
    all: "All",
    dates: "Dates",
    when: "When?",
    guests: "Guests",
    adults: "Adults",
    children: "Children",
    childrenHint: "Under 12",
    search: "Search",
    searchStay: "Search for a stay",
    startSearch: "Start your search",
    whereTo: "Where to?",
    datesGuests: "Dates · Guests",
    travelerSingular: "guest",
    travelerPlural: "guests",
  },
  mobileTabs: {
    explore: "Explore",
    favorites: "Favorites",
    stays: "Stays",
    profile: "Profile",
  },
  mobileHome: {
    tabResidences: "Rentals",
    tabPacks: "Packs",
    tabActivities: "Activities",
    badgePopular: "Popular",
    trust: [
      { title: "Verified furnished rentals", text: "Vetted by KoraStay." },
      { title: "Mobile payment", text: "Orange Money, Wave, card." },
      { title: "Local support", text: "Before, during, after." },
    ],
    tiles: {
      visits: "Visits",
      travelers: "Travelers",
      owners: "Hosts",
      guides: "Guides",
      partners: "Partners",
      stays: "Rentals",
    },
    residencesTitle: "Popular furnished rentals",
    residencesSubtitle: "Top-rated, vetted by KoraStay",
    destinationsTitle: "Destinations",
    destinationsSubtitle: "Where KoraStay welcomes you",
    packsTitle: "Discovery packs",
    packsSubtitle: "All-inclusive getaways, guide included",
    ownerCtaText: "List your home and receive bookings.",
    statsTitle: "KoraStay in numbers",
    packsTabSubtitle: "All-inclusive getaways: accommodation, transport and a local guide.",
    noPacks: "No packs available right now.",
    seeAllPacks: "See all packs",
    activitiesTitle: "Activities & experiences",
    activitiesSubtitle: "Excursions, tours and nature outings with a certified guide.",
    noActivities: "No activities available right now.",
    seeAllActivities: "See all activities",
    viewAria: "View: {title}",
  },
  platformStats: {
    eyebrow: "Our community is growing",
    title: "KoraStay in numbers",
    description: "Trust is built every day: visitors, hosts and partners who bring the platform to life.",
    visits: "Platform visits",
    travelers: "Registered travelers",
    owners: "Hosts",
    guides: "Tour guides",
    partners: "Local partners",
    residences: "Furnished rentals",
    destinations: "Destinations",
    packs: "Discovery packs",
  },
  residences: {
    metaTitle: "Verified furnished rentals",
    metaDescription: "Browse KoraStay's verified furnished rentals in Côte d'Ivoire: studios, apartments and villas.",
    titleIn: "Furnished rentals in {city}",
    titleDefault: "Verified furnished rentals",
    countSingular: "{n} home available",
    countPlural: "{n} homes available",
    inCotedivoire: " in Côte d'Ivoire",
    availableFromTo: "Available from {from} to {to}",
    removeDates: "Remove dates",
    emptyTitle: "No home matches",
    emptyDesc: "Try broadening your search or adjusting your filters.",
    resetSearch: "Reset search",
    prevPage: "Previous page",
    nextPage: "Next page",
  },
  filters: {
    stayDates: "Stay dates",
    checkinLabel: "Check-in",
    checkoutLabel: "Check-out",
    clearDates: "Clear dates",
    city: "City",
    type: "Property type",
    pricePerNight: "Price per night (F CFA)",
    min: "Min",
    max: "Max",
    minCapacity: "Minimum capacity",
    verifiedOnly: "Verified rentals only",
    amenities: "Amenities",
    filters: "Filters",
    reset: "Reset",
    showResults: "Show {n} results",
    apply: "Apply",
    verified: "Verified",
    sortBy: "Sort:",
  },
  map: {
    loading: "Loading map…",
    hide: "Hide map",
    show: "Show map",
    viewListing: "View listing →",
  },
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

// ============================================================
// Helpers de routage par URL (locale par defaut cachee : FR sans prefixe).
// ============================================================

/** Retire un eventuel prefixe /en d'un chemin interne. */
function stripLocale(path: string): string {
  if (path === "/en") return "/";
  if (path.startsWith("/en/")) return path.slice(3);
  return path;
}

/**
 * Prefixe un href interne avec la locale courante (idempotent).
 * Laisse intacts les liens externes / mailto / tel / ancres.
 *   localePath("/residences", "en") -> "/en/residences"
 *   localePath("/", "en")           -> "/en"
 *   localePath("/residences", "fr") -> "/residences"
 */
export function localePath(href: string, locale: Locale): string {
  if (!href.startsWith("/")) return href;
  const bare = stripLocale(href);
  if (locale === "fr") return bare;
  return bare === "/" ? "/en" : `/en${bare}`;
}

/** Donne la version d'un chemin dans la locale cible (pour la bascule de langue). */
export function switchLocalePath(path: string, target: Locale): string {
  return localePath(stripLocale(path), target);
}
