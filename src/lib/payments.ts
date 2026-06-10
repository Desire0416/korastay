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

export function getPaymentProvider(): PaymentProvider {
  const key = (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase();
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

export const isMockPayments = () =>
  (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase() === "mock";

export const PAYMENT_METHOD_OPTIONS = [
  { value: PaymentMethod.ORANGE_MONEY, label: "Orange Money", hint: "Cote d'Ivoire" },
  { value: PaymentMethod.WAVE, label: "Wave", hint: "Sans frais" },
  { value: PaymentMethod.MTN_MOMO, label: "MTN MoMo", hint: "Bientot" },
  { value: PaymentMethod.CARD, label: "Carte bancaire", hint: "Visa / Mastercard" },
];
