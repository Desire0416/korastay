"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import {
  savePaymentSettings as persistPaymentSettings,
  DEFAULT_PAYMENT_SETTINGS,
  type PaymentSettings,
  type DepositPolicy,
} from "@/lib/payment-rules";
import { finalizeReservationPayment } from "@/lib/reservation-finalize";
import { PaymentMethod } from "@/lib/enums";

export type PayAdminResult = { ok: boolean; error?: string; message?: string };

const num = (v: FormDataEntryValue | null, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const policy = (v: FormDataEntryValue | null, fallback: DepositPolicy): DepositPolicy =>
  v === "FULL" || v === "HALF" ? v : fallback;

const CONFIGURABLE_METHODS = [
  PaymentMethod.WAVE,
  PaymentMethod.ORANGE_MONEY,
  PaymentMethod.MTN_MOMO,
  PaymentMethod.MOOV_MONEY,
  PaymentMethod.CARD,
  PaymentMethod.BANK_TRANSFER,
  PaymentMethod.MANUAL,
];

// ============================================================
// 1. Enregistrement des regles de paiement
// ============================================================
export async function savePaymentSettings(
  _prev: PayAdminResult,
  formData: FormData
): Promise<PayAdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const d = DEFAULT_PAYMENT_SETTINGS;

  const methods: Record<string, boolean> = {};
  for (const m of CONFIGURABLE_METHODS) methods[m] = formData.get(`method_${m}`) === "1";

  const feePercent = Math.min(30, Math.max(0, num(formData.get("serviceFeePercent"), d.serviceFeePercent)));
  const feeMin = Math.max(0, num(formData.get("serviceFeeMin"), d.serviceFeeMin));
  const feeMax = Math.max(feeMin, num(formData.get("serviceFeeMax"), d.serviceFeeMax));

  const settings: PaymentSettings = {
    methods,
    serviceFeePercent: feePercent,
    serviceFeeMin: feeMin,
    serviceFeeMax: feeMax,
    residenceStandardPolicy: policy(formData.get("residenceStandardPolicy"), d.residenceStandardPolicy),
    residencePremiumPolicy: policy(formData.get("residencePremiumPolicy"), d.residencePremiumPolicy),
    residenceHighDemandPolicy: policy(formData.get("residenceHighDemandPolicy"), d.residenceHighDemandPolicy),
    residenceOneNightPolicy: policy(formData.get("residenceOneNightPolicy"), d.residenceOneNightPolicy),
    businessDepositPercent: Math.min(100, Math.max(0, num(formData.get("businessDepositPercent"), d.businessDepositPercent))),
    packPolicy: policy(formData.get("packPolicy"), d.packPolicy),
    activityPolicy: policy(formData.get("activityPolicy"), d.activityPolicy),
    payoutNewCheckInPercent: Math.min(100, Math.max(0, num(formData.get("payoutNewCheckInPercent"), d.payoutNewCheckInPercent))),
    payoutReliableCheckInPercent: Math.min(100, Math.max(0, num(formData.get("payoutReliableCheckInPercent"), d.payoutReliableCheckInPercent))),
    payViaKoraStayNote: String(formData.get("payViaKoraStayNote") ?? "").trim() || d.payViaKoraStayNote,
  };

  await persistPaymentSettings(settings);
  await prisma.auditLog.create({
    data: { actorId: admin.id, action: "PAYMENT_SETTINGS_UPDATED", entityType: "Setting", entityId: "payment_settings" },
  });
  revalidatePath("/admin/settings/payments");
  revalidatePath("/admin/settings");
  return { ok: true, message: "Regles de paiement enregistrées." };
}

// ============================================================
// 7. Validation manuelle d'un paiement recu hors API
// ============================================================
export async function recordManualPayment(
  _prev: PayAdminResult,
  formData: FormData
): Promise<PayAdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);

  const reservationId = String(formData.get("reservationId") ?? "");
  const amount = Math.round(num(formData.get("amount"), 0));
  const method = String(formData.get("method") ?? "MANUAL");
  const reference = String(formData.get("reference") ?? "").trim();
  const paidAtRaw = String(formData.get("paidAt") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();

  if (!reservationId) return { ok: false, error: "Réservation manquante." };
  if (amount <= 0) return { ok: false, error: "Montant invalide." };

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: { id: true, status: true, reference: true, totalAmount: true, amountPaid: true },
  });
  if (!reservation) return { ok: false, error: "Réservation introuvable." };
  if (!["PENDING_PAYMENT", "PARTIALLY_PAID"].includes(reservation.status)) {
    return { ok: false, error: "Cette réservation n'attend pas de paiement." };
  }

  const paidAt = paidAtRaw ? new Date(paidAtRaw) : new Date();

  await prisma.payment.create({
    data: {
      reservationId,
      method,
      status: "PAID",
      amount,
      provider: "manual",
      providerReference: reference || null,
      paidAt,
      metadata: JSON.stringify({ recordedBy: admin.id, comment, source: "admin_manual" }),
    },
  });

  // Confirme la reservation et declenche reversements / missions.
  await finalizeReservationPayment(reservationId, amount);

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "MANUAL_PAYMENT_VALIDATED",
      entityType: "Reservation",
      entityId: reservationId,
      metadata: JSON.stringify({ amount, method, reference }),
    },
  });

  revalidatePath(`/admin/reservations/${reservationId}`);
  revalidatePath("/admin/payments");
  return { ok: true, message: `Paiement de ${formatPrice(amount)} valide.` };
}

