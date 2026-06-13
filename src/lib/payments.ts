// ============================================================
// KoraStay - Abstraction paiement (PaymentProvider)
// Permet de brancher Orange Money / Wave / Carte plus tard
// sans bloquer le developpement. Provider "mock" par defaut.
// ============================================================

import { PaymentStatus, PaymentMethod } from "./enums";

export interface PaymentIntentInput {
  reservationId: string;
  reference: string;
  amount: number;
  currency: string;
  method: string;
  customerEmail: string;
  customerName: string;
  returnUrl: string;
}

export interface PaymentIntentResult {
  providerReference: string;
  checkoutUrl: string | null;
  status: string;
  provider: string;
}

export interface PaymentProvider {
  readonly name: string;
  createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  confirm(providerReference: string): Promise<{ status: string }>;
}

// --- Mock : confirme immediatement (demo & developpement) ---
class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";
  async createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    return {
      providerReference: `MOCK-${input.reference}`,
      checkoutUrl: `${input.returnUrl}?provider=mock`,
      status: PaymentStatus.PENDING,
      provider: this.name,
    };
  }
  async confirm(): Promise<{ status: string }> {
    return { status: PaymentStatus.PAID };
  }
}

// --- Manuel : reste en attente, confirme par un admin ---
class ManualPaymentProvider implements PaymentProvider {
  readonly name = "manual";
  async createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    return {
      providerReference: `MAN-${input.reference}`,
      checkoutUrl: null,
      status: PaymentStatus.PENDING,
      provider: this.name,
    };
  }
  async confirm(): Promise<{ status: string }> {
    return { status: PaymentStatus.PENDING };
  }
}

// --- Mobile Money / Carte : a brancher sur un agregateur agree ---
class NotConfiguredProvider implements PaymentProvider {
  constructor(readonly name: string) {}
  async createIntent(): Promise<PaymentIntentResult> {
    throw new Error(
      `Le fournisseur de paiement "${this.name}" n'est pas encore configure.`
    );
  }
  async confirm(): Promise<{ status: string }> {
    return { status: PaymentStatus.PENDING };
  }
}

// Provider effectif. Sans PAYMENT_PROVIDER configure : "mock" (auto-confirme)
// UNIQUEMENT en developpement pour la demo ; en production on bascule sur
// "manual" -> jamais de fausse confirmation de paiement sans agregateur.
function defaultProviderKey(): string {
  const explicit = process.env.PAYMENT_PROVIDER;
  if (explicit) return explicit.toLowerCase();
  return process.env.NODE_ENV === "production" ? "manual" : "mock";
}

export function getPaymentProvider(): PaymentProvider {
  const key = defaultProviderKey();
  switch (key) {
    case "manual":
      return new ManualPaymentProvider();
    case "orange_money":
    case "wave":
    case "mtn_momo":
    case "card":
      return new NotConfiguredProvider(key);
    case "mock":
    default:
      return new MockPaymentProvider();
  }
}

// Le moyen de paiement choisi par le voyageur peut imposer le mode de traitement :
// virement / validation manuelle -> reste en attente (l'admin valide a la main),
// quel que soit le provider configure. Les autres suivent le provider global.
export function getPaymentProviderForMethod(method: string): PaymentProvider {
  const m = (method || "").toUpperCase();
  if (m === PaymentMethod.MANUAL || m === PaymentMethod.BANK_TRANSFER) {
    return new ManualPaymentProvider();
  }
  return getPaymentProvider();
}

export const isMockPayments = () => defaultProviderKey() === "mock";

// Liste de reference (libelles dans enums.paymentMethodMeta).
export const PAYMENT_METHOD_OPTIONS = [
  { value: PaymentMethod.WAVE, label: "Wave", hint: "Sans frais" },
  { value: PaymentMethod.ORANGE_MONEY, label: "Orange Money", hint: "Côte d'Ivoire" },
  { value: PaymentMethod.MTN_MOMO, label: "MTN MoMo", hint: "Mobile Money" },
  { value: PaymentMethod.MOOV_MONEY, label: "Moov Money", hint: "Mobile Money" },
  { value: PaymentMethod.CARD, label: "Carte bancaire", hint: "Visa / Mastercard" },
  { value: PaymentMethod.BANK_TRANSFER, label: "Virement bancaire", hint: "Validation manuelle" },
  { value: PaymentMethod.MANUAL, label: "Validation manuelle (admin)", hint: "Hors ligne" },
];
