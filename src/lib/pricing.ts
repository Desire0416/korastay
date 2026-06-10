import { SERVICE_FEE_RATE } from "./constants";
import { nightsBetween } from "./utils";

export interface ResidencePriceInput {
  pricePerNight: number;
  cleaningFee?: number;
  startDate: Date | string;
  endDate: Date | string;
  extraServices?: number;
  serviceFeeRate?: number;
}

export interface PriceBreakdown {
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  extras: number;
  total: number;
}

export function computeResidencePrice(input: ResidencePriceInput): PriceBreakdown {
  const nights = nightsBetween(input.startDate, input.endDate);
  const subtotal = nights * input.pricePerNight;
  const cleaningFee = input.cleaningFee ?? 0;
  const extras = input.extraServices ?? 0;
  const serviceFee = Math.round(subtotal * (input.serviceFeeRate ?? SERVICE_FEE_RATE));
  const total = subtotal + cleaningFee + serviceFee + extras;
  return { nights, subtotal, cleaningFee, serviceFee, extras, total };
}

export interface PackPriceInput {
  basePrice: number;
  basePersons: number;
  extraPersonPrice: number;
  persons: number;
  serviceFeeRate?: number;
}

export function computePackPrice(input: PackPriceInput): PriceBreakdown {
  const extraPersons = Math.max(0, input.persons - input.basePersons);
  const extras = extraPersons * input.extraPersonPrice;
  const subtotal = input.basePrice + extras;
  const serviceFee = Math.round(subtotal * (input.serviceFeeRate ?? SERVICE_FEE_RATE));
  const total = subtotal + serviceFee;
  return {
    nights: 0,
    subtotal: input.basePrice,
    cleaningFee: 0,
    serviceFee,
    extras,
    total,
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
      label: "Remboursement integral de la nuitee (hors frais de service)",
    };
  }
  if (hours >= 24) {
    return {
      refundableAmount: Math.round(refundableBase * 0.5),
      refundRate: 0.5,
      serviceFeeRefunded: false,
      label: "Remboursement de 50% de la nuitee (hors frais de service)",
    };
  }
  return {
    refundableAmount: 0,
    refundRate: 0,
    serviceFeeRefunded: false,
    label: "Aucun remboursement (moins de 24h avant l'arrivee)",
  };
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
      label: "Remboursement integral du pack (hors frais de service)",
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
    label: "Aucun remboursement (moins de 3 jours avant le depart)",
  };
}
