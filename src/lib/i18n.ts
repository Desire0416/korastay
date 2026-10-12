// ============================================================
// Internationalisation (FR par defaut, EN disponible)
// Fondation bilingue : chrome public (header, footer, accueil).
// Module pur (importable cote client). La lecture de la locale
// via cookie se trouve dans i18n.server.ts.
// ============================================================

import { type HomeDict, homeFr, homeEn } from "./dictionaries/home";
import { type EnumsDict, enumsFr, enumsEn } from "./dictionaries/enums";
import { type NegotiationDict, negotiationFr, negotiationEn } from "./dictionaries/negotiation";
import {
  type PackCheckoutDict, type CustomPackDict,
  packCheckoutFr, packCheckoutEn, customPackFr, customPackEn,
} from "./dictionaries/pack-flows";
import { type ActivitiesDict, activitiesFr, activitiesEn } from "./dictionaries/activities";
import { type DestinationsDict, destinationsFr, destinationsEn } from "./dictionaries/destinations";
import { type PagesDict, pagesFr, pagesEn } from "./dictionaries/pages";

export type Locale = "fr" | "en";
export const LOCALES: Locale[] = ["fr", "en"];
export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_LABELS: Record<Locale, string> = { fr: "Français", en: "English" };

export interface Dictionary {
  locale: Locale;
  home: HomeDict;
  enums: EnumsDict;
  negotiation: NegotiationDict;
  packCheckout: PackCheckoutDict;
  customPack: CustomPackDict;
  activities: ActivitiesDict;
  destinations: DestinationsDict;
  pages: PagesDict;
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
    ctaEyebrow: string;
    ctaTitle: string;
    ctaAccent: string;
    ctaExplore: string;
    ctaHost: string;
    contact: string;
  };
  common: {
    discover: string;
    seeAll: string;
    previousImage: string;
    nextImage: string;
    addFavorite: string;
    removeFavorite: string;
    login: string;
    genericError: string;
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
    verified: string;
    reviews: string; // gabarit avec {n}
    hours: string; // gabarit avec {n}
    from: string;
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
  residences: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    heroTitle: string;
    heroAccent: string;
    heroTitleIn: string;
    heroDesc: string;
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
  residenceDetail: {
    notFound: string;
    back: string;
    breadcrumbResidences: string;
    reviewsWord: string;
    hostedBy: string; // {name}
    guestsUnit: string;
    bedroomsUnit: string;
    bedsUnit: string;
    bathroomsUnit: string;
    verifiedTitle: string;
    verifiedSubtitle: string;
    qualityLevel: string; // {level}
    aboutTitle: string;
    amenitiesTitle: string;
    availabilityTitle: string;
    availabilityText: string; // {in} {out}
    rulesTitle: string;
    reviewsSummary: string; // {avg} {n}
    noReviews: string;
    beFirst: string;
    ratingCleanliness: string;
    ratingLocation: string;
    ratingValue: string;
    ratingCommunication: string;
    locationTitle: string;
    locationApprox: string;
    locationAfter: string;
    cityPacksTitle: string; // {city}
    cityPacksSubtitle: string;
    noPackTitle: string;
    noPackText: string; // {city}
    composePack: string;
    similarTitle: string; // {city}
    photosCount: string; // {n}
    mainPhoto: string;
    checkInLabel: string;
    checkOutLabel: string;
    fromTime: string; // {t}
    beforeTime: string; // {t}
    hostLabel: string;
    reviewsTitle: string;
    outOf: string;
  };
  booking: {
    addCleaning: string;
    addDates: string;
    nightSingular: string;
    nightPlural: string;
    cleaningFee: string;
    serviceFee: string;
    stayDiscount: string; // {p}
    total: string;
    maxCapacity: string; // {n}
    reserve: string;
    selectDates: string;
    noChargeYet: string;
    yourStay: string;
    // Négociation de prix
    negotiateTitle: string;
    negotiateHint: string;
    referencePrice: string;
    estimatedTotal: string;
    negotiate24h: string;
    sendOffer: string;
  };
  checkout: {
    metaTitle: string;
    eyebrow: string;
    backToResidence: string;
    title: string;
    referral: string;
    payNow: string;
    payNowFull: string;
    payNowDeposit: string;
    balanceRemaining: string;
    possibleDeposit: string;
    securePayment: string;
    yourDetails: string;
    fullName: string;
    phone: string;
    validationTitle: string;
    validationP1: string;
    validationP2: string;
    validationP3: string;
    depositFallback: string;
    balanceLine: string; // {x}
    cautionLine: string; // {x}
    demoMode: string;
    preferredMethod: string;
    acceptPrefix: string;
    termsLink: string;
    and: string;
    cancellationLink: string;
    submit: string;
  };
  packs: {
    metaTitle: string;
    metaDescription: string;
    heroTitle: string;
    heroAccent: string;
    heroSubtitle: string;
    allDestinations: string;
    customTitle: string;
    customTextShort: string;
    customTextLong: string;
    metaFallback: string;
    personsRange: string; // {base} {max}
    aboutTitle: string;
    notSuited: string; // {city}
    included: string;
    notIncluded: string;
    program: string;
    practicalInfo: string;
    physicalLevel: string;
    clothing: string;
    toBring: string;
    meetingPoint: string;
    cancellation: string;
    departureDate: string;
    chooseDate: string;
    packLine: string; // {n}
    extraPersons: string;
    perPack: string;
    reservePack: string;
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
  "/mentions-legales": "Legal notice",
};

const FOOTER_COLUMNS_EN: Record<string, string> = {
  Explorer: "Explore",
  Rejoindre: "Join us",
  KoraStay: "KoraStay",
  Légal: "Legal",
  Legal: "Legal",
};

const FR: Dictionary = {
  locale: "fr",
  home: homeFr,
  enums: enumsFr,
  negotiation: negotiationFr,
  packCheckout: packCheckoutFr,
  customPack: customPackFr,
  activities: activitiesFr,
  destinations: destinationsFr,
  pages: pagesFr,
  header: {
    becomeHost: "Devenir propriétaire",
    login: "Connexion",
    register: "S'inscrire",
    logout: "Se déconnecter",
    language: "Langue",
  },
  footer: {
    tagline:
      "La plateforme ouest-africaine qui simplifie la réservation de logements vérifiés et l'organisation de séjours authentiques.",
    reassurance: [
      { title: "Logements vérifiés", text: "Chaque adresse est contrôlée par KoraStay." },
      { title: "Paiement Mobile Money", text: "Wave, Orange Money, MTN MoMo, Moov Money ou virement." },
      { title: "Assistance locale", text: "Avant, pendant et après le séjour." },
    ],
    rights: "Tous droits réservés.",
    madeInPrefix: "Conçu en Côte d'Ivoire",
    madeIn: "pour l'Afrique de l'Ouest.",
    ctaEyebrow: "Akwaba",
    ctaTitle: "Réservez votre séjour,",
    ctaAccent: "vivez l'Afrique de l'Ouest.",
    ctaExplore: "Explorer les logements",
    ctaHost: "Devenir propriétaire",
    contact: "Nous écrire",
  },
  common: {
    discover: "Découvrir",
    seeAll: "Voir tout",
    previousImage: "Image précédente",
    nextImage: "Image suivante",
    addFavorite: "Ajouter aux favoris",
    removeFavorite: "Retirer des favoris",
    login: "Connexion",
    genericError: "Une erreur est survenue.",
  },
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
    verified: "Vérifié",
    reviews: "{n} avis",
    hours: "{n} h",
    from: "Dès",
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
  residences: {
    metaTitle: "Locations meublées vérifiées",
    metaDescription: "Parcourez les locations meublées vérifiées KoraStay en Côte d'Ivoire : studios, appartements et villas.",
    eyebrow: "Location meublée",
    heroTitle: "Nos logements",
    heroAccent: "vérifiés.",
    heroTitleIn: "Logements à",
    heroDesc: "Studios, appartements et villas contrôlés par l'équipe KoraStay. Filtrez par ville, dates et équipements.",
    titleIn: "Locations meublées à {city}",
    titleDefault: "Locations meublées vérifiées",
    countSingular: "{n} logement disponible",
    countPlural: "{n} logements disponibles",
    inCotedivoire: " en Côte d'Ivoire",
    availableFromTo: "Disponibles du {from} au {to}",
    removeDates: "Retirer les dates",
    emptyTitle: "Aucun logement ne correspond",
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
  residenceDetail: {
    notFound: "Logement introuvable",
    back: "Retour",
    breadcrumbResidences: "Logements",
    reviewsWord: "avis",
    hostedBy: "Hébergé par {name}",
    guestsUnit: "voyageurs",
    bedroomsUnit: "chambres",
    bedsUnit: "lits",
    bathroomsUnit: "salles de bain",
    verifiedTitle: "Logement vérifié KoraStay",
    verifiedSubtitle: "Contrôlée par notre équipe qualité",
    qualityLevel: "Niveau {level}",
    aboutTitle: "À propos de ce logement",
    amenitiesTitle: "Ce que propose ce logement",
    availabilityTitle: "Disponibilités",
    availabilityText: "Arrivée à partir de {in} - Départ avant {out}. Les dates indisponibles sont désactivées lors de la réservation.",
    rulesTitle: "Règlement intérieur",
    reviewsSummary: "{avg} - {n} avis",
    noReviews: "Pas encore d'avis",
    beFirst: "Soyez le premier à partager votre expérience après votre séjour.",
    ratingCleanliness: "Propreté",
    ratingLocation: "Emplacement",
    ratingValue: "Qualité/prix",
    ratingCommunication: "Communication",
    locationTitle: "Localisation",
    locationApprox: "Localisation approximative. L'adresse exacte est communiquée après réservation.",
    locationAfter: "Localisation communiquée après réservation",
    cityPacksTitle: "Vivez {city} : packs & expériences",
    cityPacksSubtitle: "Complétez votre séjour avec un pack accompagné, ou composez le vôtre.",
    noPackTitle: "Aucun pack ne vous convient ?",
    noPackText: "Composez votre propre pack avec les activités et partenaires de {city}.",
    composePack: "Composer mon pack",
    similarTitle: "Autres logements à {city}",
    photosCount: "Voir les {n} photos",
    mainPhoto: "photo principale",
    checkInLabel: "Arrivée",
    checkOutLabel: "Départ",
    fromTime: "à partir de {t}",
    beforeTime: "avant {t}",
    hostLabel: "Votre hôte",
    reviewsTitle: "Avis des voyageurs",
    outOf: "sur 5",
  },
  booking: {
    addCleaning: "Ajouter le ménage",
    addDates: "Ajouter des dates",
    nightSingular: "nuit",
    nightPlural: "nuits",
    cleaningFee: "Frais de ménage",
    serviceFee: "Frais de service KoraStay",
    stayDiscount: "Réduction séjour (−{p}%)",
    total: "Total",
    maxCapacity: "Capacité maximum : {n} voyageurs.",
    reserve: "Réserver",
    selectDates: "Sélectionnez vos dates",
    noChargeYet: "Aucun montant ne sera débité à cette étape.",
    yourStay: "Votre séjour",
    negotiateTitle: "Proposez votre prix",
    negotiateHint: "Négociez librement avec le propriétaire. Il a 24h pour accepter ou vous faire une contre-offre.",
    referencePrice: "Prix de référence",
    estimatedTotal: "Total estimé",
    negotiate24h: "Le propriétaire a 24h pour répondre. Sans réponse, l'offre expire.",
    sendOffer: "Envoyer mon offre",
  },
  checkout: {
    metaTitle: "Finaliser la réservation",
    eyebrow: "Réservation",
    backToResidence: "Retour au logement",
    title: "Finaliser votre réservation",
    referral: "Parrainage (−5%) 🎁",
    payNow: "À payer maintenant",
    payNowFull: " (100%)",
    payNowDeposit: " (acompte)",
    balanceRemaining: "Solde restant",
    possibleDeposit: "Caution éventuelle",
    securePayment: "Paiement sécurisé via KoraStay - Annulation selon conditions",
    yourDetails: "Vos coordonnées",
    fullName: "Nom complet",
    phone: "Téléphone",
    validationTitle: "Validation de votre demande",
    validationP1: "Aucun montant n'est débité maintenant. Votre demande est validée sous ",
    validationP2: ", puis vous réglez ",
    validationP3: " pour confirmer.",
    depositFallback: "l'acompte",
    balanceLine: " Solde restant : {x}.",
    cautionLine: " Une caution de {x} pourra être demandée.",
    demoMode: "Mode démonstration : le paiement de l'acompte est simulé.",
    preferredMethod: "Moyen de paiement préféré (pour l'acompte)",
    acceptPrefix: "J'accepte les ",
    termsLink: "conditions générales de réservation",
    and: " et la ",
    cancellationLink: "politique d'annulation",
    submit: "Envoyer ma demande de réservation",
  },
  packs: {
    metaTitle: "Packs Découverte",
    metaDescription: "Des séjours touristiques accompagnés clé en main : hébergement, transport et guide local certifié KoraStay.",
    heroTitle: "Des séjours clé en main,",
    heroAccent: "sans rien organiser.",
    heroSubtitle: "Hébergement vérifié, transport en ville et guide local certifié : il ne vous reste qu'à profiter.",
    allDestinations: "Toutes les destinations",
    customTitle: "Pack personnalisé",
    customTextShort: "Composez votre séjour sur mesure.",
    customTextLong: "Composez votre séjour sur mesure : destination, activités, options. Nous nous occupons du reste.",
    metaFallback: "Pack",
    personsRange: "{base} à {max} personnes",
    aboutTitle: "À propos de ce pack",
    notSuited: "Ce pack ne vous convient pas ? Composez le vôtre à {city}.",
    included: "Inclus",
    notIncluded: "Non inclus",
    program: "Programme jour par jour",
    practicalInfo: "Informations pratiques",
    physicalLevel: "Niveau physique",
    clothing: "Tenue conseillée",
    toBring: "À apporter",
    meetingPoint: "Point de rendez-vous",
    cancellation: "Conditions d'annulation",
    departureDate: "Date de départ",
    chooseDate: "Choisir une date",
    packLine: "Pack ({n} pers.)",
    extraPersons: "Personnes supplémentaires",
    perPack: "/ pack",
    reservePack: "Réserver ce pack",
  },
  nav: {},
  footerColumns: {},
};

const EN: Dictionary = {
  locale: "en",
  home: homeEn,
  enums: enumsEn,
  negotiation: negotiationEn,
  packCheckout: packCheckoutEn,
  customPack: customPackEn,
  activities: activitiesEn,
  destinations: destinationsEn,
  pages: pagesEn,
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
      { title: "Verified homes", text: "Every address is vetted by KoraStay." },
      { title: "Mobile Money payment", text: "Wave, Orange Money, MTN MoMo, Moov Money or bank transfer." },
      { title: "Local support", text: "Before, during and after your stay." },
    ],
    rights: "All rights reserved.",
    madeInPrefix: "Made in Côte d'Ivoire",
    madeIn: "for West Africa.",
    ctaEyebrow: "Akwaba",
    ctaTitle: "Book your stay,",
    ctaAccent: "live West Africa.",
    ctaExplore: "Explore stays",
    ctaHost: "Become a host",
    contact: "Write to us",
  },
  common: {
    discover: "Discover",
    seeAll: "See all",
    previousImage: "Previous image",
    nextImage: "Next image",
    addFavorite: "Add to favourites",
    removeFavorite: "Remove from favourites",
    login: "Log in",
    genericError: "Something went wrong.",
  },
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

    verified: "Verified",
    reviews: "{n} reviews",
    hours: "{n} h",
    from: "From",
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
  residences: {
    metaTitle: "Verified furnished rentals",
    metaDescription: "Browse KoraStay's verified furnished rentals in Côte d'Ivoire: studios, apartments and villas.",
    eyebrow: "Furnished rentals",
    heroTitle: "Our",
    heroAccent: "verified homes.",
    heroTitleIn: "Homes in",
    heroDesc: "Studios, flats and villas vetted by the KoraStay team. Filter by city, dates and amenities.",
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
  residenceDetail: {
    notFound: "Listing not found",
    back: "Back",
    breadcrumbResidences: "Homes",
    reviewsWord: "reviews",
    hostedBy: "Hosted by {name}",
    guestsUnit: "guests",
    bedroomsUnit: "bedrooms",
    bedsUnit: "beds",
    bathroomsUnit: "bathrooms",
    verifiedTitle: "KoraStay verified home",
    verifiedSubtitle: "Checked by our quality team",
    qualityLevel: "{level} level",
    aboutTitle: "About this home",
    amenitiesTitle: "What this home offers",
    availabilityTitle: "Availability",
    availabilityText: "Check-in from {in} - Check-out before {out}. Unavailable dates are disabled when booking.",
    rulesTitle: "House rules",
    reviewsSummary: "{avg} - {n} reviews",
    noReviews: "No reviews yet",
    beFirst: "Be the first to share your experience after your stay.",
    ratingCleanliness: "Cleanliness",
    ratingLocation: "Location",
    ratingValue: "Value",
    ratingCommunication: "Communication",
    locationTitle: "Location",
    locationApprox: "Approximate location. The exact address is shared after booking.",
    locationAfter: "Location shared after booking",
    cityPacksTitle: "Experience {city}: packs & experiences",
    cityPacksSubtitle: "Round out your stay with a guided pack, or build your own.",
    noPackTitle: "No pack suits you?",
    noPackText: "Build your own pack with {city}'s activities and partners.",
    composePack: "Build my pack",
    similarTitle: "Other homes in {city}",
    photosCount: "Show all {n} photos",
    mainPhoto: "main photo",
    checkInLabel: "Check-in",
    checkOutLabel: "Check-out",
    fromTime: "from {t}",
    beforeTime: "before {t}",
    hostLabel: "Your host",
    reviewsTitle: "Guest reviews",
    outOf: "out of 5",
  },
  booking: {
    addCleaning: "Add cleaning",
    addDates: "Add dates",
    nightSingular: "night",
    nightPlural: "nights",
    cleaningFee: "Cleaning fee",
    serviceFee: "KoraStay service fee",
    stayDiscount: "Length-of-stay discount (−{p}%)",
    total: "Total",
    maxCapacity: "Maximum capacity: {n} guests.",
    reserve: "Book",
    selectDates: "Select your dates",
    noChargeYet: "You won't be charged at this stage.",
    yourStay: "Your stay",
    negotiateTitle: "Propose your price",
    negotiateHint: "Negotiate freely with the host. They have 24h to accept or make a counter-offer.",
    referencePrice: "Reference price",
    estimatedTotal: "Estimated total",
    negotiate24h: "The host has 24h to respond. If no reply, the offer expires.",
    sendOffer: "Send my offer",
  },
  checkout: {
    metaTitle: "Complete your booking",
    eyebrow: "Booking",
    backToResidence: "Back to the listing",
    title: "Complete your booking",
    referral: "Referral (−5%) 🎁",
    payNow: "Due now",
    payNowFull: " (100%)",
    payNowDeposit: " (deposit)",
    balanceRemaining: "Remaining balance",
    possibleDeposit: "Possible security deposit",
    securePayment: "Secure payment via KoraStay - Cancellation per terms",
    yourDetails: "Your details",
    fullName: "Full name",
    phone: "Phone",
    validationTitle: "Request validation",
    validationP1: "No amount is charged now. Your request is validated within ",
    validationP2: ", then you pay ",
    validationP3: " to confirm.",
    depositFallback: "the deposit",
    balanceLine: " Remaining balance: {x}.",
    cautionLine: " A security deposit of {x} may be requested.",
    demoMode: "Demo mode: the deposit payment is simulated.",
    preferredMethod: "Preferred payment method (for the deposit)",
    acceptPrefix: "I accept the ",
    termsLink: "booking terms & conditions",
    and: " and the ",
    cancellationLink: "cancellation policy",
    submit: "Send my booking request",
  },
  packs: {
    metaTitle: "Discovery packs",
    metaDescription: "Guided, all-inclusive getaways: accommodation, transport and a certified KoraStay local guide.",
    heroTitle: "Ready-made stays,",
    heroAccent: "nothing to organise.",
    heroSubtitle: "Verified accommodation, in-town transport and a certified local guide: all that's left is to enjoy.",
    allDestinations: "All destinations",
    customTitle: "Custom pack",
    customTextShort: "Build your tailor-made stay.",
    customTextLong: "Build your tailor-made stay: destination, activities, options. We handle the rest.",
    metaFallback: "Pack",
    personsRange: "{base} to {max} people",
    aboutTitle: "About this pack",
    notSuited: "This pack doesn't suit you? Build your own in {city}.",
    included: "Included",
    notIncluded: "Not included",
    program: "Day-by-day itinerary",
    practicalInfo: "Practical information",
    physicalLevel: "Physical level",
    clothing: "Recommended clothing",
    toBring: "What to bring",
    meetingPoint: "Meeting point",
    cancellation: "Cancellation terms",
    departureDate: "Departure date",
    chooseDate: "Choose a date",
    packLine: "Pack ({n} guests)",
    extraPersons: "Extra people",
    perPack: "/ pack",
    reservePack: "Book this pack",
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
