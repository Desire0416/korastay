// ============================================================
// KoraStay - Enumerations typees
// Source de verite unique pour tous les statuts stockes en
// String dans SQLite. Inclut libelles FR et tons de badge.
// ============================================================

export const UserRole = {
  TRAVELER: "TRAVELER",
  OWNER: "OWNER",
  PARTNER: "PARTNER",
  BUSINESS: "BUSINESS",
  SUPPORT: "SUPPORT",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const AccountStatus = {
  PENDING_EMAIL_VERIFICATION: "PENDING_EMAIL_VERIFICATION",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  DISABLED: "DISABLED",
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const PartnerType = {
  GUIDE: "GUIDE",
  TRANSPORT: "TRANSPORT",
  RESTAURANT: "RESTAURANT",
  ACTIVITY: "ACTIVITY",
  OTHER: "OTHER",
} as const;
export type PartnerType = (typeof PartnerType)[keyof typeof PartnerType];

export const VerificationStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  NEEDS_CHANGES: "NEEDS_CHANGES",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
} as const;
export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const ResidenceStatus = {
  DRAFT: "DRAFT",
  PENDING_VALIDATION: "PENDING_VALIDATION",
  PUBLISHED: "PUBLISHED",
  UNPUBLISHED: "UNPUBLISHED",
  SUSPENDED: "SUSPENDED",
  ARCHIVED: "ARCHIVED",
} as const;
export type ResidenceStatus =
  (typeof ResidenceStatus)[keyof typeof ResidenceStatus];

export const ResidenceType = {
  STUDIO: "STUDIO",
  T2: "T2",
  T3: "T3",
  VILLA: "VILLA",
} as const;
export type ResidenceType = (typeof ResidenceType)[keyof typeof ResidenceType];

export const QualityLevel = {
  ESSENTIAL: "ESSENTIAL",
  COMFORT: "COMFORT",
  PREMIUM: "PREMIUM",
} as const;
export type QualityLevel = (typeof QualityLevel)[keyof typeof QualityLevel];

export const ReservationType = {
  RESIDENCE: "RESIDENCE",
  PACK: "PACK",
  CUSTOM_PACK: "CUSTOM_PACK",
  ACTIVITY: "ACTIVITY",
  BUSINESS: "BUSINESS",
} as const;
export type ReservationType =
  (typeof ReservationType)[keyof typeof ReservationType];

export const ReservationStatus = {
  DRAFT: "DRAFT",
  NEGOTIATING: "NEGOTIATING",         // negociation de prix en cours (2+ nuits)
  PENDING_APPROVAL: "PENDING_APPROVAL",
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
  CONFIRMED: "CONFIRMED",
  CHECKED_IN: "CHECKED_IN",
  COMPLETED: "COMPLETED",
  CANCELLATION_REQUESTED: "CANCELLATION_REQUESTED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
  DISPUTED: "DISPUTED",
  REFUNDED: "REFUNDED",
} as const;
export type ReservationStatus =
  (typeof ReservationStatus)[keyof typeof ReservationStatus];

// Statut de la negociation de prix (champ separe de ReservationStatus)
export const NegotiationStatus = {
  NONE: "NONE",         // pas de negociation (1 nuit, prix fixe)
  OPEN: "OPEN",         // negociation en cours
  AGREED: "AGREED",     // accord trouve
  REJECTED: "REJECTED", // refus definitif
  EXPIRED: "EXPIRED",   // offre expiree sans reponse
} as const;
export type NegotiationStatus =
  (typeof NegotiationStatus)[keyof typeof NegotiationStatus];

// Auteur d'une offre de prix
export const OfferParty = {
  TRAVELER: "TRAVELER",
  OWNER: "OWNER",
} as const;
export type OfferParty = (typeof OfferParty)[keyof typeof OfferParty];

// Statut d'une offre individuelle
export const OfferStatus = {
  PENDING: "PENDING",       // en attente de reponse
  ACCEPTED: "ACCEPTED",     // acceptee
  REJECTED: "REJECTED",     // refusee
  COUNTERED: "COUNTERED",   // contre-offre emise (remplace cette offre)
  EXPIRED: "EXPIRED",       // 24h ecoules sans reponse
} as const;
export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus];

export const PaymentStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  PAID: "PAID",
  FAILED: "FAILED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  WAVE: "WAVE",
  ORANGE_MONEY: "ORANGE_MONEY",
  MTN_MOMO: "MTN_MOMO",
  MOOV_MONEY: "MOOV_MONEY",
  CARD: "CARD",
  BANK_TRANSFER: "BANK_TRANSFER",
  CASH: "CASH",
  MANUAL: "MANUAL",
  MOCK: "MOCK",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

// Libelles + indices des moyens de paiement (source unique)
export const paymentMethodMeta: Record<
  string,
  { label: string; hint?: string }
