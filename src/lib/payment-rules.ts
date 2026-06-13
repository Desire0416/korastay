// ============================================================
// KoraStay - Moteur de regles de paiement
// ------------------------------------------------------------
// Source de verite unique pour :
//   - les moyens de paiement actives
//   - les frais de service (% borne en F CFA)
//   - les politiques d'acompte (residences / packs / activites / business)
//   - les reversements aux hotes (echelonnement selon la fiabilite)
// Tout est stocke dans Setting["payment_settings"] (JSON serialise).
// ============================================================

import { prisma } from "./prisma";
import { clampServiceFee } from "./pricing";

export type DepositPolicy = "HALF" | "FULL";

export interface PaymentSettings {
  // 1. Moyens de paiement activables
  methods: Record<string, boolean>;
  // 2. Frais de service KoraStay
  serviceFeePercent: number; // ex : 5 (=> 5%)
  serviceFeeMin: number; // plancher en F CFA
  serviceFeeMax: number; // plafond en F CFA
  // 3. Politiques d'acompte residences
  residenceStandardPolicy: DepositPolicy; // standard : 50/50
  residencePremiumPolicy: DepositPolicy; // premium : 100%
  residenceHighDemandPolicy: DepositPolicy; // forte demande : 100%
  residenceOneNightPolicy: DepositPolicy; // sejour d'1 nuit : 100%
  businessDepositPercent: number; // business : configurable (defaut 50%)
  // 4. Packs (toujours 100%) + activites
  packPolicy: DepositPolicy;
  activityPolicy: DepositPolicy;
  // 9. Reversements hote
  payoutNewCheckInPercent: number; // nouvel hote : % verse au check-in (reste au check-out)
  payoutReliableCheckInPercent: number; // hote fiable : % verse au check-in
  // 10. Message de reassurance client
  payViaKoraStayNote: string;
  // 11. Reception des paiements hors ligne (sans agregateur) : numeros mobile
  // money par moyen, coordonnees bancaires, et instructions affichees au
  // voyageur a l'etape "regler l'acompte".
  receivingNumbers: Record<string, string>;
  bankDetails: string;
  manualInstructions: string;
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  methods: {
    WAVE: true,
    ORANGE_MONEY: true,
    MTN_MOMO: true,
    MOOV_MONEY: true,
    CARD: false,
    BANK_TRANSFER: true,
    MANUAL: true,
  },
  serviceFeePercent: 5,
  serviceFeeMin: 1000,
  serviceFeeMax: 10000,
  residenceStandardPolicy: "HALF",
  residencePremiumPolicy: "FULL",
  residenceHighDemandPolicy: "FULL",
  residenceOneNightPolicy: "FULL",
  businessDepositPercent: 50,
  packPolicy: "FULL",
  activityPolicy: "HALF",
  payoutNewCheckInPercent: 70,
  payoutReliableCheckInPercent: 100,
  payViaKoraStayNote:
    "Tous les paiements sont sécurisés et transitent par KoraStay. Ne reglez jamais directement l'hôte ou le prestataire avant votre arrivée.",
  receivingNumbers: { WAVE: "", ORANGE_MONEY: "", MTN_MOMO: "", MOOV_MONEY: "" },
  bankDetails: "",
  manualInstructions: "",
};

export const PAYMENT_SETTINGS_KEY = "payment_settings";

function merge(parsed: Partial<PaymentSettings>): PaymentSettings {
  return {
    ...DEFAULT_PAYMENT_SETTINGS,
    ...parsed,
    methods: { ...DEFAULT_PAYMENT_SETTINGS.methods, ...(parsed.methods ?? {}) },
    receivingNumbers: {
      ...DEFAULT_PAYMENT_SETTINGS.receivingNumbers,
      ...(parsed.receivingNumbers ?? {}),
    },
  };
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const row = await prisma.setting.findUnique({ where: { key: PAYMENT_SETTINGS_KEY } });
  if (!row) return DEFAULT_PAYMENT_SETTINGS;
  try {
    return merge(JSON.parse(row.value) as Partial<PaymentSettings>);
  } catch {
    return DEFAULT_PAYMENT_SETTINGS;
  }
}

