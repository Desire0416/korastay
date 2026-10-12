// ============================================================
// Libelles traduits des enums affiches cote public. Les *Meta de
// src/lib/enums.ts restent la source FR (tons, etoiles...) ; ce module
// donne le libelle par locale. Etendu au fil des pages refaites.
// ============================================================

export interface EnumsDict {
  quality: Record<string, string>;
  activityCategory: Record<string, string>;
  stayType: Record<string, string>;
  sort: Record<string, string>;
  amenity: Record<string, string>;
  residenceType: Record<string, string>;
  /** Traduction des libelles FR des *Meta (statuts, roles...), cle = libelle FR. Vide en FR. */
  statusLabel: Record<string, string>;
  paymentMethod: Record<string, { label: string; hint?: string }>;
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
  paymentMethod: {
    WAVE: { label: "Wave", hint: "Sans frais" },
    ORANGE_MONEY: { label: "Orange Money", hint: "Côte d'Ivoire" },
    MTN_MOMO: { label: "MTN MoMo", hint: "Mobile Money" },
    MOOV_MONEY: { label: "Moov Money", hint: "Mobile Money" },
    CARD: { label: "Carte bancaire", hint: "Visa / Mastercard" },
    BANK_TRANSFER: { label: "Virement bancaire", hint: "Validation manuelle" },
    CASH: { label: "Espèces", hint: "À l'agence" },
    MANUAL: { label: "Validation manuelle", hint: "Hors ligne" },
    MOCK: { label: "Démo", hint: "Simulation" },
  },
  statusLabel: {},
  residenceType: { STUDIO: "Studio meublé", T2: "Appartement T2", T3: "Appartement T3", VILLA: "Villa / Maison" },
  stayType: { any: "Tout type", STUDIO: "Studio", T2: "Appartement T2", T3: "Appartement T3", VILLA: "Villa / Maison" },
  sort: {
    featured: "Pertinence",
    price_asc: "Prix croissant",
    price_desc: "Prix décroissant",
    rating: "Mieux notés",
    recent: "Plus récents",
  },
  amenity: {
    wifi: "Wi-Fi",
    climatisation: "Climatisation",
    cuisine: "Cuisine équipée",
    "eau-chaude": "Eau chaude",
    parking: "Parking",
    television: "Télévision",
    "petit-dejeuner": "Petit-déjeuner",
    menage: "Ménage",
    balcon: "Balcon",
    terrasse: "Terrasse",
    securite: "Sécurité 24h/24",
    "groupe-electrogene": "Groupe électrogène",
    piscine: "Piscine",
    "lave-linge": "Lave-linge",
    bureau: "Espace bureau",
    ascenseur: "Ascenseur",
  },
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
  paymentMethod: {
    WAVE: { label: "Wave", hint: "No fees" },
    ORANGE_MONEY: { label: "Orange Money", hint: "Côte d'Ivoire" },
    MTN_MOMO: { label: "MTN MoMo", hint: "Mobile Money" },
    MOOV_MONEY: { label: "Moov Money", hint: "Mobile Money" },
    CARD: { label: "Bank card", hint: "Visa / Mastercard" },
    BANK_TRANSFER: { label: "Bank transfer", hint: "Manual validation" },
    CASH: { label: "Cash", hint: "At the office" },
    MANUAL: { label: "Manual validation", hint: "Offline" },
    MOCK: { label: "Demo", hint: "Simulation" },
  },
  statusLabel: {
    // Reservations
    "Brouillon": "Draft",
    "Négociation en cours": "Negotiating",
    "En attente de validation": "Awaiting approval",
    "À payer (acompte)": "To pay (deposit)",
    "Acompte réglé": "Deposit paid",
    "Intégralement payée": "Fully paid",
    "Confirmée": "Confirmed",
    "Séjour en cours": "Stay in progress",
    "Terminée": "Completed",
    "Annulation demandée": "Cancellation requested",
    "Annulée": "Cancelled",
    "No-show": "No-show",
    "Litige": "Dispute",
    "Remboursée": "Refunded",
    // Reversements
    "Planifié": "Scheduled",
    "Versé": "Paid out",
    "Bloqué (litige)": "Blocked (dispute)",
    "Annulé": "Cancelled",
    // Caution
    "Sans caution": "No deposit",
    "Caution requise": "Deposit required",
    "Caution bloquée": "Deposit held",
    "Caution restituée": "Deposit returned",
    "Caution retenue": "Deposit retained",
    // Paiements
    "En attente": "Pending",
    "En cours": "Processing",
    "Payé": "Paid",
    "Échoué": "Failed",
    "Expiré": "Expired",
    "Remboursé": "Refunded",
    "Remboursé partiel": "Partly refunded",
    // Logements
    "Publiée": "Published",
    "Dépubliée": "Unpublished",
    "Suspendue": "Suspended",
    "Archivée": "Archived",
    // Verification
    "Corrections demandées": "Changes requested",
    "Vérifié": "Verified",
    "Refusé": "Rejected",
    "Suspendu": "Suspended",
    // Missions
    "Proposée": "Proposed",
    "Acceptée": "Accepted",
    "Refusée": "Declined",
    // Demandes Business
    "Nouvelle": "New",
    "En traitement": "In review",
    "Devis envoyé": "Quote sent",
    "Clôturée": "Closed",
    // Negociation / offres
    "Prix fixe": "Fixed price",
    "En négociation": "Negotiating",
    "Accord trouvé": "Agreed",
    "Expirée": "Expired",
    "Contre-offre envoyée": "Counter-offer sent",
    // Roles
    "Voyageur": "Traveller",
    "Propriétaire": "Host",
    "Partenaire": "Partner",
    "Business": "Business",
    "Support": "Support",
    "Admin": "Admin",
    "Super Admin": "Super Admin",
    // Types de partenaire
    "Guide touristique": "Tour guide",
    "Transporteur": "Driver",
    "Restaurant": "Restaurant",
    "Prestataire d'activité": "Activity provider",
    "Autre prestataire": "Other provider",
    // Qualite
    "Essentiel": "Essential",
    "Confort": "Comfort",
    "Premium": "Premium",
  },
  residenceType: { STUDIO: "Furnished studio", T2: "1-bedroom flat", T3: "2-bedroom flat", VILLA: "Villa / House" },
  stayType: { any: "Any type", STUDIO: "Studio", T2: "1-bedroom flat", T3: "2-bedroom flat", VILLA: "Villa / House" },
  sort: {
    featured: "Relevance",
    price_asc: "Price: low to high",
    price_desc: "Price: high to low",
    rating: "Top rated",
    recent: "Newest",
  },
  amenity: {
    wifi: "Wi-Fi",
    climatisation: "Air conditioning",
    cuisine: "Equipped kitchen",
    "eau-chaude": "Hot water",
    parking: "Parking",
    television: "TV",
    "petit-dejeuner": "Breakfast",
    menage: "Cleaning",
    balcon: "Balcony",
    terrasse: "Terrace",
    securite: "24/7 security",
    "groupe-electrogene": "Backup generator",
    piscine: "Swimming pool",
    "lave-linge": "Washing machine",
    bureau: "Workspace",
    ascenseur: "Lift",
  },
};

/** Libelle d'un enum dans la locale courante, avec repli sur la valeur brute. */
export function enumLabel(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return "";
  return map[value] ?? value;
}

/** Libelle d'un *Meta (FR source) dans la locale courante. */
export function statusText(dict: { enums: EnumsDict }, frLabel: string): string {
  return dict.enums.statusLabel[frLabel] ?? frLabel;
}