> = {
  WAVE: { label: "Wave", hint: "Sans frais" },
  ORANGE_MONEY: { label: "Orange Money", hint: "Côte d'Ivoire" },
  MTN_MOMO: { label: "MTN MoMo", hint: "Mobile Money" },
  MOOV_MONEY: { label: "Moov Money", hint: "Mobile Money" },
  CARD: { label: "Carte bancaire", hint: "Visa / Mastercard" },
  BANK_TRANSFER: { label: "Virement bancaire", hint: "Validation manuelle" },
  CASH: { label: "Especes", hint: "A l'agence" },
  MANUAL: { label: "Validation manuelle (admin)", hint: "Hors ligne" },
  MOCK: { label: "Démo", hint: "Simulation" },
};

export const ReviewStatus = {
  PUBLISHED: "PUBLISHED",
  HIDDEN: "HIDDEN",
  DELETED: "DELETED",
} as const;
export type ReviewStatus = (typeof ReviewStatus)[keyof typeof ReviewStatus];

export const MessageContextType = {
  GENERAL: "GENERAL",
  RESERVATION: "RESERVATION",
  PACK: "PACK",
  BUSINESS_REQUEST: "BUSINESS_REQUEST",
  SUPPORT_TICKET: "SUPPORT_TICKET",
} as const;
export type MessageContextType =
  (typeof MessageContextType)[keyof typeof MessageContextType];

