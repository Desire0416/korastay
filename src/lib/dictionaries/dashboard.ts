// ============================================================
// Espaces connectes : coque (barre laterale, en-tete), libelles de
// navigation et textes partages par tous les tableaux de bord.
// Les libelles de navigation sont indexes par leur libelle FR source
// (src/lib/navigation.ts) : un meme href peut porter deux libelles
// (ex. "Mes services" / "Mes trajets" pour un chauffeur).
// ============================================================

export interface DashDict {
  spaces: Record<"TRAVELER" | "OWNER" | "PARTNER" | "BUSINESS" | "ADMIN", string>;
  partnerSpace: string; // {type}
  hello: string; // {name}
  publicSite: string;
  collapse: string;
  menu: string;
  navigation: string;
  /** Traduction des libelles de navigation (cle = libelle FR). Vide en FR. */
  navLabels: Record<string, string>;
  /** Libelles courts des onglets mobiles (cle = libelle FR). */
  navShort: Record<string, string>;
  common: {
    search: string;
    reset: string;
    seeAll: string;
    back: string;
    save: string;
    saving: string;
    cancel: string;
    edit: string;
    delete: string;
    view: string;
    details: string;
    actions: string;
    status: string;
    date: string;
    amount: string;
    total: string;
    nights: string; // {n}
    guests: string; // {n}
    none: string;
    yes: string;
    no: string;
    loading: string;
    saved: string;
    error: string;
    unauthorized: string;
    notFound: string;
    previous: string;
    next: string;
    page: string; // {n} {total}
  };
}

export const dashFr: DashDict = {
  spaces: {
    TRAVELER: "Espace voyageur",
    OWNER: "Espace propriétaire",
    PARTNER: "Espace partenaire",
    BUSINESS: "Espace entreprise",
    ADMIN: "Administration",
  },
  partnerSpace: "Espace {type}",
  hello: "Bonjour {name}",
  publicSite: "Site public",
  collapse: "Réduire",
  menu: "Menu",
  navigation: "Navigation",
  navLabels: {},
  navShort: {
    "Tableau de bord": "Accueil",
    "Mes réservations": "Séjours",
    "Réservations": "Séjours",
    "Offres reçues": "Offres",
    "Mes résidences": "Logements",
    "Packs sur mesure": "Sur mesure",
    "Mes services": "Services",
    "Mes trajets": "Trajets",
    "Mon menu": "Menu",
    "Mon véhicule": "Véhicule",
    "Mes demandes": "Demandes",
  },
  common: {
    search: "Rechercher…",
    reset: "Réinitialiser",
    seeAll: "Voir tout",
    back: "Retour",
    save: "Enregistrer",
    saving: "Enregistrement…",
    cancel: "Annuler",
    edit: "Modifier",
    delete: "Supprimer",
    view: "Voir",
    details: "Détails",
    actions: "Actions",
    status: "Statut",
    date: "Date",
    amount: "Montant",
    total: "Total",
    nights: "{n} nuit(s)",
    guests: "{n} voyageur(s)",
    none: "Aucun",
    yes: "Oui",
    no: "Non",
    loading: "Chargement…",
    saved: "Modifications enregistrées.",
    error: "Une erreur est survenue.",
    unauthorized: "Non autorisé.",
    notFound: "Introuvable.",
    previous: "Précédent",
    next: "Suivant",
    page: "Page {n} sur {total}",
  },
};

export const dashEn: DashDict = {
  spaces: {
    TRAVELER: "Traveller space",
    OWNER: "Host space",
    PARTNER: "Partner space",
    BUSINESS: "Business space",
    ADMIN: "Admin",
  },
  partnerSpace: "{type} space",
  hello: "Hello {name}",
  publicSite: "Public site",
  collapse: "Collapse",
  menu: "Menu",
  navigation: "Navigation",
  navLabels: {
    // Commun
    "Tableau de bord": "Dashboard",
    "Messages": "Messages",
    "Profil": "Profile",
    "Calendrier": "Calendar",
    "Revenus": "Income",
    "Avis": "Reviews",
    // Voyageur
    "Mes réservations": "My bookings",
    "Favoris": "Favourites",
    "Mes avis": "My reviews",
    "Packs sur mesure": "Custom packs",
    "Notifications": "Notifications",
    "Sécurité": "Security",
    // Proprietaire
    "Réservations": "Bookings",
    "Offres reçues": "Offers received",
    "Mes résidences": "My homes",
    // Partenaire
    "Mon menu": "My menu",
    "Mon véhicule": "My vehicle",
    "Mes trajets": "My trips",
    "Mes services": "My services",
    "Missions": "Missions",
    // Business
    "Mes demandes": "My requests",
    "Équipe": "Team",
    "Factures": "Invoices",
    // Admin (groupes + entrees)
    "Pilotage": "Overview",
    "Offre": "Catalogue",
    "Communauté": "Community",
    "Système": "System",
    "Paiements": "Payments",
    "Reversements": "Payouts",
    "Remboursements": "Refunds",
    "Résidences": "Homes",
    "Packs": "Packs",
    "Activités": "Activities",
    "Packs perso": "Custom packs",
    "Destinations": "Destinations",
    "Utilisateurs": "Users",
    "Partenaires": "Partners",
    "Business": "Business",
    "Contenu": "Content",
    "Blog": "Blog",
    "Exports": "Exports",
    "Paramètres": "Settings",
    "Audit": "Audit",
  },
  navShort: {
    "Tableau de bord": "Home",
    "Mes réservations": "Stays",
    "Réservations": "Bookings",
    "Offres reçues": "Offers",
    "Mes résidences": "Homes",
    "Packs sur mesure": "Custom",
    "Mes services": "Services",
    "Mes trajets": "Trips",
    "Mon menu": "Menu",
    "Mon véhicule": "Vehicle",
    "Mes demandes": "Requests",
    "Favoris": "Favourites",
    "Mes avis": "Reviews",
    "Calendrier": "Calendar",
    "Revenus": "Income",
    "Équipe": "Team",
    "Factures": "Invoices",
    "Paiements": "Payments",
    "Reversements": "Payouts",
  },
  common: {
    search: "Search…",
    reset: "Reset",
    seeAll: "See all",
    back: "Back",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    details: "Details",
    actions: "Actions",
    status: "Status",
    date: "Date",
    amount: "Amount",
    total: "Total",
    nights: "{n} night(s)",
    guests: "{n} guest(s)",
    none: "None",
    yes: "Yes",
    no: "No",
    loading: "Loading…",
    saved: "Changes saved.",
    error: "Something went wrong.",
    unauthorized: "Not allowed.",
    notFound: "Not found.",
    previous: "Previous",
    next: "Next",
    page: "Page {n} of {total}",
  },
};

/** Libelle court (onglets mobiles), repli sur le libelle complet. */
export function navShortText(dash: DashDict, frLabel: string): string {
  return dash.navShort[frLabel] ?? navText(dash, frLabel);
}

/** Libelle de navigation dans la locale courante (cle = libelle FR). */
export function navText(dash: DashDict, frLabel: string): string {
  return dash.navLabels[frLabel] ?? frLabel;
}
