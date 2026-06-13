// ============================================================
// KoraStay - Constantes metier & configuration
// ============================================================

export const APP_NAME = "KoraStay";
export const APP_TAGLINE = "Réservez votre séjour, vivez l'Afrique de l'Ouest.";
export const APP_DESCRIPTION =
  "KoraStay reunit hébergements meublés vérifiés, packs touristiques et partenaires locaux pour voyager sans incertitude en Afrique de l'Ouest.";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@korastay.com";
export const CONTACT_PHONE =
  process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+225 07 57 90 88 84";

// Frais de service KoraStay (pourcentage du sous-total)
export const SERVICE_FEE_RATE = 0.07;

// Duree du verrouillage des dates pendant le paiement (minutes)
export const PAYMENT_HOLD_MINUTES = 15;

// Delais de validation des demandes de reservation par l'hote/admin.
// Au-dela, la demande est automatiquement annulee.
export const RESIDENCE_VALIDATION_HOURS = 24;
export const PACK_VALIDATION_DAYS = 7;

// Delai laisse au voyageur pour regler l'acompte apres validation de la demande.
// Au-dela (sans paiement declare), la reservation est auto-annulee et les dates
// sont liberees. Declarer un paiement met ce delai en pause (l'admin valide).
export const PAYMENT_DEADLINE_HOURS = 72;

// Session
export const SESSION_COOKIE = "korastay_session";
export const SESSION_DURATION_DAYS = 30;

// Pagination
export const PAGE_SIZE = 12;

// Redirections par role apres connexion
export const ROLE_HOME: Record<string, string> = {
  TRAVELER: "/account",
  OWNER: "/owner",
  PARTNER: "/partner",
  BUSINESS: "/business/dashboard",
  SUPPORT: "/admin",
  ADMIN: "/admin",
  SUPER_ADMIN: "/admin",
};

// Liste de reference des equipements
export const AMENITIES = [
  { slug: "wifi", name: "WiFi", icon: "Wifi", category: "Connectivite" },
  { slug: "climatisation", name: "Climatisation", icon: "Snowflake", category: "Confort" },
  { slug: "cuisine", name: "Cuisine équipée", icon: "CookingPot", category: "Cuisine" },
  { slug: "eau-chaude", name: "Eau chaude", icon: "Droplets", category: "Confort" },
  { slug: "parking", name: "Parking", icon: "Car", category: "Extérieur" },
  { slug: "television", name: "Television", icon: "Tv", category: "Confort" },
  { slug: "petit-dejeuner", name: "Petit dejeuner", icon: "Coffee", category: "Services" },
  { slug: "menage", name: "Ménage", icon: "Sparkles", category: "Services" },
  { slug: "balcon", name: "Balcon", icon: "Building2", category: "Extérieur" },
  { slug: "terrasse", name: "Terrasse", icon: "Trees", category: "Extérieur" },
  { slug: "securite", name: "Securite 24/7", icon: "ShieldCheck", category: "Sécurité" },
  { slug: "groupe-electrogene", name: "Groupe électrogène", icon: "Zap", category: "Confort" },
  { slug: "piscine", name: "Piscine", icon: "Waves", category: "Extérieur" },
  { slug: "lave-linge", name: "Lave-linge", icon: "WashingMachine", category: "Services" },
  { slug: "bureau", name: "Espace bureau", icon: "Laptop", category: "Business" },
  { slug: "ascenseur", name: "Ascenseur", icon: "ArrowUpDown", category: "Confort" },
] as const;

// Categories d'accueil
export const HOME_CATEGORIES = [
  { key: "residences", label: "Location meublée", href: "/residences", icon: "Home" },
  { key: "packs", label: "Packs Découverte", href: "/packs", icon: "Compass" },
  { key: "business", label: "Business", href: "/business", icon: "Briefcase" },
  { key: "partners", label: "Partenaires", href: "/partners", icon: "Handshake" },
] as const;

// Filtres de tri du catalogue residences
export const SORT_OPTIONS = [
  { value: "featured", label: "Pertinence" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix decroissant" },
  { value: "rating", label: "Mieux notées" },
  { value: "recent", label: "Plus récentes" },
] as const;

export const STAY_TYPES = [
  { value: "any", label: "Tout type" },
  { value: "STUDIO", label: "Studio" },
  { value: "T2", label: "Appartement T2" },
  { value: "T3", label: "Appartement T3" },
  { value: "VILLA", label: "Villa / Maison" },
] as const;