export const MissionStatus = {
  PROPOSED: "PROPOSED",
  ACCEPTED: "ACCEPTED",
  REFUSED: "REFUSED",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type MissionStatus = (typeof MissionStatus)[keyof typeof MissionStatus];

export const BusinessRequestStatus = {
  NEW: "NEW",
  IN_REVIEW: "IN_REVIEW",
  QUOTED: "QUOTED",
  CONFIRMED: "CONFIRMED",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
} as const;
export type BusinessRequestStatus =
  (typeof BusinessRequestStatus)[keyof typeof BusinessRequestStatus];

// ------------------------------------------------------------
// Tons de badge
// ------------------------------------------------------------
export type BadgeTone =
  | "neutral"
  | "brand"
  | "gold"
  | "success"
  | "danger"
  | "info"
  | "warning";

type LabelMap = Record<string, { label: string; tone: BadgeTone }>;

export const reservationStatusMeta: LabelMap = {
  DRAFT: { label: "Brouillon", tone: "neutral" },
  NEGOTIATING: { label: "Négociation en cours", tone: "info" },
  PENDING_APPROVAL: { label: "En attente de validation", tone: "warning" },
  PENDING_PAYMENT: { label: "A payer (acompte)", tone: "warning" },
  PARTIALLY_PAID: { label: "Acompte regle", tone: "info" },
  PAID: { label: "Intégralement payée", tone: "success" },
  CONFIRMED: { label: "Confirmée", tone: "success" },
  CHECKED_IN: { label: "Séjour en cours", tone: "info" },
  COMPLETED: { label: "Terminée", tone: "brand" },
  CANCELLATION_REQUESTED: { label: "Annulation demandée", tone: "warning" },
  CANCELLED: { label: "Annulée", tone: "danger" },
  NO_SHOW: { label: "No-show", tone: "danger" },
  DISPUTED: { label: "Litige", tone: "danger" },
  REFUNDED: { label: "Remboursee", tone: "info" },
};

export const payoutStatusMeta: LabelMap = {
  SCHEDULED: { label: "Planifié", tone: "warning" },
  RELEASED: { label: "Verse", tone: "success" },
  BLOCKED: { label: "Bloqué (litige)", tone: "danger" },
  CANCELLED: { label: "Annulé", tone: "neutral" },
};

export const cautionStatusMeta: LabelMap = {
  NONE: { label: "Sans caution", tone: "neutral" },
  REQUIRED: { label: "Caution requise", tone: "warning" },
  HELD: { label: "Caution bloquée", tone: "info" },
  RELEASED: { label: "Caution restituée", tone: "success" },
  RETAINED: { label: "Caution retenue", tone: "danger" },
};

export const PayoutStatus = {
  SCHEDULED: "SCHEDULED",
  RELEASED: "RELEASED",
  BLOCKED: "BLOCKED",
  CANCELLED: "CANCELLED",
} as const;
export type PayoutStatus = (typeof PayoutStatus)[keyof typeof PayoutStatus];

export const PayoutTier = {
  NEW: "NEW",
  RELIABLE: "RELIABLE",
} as const;
export type PayoutTier = (typeof PayoutTier)[keyof typeof PayoutTier];

export const paymentStatusMeta: LabelMap = {
  PENDING: { label: "En attente", tone: "warning" },
  PROCESSING: { label: "En cours", tone: "info" },
  PAID: { label: "Payé", tone: "success" },
  FAILED: { label: "Échoué", tone: "danger" },
  EXPIRED: { label: "Expire", tone: "neutral" },
  CANCELLED: { label: "Annulé", tone: "neutral" },
  REFUNDED: { label: "Rembourse", tone: "info" },
  PARTIALLY_REFUNDED: { label: "Rembourse partiel", tone: "info" },
};

export const residenceStatusMeta: LabelMap = {
  DRAFT: { label: "Brouillon", tone: "neutral" },
  PENDING_VALIDATION: { label: "En attente de validation", tone: "warning" },
  PUBLISHED: { label: "Publiée", tone: "success" },
  UNPUBLISHED: { label: "Dépubliée", tone: "neutral" },
  SUSPENDED: { label: "Suspendue", tone: "danger" },
  ARCHIVED: { label: "Archivée", tone: "neutral" },
};

export const verificationStatusMeta: LabelMap = {
  DRAFT: { label: "Brouillon", tone: "neutral" },
  PENDING_REVIEW: { label: "En attente", tone: "warning" },
  NEEDS_CHANGES: { label: "Corrections demandées", tone: "warning" },
  VERIFIED: { label: "Vérifié", tone: "success" },
  REJECTED: { label: "Refuse", tone: "danger" },
  SUSPENDED: { label: "Suspendu", tone: "danger" },
};

export const missionStatusMeta: LabelMap = {
  PROPOSED: { label: "Proposée", tone: "warning" },
  ACCEPTED: { label: "Acceptée", tone: "info" },
  REFUSED: { label: "Refusée", tone: "danger" },
  CONFIRMED: { label: "Confirmée", tone: "success" },
  COMPLETED: { label: "Terminée", tone: "brand" },
  CANCELLED: { label: "Annulée", tone: "neutral" },
};

export const businessRequestStatusMeta: LabelMap = {
  NEW: { label: "Nouvelle", tone: "warning" },
  IN_REVIEW: { label: "En traitement", tone: "info" },
  QUOTED: { label: "Devis envoyé", tone: "brand" },
  CONFIRMED: { label: "Confirmée", tone: "success" },
  CLOSED: { label: "Cloturee", tone: "neutral" },
  CANCELLED: { label: "Annulée", tone: "danger" },
};

export const qualityLevelMeta: Record<
  string,
  { label: string; stars: number; tone: BadgeTone }
> = {
  ESSENTIAL: { label: "Essentiel", stars: 2, tone: "neutral" },
  COMFORT: { label: "Confort", stars: 3, tone: "brand" },
  PREMIUM: { label: "Premium", stars: 4, tone: "gold" },
};

export const residenceTypeMeta: Record<
  string,
  { label: string; capacity: string }
> = {
  STUDIO: { label: "Studio meublé", capacity: "1-2 personnes" },
  T2: { label: "Appartement T2", capacity: "2-3 personnes" },
  T3: { label: "Appartement T3", capacity: "4-5 personnes" },
  VILLA: { label: "Villa / Maison", capacity: "6+ personnes" },
};

export const activityCategoryMeta: Record<string, { label: string }> = {
  EXCURSION: { label: "Excursion" },
  VISITE: { label: "Visite de site" },
  CULTURE: { label: "Expérience culturelle" },
  NATURE: { label: "Sortie nature" },
  AVENTURE: { label: "Aventure" },
  GASTRONOMIE: { label: "Gastronomie" },
};

export const partnerTypeMeta: Record<
  string,
  { label: string; plural: string }
> = {
  GUIDE: { label: "Guide touristique", plural: "Guides" },
  TRANSPORT: { label: "Transporteur", plural: "Transporteurs" },
  RESTAURANT: { label: "Restaurant", plural: "Restaurants" },
  ACTIVITY: { label: "Prestataire d'activité", plural: "Activités" },
  OTHER: { label: "Autre prestataire", plural: "Autres" },
};

export const negotiationStatusMeta: LabelMap = {
  NONE: { label: "Prix fixe", tone: "neutral" },
  OPEN: { label: "En négociation", tone: "info" },
  AGREED: { label: "Accord trouvé", tone: "success" },
  REJECTED: { label: "Refusée", tone: "danger" },
  EXPIRED: { label: "Expirée", tone: "neutral" },
};

export const offerStatusMeta: LabelMap = {
  PENDING: { label: "En attente", tone: "warning" },
  ACCEPTED: { label: "Acceptée", tone: "success" },
  REJECTED: { label: "Refusée", tone: "danger" },
  COUNTERED: { label: "Contre-offre envoyée", tone: "info" },
  EXPIRED: { label: "Expirée", tone: "neutral" },
};

export const userRoleMeta: Record<string, { label: string; tone: BadgeTone }> = {
  TRAVELER: { label: "Voyageur", tone: "info" },
  OWNER: { label: "Propriétaire", tone: "brand" },
  PARTNER: { label: "Partenaire", tone: "gold" },
  BUSINESS: { label: "Business", tone: "neutral" },
  SUPPORT: { label: "Support", tone: "info" },
  ADMIN: { label: "Admin", tone: "danger" },
  SUPER_ADMIN: { label: "Super Admin", tone: "danger" },
};

export function metaFor(map: LabelMap, key?: string | null) {
  if (!key) return { label: "-", tone: "neutral" as BadgeTone };
  return map[key] ?? { label: key, tone: "neutral" as BadgeTone };
}

// Convertit une table de libelles en options pour la barre de filtres.
// `only` permet de restreindre/ordonner les valeurs proposees.
export function toFilterOptions(
  map: Record<string, { label: string }>,
  only?: string[]
): { value: string; label: string }[] {
  const keys = only ?? Object.keys(map);
  return keys.map((value) => ({ value, label: map[value]?.label ?? value }));
}