// Validation d'un paiement deja enregistre (virement declare par le client).
export async function validatePendingPayment(paymentId: string): Promise<PayAdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { id: true, status: true, amount: true, reservationId: true },
  });
  if (!payment) return { ok: false, error: "Paiement introuvable." };
  if (payment.status === "PAID") return { ok: false, error: "Paiement déjà valide." };

  await prisma.payment.update({ where: { id: paymentId }, data: { status: "PAID", paidAt: new Date() } });
  await finalizeReservationPayment(payment.reservationId, payment.amount);
  await prisma.auditLog.create({
    data: { actorId: admin.id, action: "PAYMENT_VALIDATED", entityType: "Payment", entityId: paymentId },
  });

  revalidatePath(`/admin/reservations/${payment.reservationId}`);
  revalidatePath("/admin/payments");
  return { ok: true, message: "Paiement valide." };
}

// ============================================================
// 8. Reversements hote (liberation / blocage manuel)
// ============================================================
export async function releasePayout(payoutId: string): Promise<PayAdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const payout = await prisma.payout.findUnique({ where: { id: payoutId }, include: { reservation: { select: { status: true, reference: true } } } });
  if (!payout) return { ok: false, error: "Reversement introuvable." };
  if (payout.status === "RELEASED") return { ok: false, error: "Déjà verse." };
  if (payout.reservation.status === "DISPUTED") return { ok: false, error: "Litige en cours : reversement bloqué." };

  await prisma.payout.update({ where: { id: payoutId }, data: { status: "RELEASED", releasedAt: new Date(), releasedById: admin.id } });
  await prisma.notification.create({
    data: {
      userId: payout.ownerId,
      title: "Reversement effectué",
      body: `Un reversement de ${formatPrice(payout.amount)} (${payout.reservation.reference}) a ete libéré.`,
      type: "PAYOUT_RELEASED",
      url: "/owner/revenues",
    },
  });
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "PAYOUT_RELEASED", entityType: "Payout", entityId: payoutId, metadata: JSON.stringify({ amount: payout.amount }) } });
  revalidatePath("/admin/payouts");
  return { ok: true, message: `Reversement de ${formatPrice(payout.amount)} libéré.` };
}

export async function blockPayout(payoutId: string): Promise<PayAdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
  if (!payout) return { ok: false, error: "Reversement introuvable." };
  await prisma.payout.update({ where: { id: payoutId }, data: { status: "BLOCKED" } });
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "PAYOUT_BLOCKED", entityType: "Payout", entityId: payoutId } });
  revalidatePath("/admin/payouts");
  return { ok: true, message: "Reversement bloqué." };
}

// Fiabilite de l'hote (NEW = 70/30, RELIABLE = 100% au check-in).
export async function setOwnerPayoutTier(userId: string, tier: string): Promise<PayAdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const value = tier === "RELIABLE" ? "RELIABLE" : "NEW";
  await prisma.user.update({ where: { id: userId }, data: { payoutTier: value } });
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "PAYOUT_TIER_SET", entityType: "User", entityId: userId, metadata: JSON.stringify({ tier: value }) } });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { ok: true, message: `Fiabilité mise a jour (${value === "RELIABLE" ? "fiable" : "nouveau"}).` };
}

// ============================================================
// 5. Caution : cycle de vie (recue / restituee / retenue)
// ============================================================
export async function setCautionStatus(
  reservationId: string,
  status: string,
  justification?: string
): Promise<PayAdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const allowed = ["REQUIRED", "HELD", "RELEASED", "RETAINED"];
  if (!allowed.includes(status)) return { ok: false, error: "Statut de caution invalide." };
  if (status === "RETAINED" && !justification?.trim()) {
    return { ok: false, error: "Une justification est obligatoire pour retenir la caution." };
  }

  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId }, select: { travelerId: true, reference: true, notes: true } });
  if (!reservation) return { ok: false, error: "Réservation introuvable." };

  await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      cautionStatus: status,
      ...(justification?.trim() ? { notes: `${reservation.notes ?? ""}\n[Caution] ${justification.trim()}`.trim() } : {}),
    },
  });
  await prisma.notification.create({
    data: {
      userId: reservation.travelerId,
      title: "Mise a jour de la caution",
      body: `La caution de votre réservation ${reservation.reference} est : ${status === "RELEASED" ? "restituee" : status === "RETAINED" ? "retenue" : status === "HELD" ? "bloquee" : "requise"}.`,
      type: "CAUTION_UPDATE",
      url: `/account/bookings/${reservationId}`,
    },
  });
  await prisma.auditLog.create({ data: { actorId: admin.id, action: "CAUTION_STATUS", entityType: "Reservation", entityId: reservationId, metadata: JSON.stringify({ status }) } });
  revalidatePath(`/admin/reservations/${reservationId}`);
  return { ok: true, message: "Caution mise a jour." };
}