export async function savePaymentSettings(settings: PaymentSettings): Promise<void> {
  const value = JSON.stringify(merge(settings));
  await prisma.setting.upsert({
    where: { key: PAYMENT_SETTINGS_KEY },
    create: { key: PAYMENT_SETTINGS_KEY, value },
    update: { value },
  });
}

// --- Frais de service ------------------------------------------------------
export function feeConfig(s: PaymentSettings) {
  return { rate: s.serviceFeePercent / 100, min: s.serviceFeeMin, max: s.serviceFeeMax };
}

export function computeServiceFee(subtotal: number, s: PaymentSettings): number {
  return clampServiceFee(subtotal, s.serviceFeePercent / 100, s.serviceFeeMin, s.serviceFeeMax);
}

// --- Politique d'acompte ---------------------------------------------------
// Resout la regle applicable a une residence (override > 1 nuit > premium >
// forte demande > standard).
export function resolveResidencePolicy(
  r: { qualityLevel?: string | null; isHighDemand?: boolean | null; paymentPolicy?: string | null },
  nights: number,
  s: PaymentSettings
): DepositPolicy {
  if (r.paymentPolicy === "HALF" || r.paymentPolicy === "FULL") return r.paymentPolicy;
  if (nights <= 1) return s.residenceOneNightPolicy;
  if (r.qualityLevel === "PREMIUM") return s.residencePremiumPolicy;
  if (r.isHighDemand) return s.residenceHighDemandPolicy;
  return s.residenceStandardPolicy;
}

// Montant a regler maintenant (acompte) selon la politique.
export function computeDepositDue(
  total: number,
  policy: DepositPolicy,
  businessPercent?: number
): number {
  if (policy === "FULL") return total;
  if (businessPercent != null) return Math.round((total * businessPercent) / 100);
  return Math.round(total / 2);
}

export interface ReservationFinance {
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  policy: DepositPolicy;
  depositDue: number; // a payer maintenant
  balanceDue: number; // solde restant (regle plus tard / sur place)
  cautionAmount: number; // depot de garantie eventuel
}

// Construit le detail financier complet d'une reservation.
export function buildFinance(input: {
  subtotal: number;
  cleaningFee?: number;
  serviceFee: number;
  policy: DepositPolicy;
  businessPercent?: number;
  cautionEnabled?: boolean;
  cautionAmount?: number;
}): ReservationFinance {
  const cleaningFee = input.cleaningFee ?? 0;
  const total = input.subtotal + cleaningFee + input.serviceFee;
  const depositDue = computeDepositDue(total, input.policy, input.businessPercent);
  return {
    subtotal: input.subtotal,
    cleaningFee,
    serviceFee: input.serviceFee,
    total,
    policy: input.policy,
    depositDue,
    balanceDue: Math.max(0, total - depositDue),
    cautionAmount: input.cautionEnabled ? input.cautionAmount ?? 0 : 0,
  };
}

// --- Moyens de paiement ----------------------------------------------------
export function enabledPaymentMethods(s: PaymentSettings): string[] {
  return Object.entries(s.methods)
    .filter(([, on]) => on)
    .map(([k]) => k);
}

// --- Reversements hote -----------------------------------------------------
export interface PayoutPlanItem {
  trigger: "CHECK_IN" | "CHECK_OUT";
  percentage: number;
  amount: number;
}

// Echelonne le revenu hote selon sa fiabilite :
//   - NEW : payoutNewCheckInPercent au check-in, le reste au check-out
//   - RELIABLE : payoutReliableCheckInPercent au check-in (en general 100%)
export function buildPayoutPlan(
  ownerRevenue: number,
  tier: string,
  s: PaymentSettings
): PayoutPlanItem[] {
  const firstPct =
    tier === "RELIABLE" ? s.payoutReliableCheckInPercent : s.payoutNewCheckInPercent;
  const first = Math.round((ownerRevenue * firstPct) / 100);
  const plan: PayoutPlanItem[] = [
    { trigger: "CHECK_IN", percentage: firstPct, amount: first },
  ];
  if (firstPct < 100) {
    plan.push({
      trigger: "CHECK_OUT",
      percentage: 100 - firstPct,
      amount: ownerRevenue - first,
    });
  }
  return plan;
}
