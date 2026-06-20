import { SERVICE_FEE_RATE } from "./constants";
import { nightsBetween } from "./utils";

export interface ResidencePriceInput {
  pricePerNight: number;
  cleaningFee?: number;
  startDate: Date | string;
  endDate: Date | string;
  extraServices?: number;
  serviceFeeRate?: number;
  serviceFeeMin?: number;
  serviceFeeMax?: number;
}

export interface PriceBreakdown {
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  extras: number;
  stayDiscountRate: number; // 0, 0.10 ou 0.15 selon la duree
  stayDiscount: number; // montant de la remise (en F CFA)
  total: number; // total APRES remise
}

// Reduction automatique selon la duree du sejour (residences) :
//   2 a 7 nuits   -> -10 %
//   plus de 7 nuits -> -15 %
// Appliquee au montant total a payer par le voyageur.
export function stayDiscountRate(nights: number): number {
  if (nights > 7) return 0.15;
  if (nights >= 2) return 0.1;
  return 0;
}

// Frais de service = pourcentage du sous-total, borne (optionnellement) entre
// un plancher et un plafond en F CFA. Sans bornes -> simple pourcentage.
export function clampServiceFee(
  subtotal: number,
  rate = SERVICE_FEE_RATE,
  min = 0,
  max = Number.MAX_SAFE_INTEGER
): number {
  if (subtotal <= 0) return 0;
  const raw = Math.round(subtotal * rate);
  return Math.min(Math.max(raw, min), max);
}

export function computeResidencePrice(input: ResidencePriceInput): PriceBreakdown {
  const nights = nightsBetween(input.startDate, input.endDate);
  const subtotal = nights * input.pricePerNight;
  const cleaningFee = input.cleaningFee ?? 0;
  const extras = input.extraServices ?? 0;
  const serviceFee = clampServiceFee(
    subtotal,
    input.serviceFeeRate ?? SERVICE_FEE_RATE,
    input.serviceFeeMin ?? 0,
    input.serviceFeeMax ?? Number.MAX_SAFE_INTEGER
  );
  const gross = subtotal + cleaningFee + serviceFee + extras;
  const rate = stayDiscountRate(nights);
  const stayDiscount = Math.round(gross * rate);
  const total = gross - stayDiscount;
  return { nights, subtotal, cleaningFee, serviceFee, extras, stayDiscountRate: rate, stayDiscount, total };
}

export interface PackPriceInput {
  basePrice: number;
  basePersons: number;
  extraPersonPrice: number;
  persons: number;
  serviceFeeRate?: number;
  serviceFeeMin?: number;
  serviceFeeMax?: number;
}

export function computePackPrice(input: PackPriceInput): PriceBreakdown {
  const extraPersons = Math.max(0, input.persons - input.basePersons);
  const extras = extraPersons * input.extraPersonPrice;
  const subtotal = input.basePrice + extras;
  const serviceFee = clampServiceFee(
    subtotal,
    input.serviceFeeRate ?? SERVICE_FEE_RATE,
    input.serviceFeeMin ?? 0,
    input.serviceFeeMax ?? Number.MAX_SAFE_INTEGER
  );
  const total = subtotal + serviceFee;
  return {
    nights: 0,
    subtotal: input.basePrice,
    cleaningFee: 0,
    serviceFee,
    extras,
    stayDiscountRate: 0,
    stayDiscount: 0,
    total,
  };
}

// ------------------------------------------------------------
// Prix negocie : le voyageur et le proprietaire se sont accordes
// sur un sous-total. On calcule juste les frais de service dessus.
// Pas de remise sejour (le montant negocie est deja le prix final).
// ------------------------------------------------------------
export interface NegotiatedPriceBreakdown {
  subtotal: number;    // montant convenu (sous-total negocie)
  cleaningFee: number;
  serviceFee: number;
  total: number;
}

export function computeNegotiatedPrice(input: {
  negotiatedSubtotal: number;
  cleaningFee?: number;
  serviceFeeRate?: number;
  serviceFeeMin?: number;
  serviceFeeMax?: number;
}): NegotiatedPriceBreakdown {
  const serviceFee = clampServiceFee(
    input.negotiatedSubtotal,
    input.serviceFeeRate ?? SERVICE_FEE_RATE,
    input.serviceFeeMin ?? 0,
    input.serviceFeeMax ?? Number.MAX_SAFE_INTEGER
  );
  const cleaningFee = input.cleaningFee ?? 0;
  return {
    subtotal: input.negotiatedSubtotal,
    serviceFee,
    cleaningFee,
    total: input.negotiatedSubtotal + serviceFee + cleaningFee,
  };
}

// ------------------------------------------------------------
// Politique d'annulation (cf. specification section 10)
// ------------------------------------------------------------
export interface RefundEstimate {
  refundableAmount: number;
  refundRate: number;
  serviceFeeRefunded: boolean;
  label: string;
}

export function estimateResidenceRefund(
  total: number,
  serviceFee: number,
  checkIn: Date | string
): RefundEstimate {
  const hours =
    (new Date(checkIn).getTime() - Date.now()) / (1000 * 60 * 60);
  const refundableBase = total - serviceFee;

  if (hours > 72) {
    return {
      refundableAmount: refundableBase,
      refundRate: 1,
      serviceFeeRefunded: false,
      label: "Remboursement intégral de la nuitée (hors frais de service)",
    };
  }
  if (hours >= 24) {
    return {
      refundableAmount: Math.round(refundableBase * 0.5),
      refundRate: 0.5,
      serviceFeeRefunded: false,
      label: "Remboursement de 50% de la nuitée (hors frais de service)",
    };
  }
  return {
    refundableAmount: 0,
    refundRate: 0,
    serviceFeeRefunded: false,
    label: "Aucun remboursement (moins de 24h avant l'arrivée)",
  };
}

// ------------------------------------------------------------
// Acompte a payer apres validation de la demande
// Residence : prix d'une nuitee ; si sejour d'1 nuit -> moitie du total.
// Pack : moitie du total.
// ------------------------------------------------------------
export function computeDeposit(input: {
  type: "RESIDENCE" | "PACK" | string;
  nights: number;
  total: number;
  pricePerNight?: number;
}): number {
  if (input.type === "RESIDENCE") {
    if (input.nights <= 1 || !input.pricePerNight) return Math.round(input.total / 2);
    return Math.min(input.pricePerNight, input.total);
  }
  // Pack (et autres) : moitie du total
  return Math.round(input.total / 2);
}

export function estimatePackRefund(
  total: number,
  serviceFee: number,
  departure: Date | string
): RefundEstimate {
  const days =
    (new Date(departure).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  const refundableBase = total - serviceFee;

  if (days > 7) {
    return {
      refundableAmount: refundableBase,
      refundRate: 1,
      serviceFeeRefunded: false,
      label: "Remboursement intégral du pack (hors frais de service)",
    };
  }
  if (days >= 3) {
    return {
      refundableAmount: Math.round(refundableBase * 0.5),
      refundRate: 0.5,
      serviceFeeRefunded: false,
      label: "Remboursement de 50% du pack (hors frais de service)",
    };
  }
  return {
    refundableAmount: 0,
    refundRate: 0,
    serviceFeeRefunded: false,
    label: "Aucun remboursement (moins de 3 jours avant le départ)",
  };
}
