"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export type AdminResult = { ok: boolean; error?: string; message?: string };

async function audit(actorId: string, action: string, entityType: string, entityId: string, metadata?: object) {
  await prisma.auditLog.create({
    data: { actorId, action, entityType, entityId, metadata: metadata ? JSON.stringify(metadata) : null },
  });
}

async function notify(userId: string, title: string, body: string, url?: string, type = "ADMIN") {
  await prisma.notification.create({ data: { userId, title, body, url, type } });
}

// ------------------------------------------------------------
// Residences
// ------------------------------------------------------------
export async function validateResidence(id: string, qualityLevel: string): Promise<AdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!["ESSENTIAL", "COMFORT", "PREMIUM"].includes(qualityLevel)) {
    return { ok: false, error: "Niveau de qualite invalide." };
  }
  const residence = await prisma.residence.findUnique({ where: { id } });
  if (!residence) return { ok: false, error: "Introuvable." };

  await prisma.residence.update({
    where: { id },
    data: {
      status: "PUBLISHED", verificationStatus: "VERIFIED", isVerified: true,
      qualityLevel, badgeLabel: "Residence verifiee KoraStay", publishedAt: new Date(),
    },
  });
  await notify(residence.ownerId, "Residence validee", `${residence.name} est validee et publiee (niveau ${qualityLevel}).`, "/owner/residences");
  await audit(admin.id, "RESIDENCE_VALIDATED", "Residence", id, { qualityLevel });
  revalidatePath("/admin/residences");
  revalidatePath(`/admin/residences/${id}`);
  return { ok: true, message: "Residence validee et publiee." };
}

export async function requestResidenceChanges(id: string, note: string): Promise<AdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const residence = await prisma.residence.findUnique({ where: { id } });
  if (!residence) return { ok: false, error: "Introuvable." };
  await prisma.residence.update({ where: { id }, data: { verificationStatus: "NEEDS_CHANGES" } });
  await notify(residence.ownerId, "Corrections demandees", `${residence.name} : ${note || "Des modifications sont requises."}`, "/owner/residences");
  await audit(admin.id, "RESIDENCE_CHANGES_REQUESTED", "Residence", id, { note });
  revalidatePath(`/admin/residences/${id}`);
  return { ok: true, message: "Demande de corrections envoyee." };
}

export async function setResidenceStatus(id: string, status: string): Promise<AdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  await prisma.residence.update({ where: { id }, data: { status } });
  await audit(admin.id, "RESIDENCE_STATUS", "Residence", id, { status });
  revalidatePath("/admin/residences");
  revalidatePath(`/admin/residences/${id}`);
  return { ok: true, message: "Statut mis a jour." };
}

// ------------------------------------------------------------
// Utilisateurs
// ------------------------------------------------------------
export async function setUserStatus(id: string, status: string): Promise<AdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (id === admin.id) return { ok: false, error: "Vous ne pouvez pas modifier votre propre statut." };
  await prisma.user.update({ where: { id }, data: { status } });
  if (status === "SUSPENDED" || status === "DISABLED") {
    await prisma.session.deleteMany({ where: { userId: id } });
  }
  await audit(admin.id, "USER_STATUS", "User", id, { status });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  return { ok: true, message: "Statut utilisateur mis a jour." };
}

export async function setUserRole(id: string, role: string): Promise<AdminResult> {
  const admin = await requireRole(["SUPER_ADMIN"]);
  await prisma.user.update({ where: { id }, data: { role } });
  await audit(admin.id, "USER_ROLE_CHANGED", "User", id, { role });
  revalidatePath(`/admin/users/${id}`);
  return { ok: true, message: "Role mis a jour." };
}

// ------------------------------------------------------------
// Partenaires
// ------------------------------------------------------------
export async function setPartnerStatus(id: string, status: string): Promise<AdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const partner = await prisma.partnerProfile.findUnique({ where: { id }, select: { userId: true, businessName: true } });
  if (!partner) return { ok: false, error: "Introuvable." };
  await prisma.partnerProfile.update({ where: { id }, data: { verificationStatus: status } });
  const label = status === "VERIFIED" ? "valide" : status === "REJECTED" ? "refuse" : "mis a jour";
  await notify(partner.userId, "Statut partenaire", `Votre profil ${partner.businessName} a ete ${label}.`, "/partner");
  await audit(admin.id, "PARTNER_STATUS", "PartnerProfile", id, { status });
  revalidatePath("/admin/partners");
  revalidatePath(`/admin/partners/${id}`);
  return { ok: true, message: "Statut partenaire mis a jour." };
}

// ------------------------------------------------------------
// Business
// ------------------------------------------------------------
export async function setBusinessRequestStatus(id: string, status: string): Promise<AdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  await prisma.businessRequest.update({ where: { id }, data: { status } });
  await audit(admin.id, "BUSINESS_REQUEST_STATUS", "BusinessRequest", id, { status });
  revalidatePath("/admin/business");
  revalidatePath(`/admin/business/${id}`);
  return { ok: true, message: "Demande mise a jour." };
}

export async function sendBusinessQuote(id: string, _prev: AdminResult, formData: FormData): Promise<AdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const amount = Number(formData.get("quoteAmount"));
  const message = String(formData.get("quoteMessage") ?? "");
  if (!amount || amount < 1000) return { ok: false, error: "Montant du devis invalide (min 1000 F CFA)." };

  const req = await prisma.businessRequest.findUnique({ where: { id } });
  if (!req) return { ok: false, error: "Demande introuvable." };

  await prisma.businessRequest.update({
    where: { id },
    data: { quoteAmount: amount, quoteMessage: message || null, quotedAt: new Date(), status: "QUOTED" },
  });

  // Notifie le client business (si compte rattache a l'email)
  const client = await prisma.user.findUnique({ where: { email: req.email }, select: { id: true } });
  if (client) {
    await notify(client.id, "Devis recu", `Votre devis pour "${req.needType ?? req.organizationName}" est disponible.`, "/business/requests", "BUSINESS_QUOTE");
  }
  await audit(admin.id, "BUSINESS_QUOTE_SENT", "BusinessRequest", id, { amount });
  revalidatePath("/admin/business");
  revalidatePath(`/admin/business/${id}`);
  return { ok: true, message: "Devis envoye au client." };
}

// ------------------------------------------------------------
// Avis
// ------------------------------------------------------------
export async function moderateReview(id: string, status: string): Promise<AdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);
  await prisma.review.update({ where: { id }, data: { status } });
  await audit(admin.id, "REVIEW_MODERATED", "Review", id, { status });
  revalidatePath("/admin/reviews");
  return { ok: true, message: "Avis modere." };
}

// ------------------------------------------------------------
// Reservations & remboursements
// ------------------------------------------------------------
export async function adminSetReservationStatus(id: string, status: string): Promise<AdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) return { ok: false, error: "Introuvable." };
  await prisma.reservation.update({
    where: { id },
    data: { status, confirmedAt: status === "CONFIRMED" ? new Date() : reservation.confirmedAt, cancelledAt: status === "CANCELLED" ? new Date() : reservation.cancelledAt },
  });
  await notify(reservation.travelerId, "Mise a jour de reservation", `Votre reservation ${reservation.reference} a ete mise a jour.`, `/account/bookings/${id}`);
  await audit(admin.id, "RESERVATION_STATUS", "Reservation", id, { status });
  revalidatePath("/admin/reservations");
  revalidatePath(`/admin/reservations/${id}`);
  return { ok: true, message: "Reservation mise a jour." };
}

export async function processRefund(refundId: string): Promise<AdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const refund = await prisma.refund.findUnique({ where: { id: refundId }, include: { reservation: true, payment: true } });
  if (!refund) return { ok: false, error: "Introuvable." };

  await prisma.$transaction([
    prisma.refund.update({ where: { id: refundId }, data: { status: "PAID", processedById: admin.id, processedAt: new Date() } }),
    prisma.payment.update({ where: { id: refund.paymentId }, data: { status: refund.amount >= refund.payment.amount ? "REFUNDED" : "PARTIALLY_REFUNDED" } }),
  ]);
  await notify(refund.reservation.travelerId, "Remboursement traite", `Votre remboursement pour ${refund.reservation.reference} a ete traite.`, `/account/bookings/${refund.reservationId}`);
  await audit(admin.id, "REFUND_PROCESSED", "Refund", refundId, { amount: refund.amount });
  revalidatePath("/admin/refunds");
  return { ok: true, message: "Remboursement traite." };
}

// ------------------------------------------------------------
// Packs (statut)
// ------------------------------------------------------------
export async function setPackStatus(id: string, status: string): Promise<AdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  await prisma.pack.update({ where: { id }, data: { status } });
  await audit(admin.id, "PACK_STATUS", "Pack", id, { status });
  revalidatePath("/admin/packs");
  return { ok: true, message: "Pack mis a jour." };
}

// ------------------------------------------------------------
// Contenu
// ------------------------------------------------------------
export async function updateContentPage(id: string, _prev: AdminResult, formData: FormData): Promise<AdminResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "");
  if (title.length < 2 || body.length < 10) return { ok: false, error: "Titre et contenu requis." };
  await prisma.contentPage.update({ where: { id }, data: { title, body } });
  await audit(admin.id, "CONTENT_UPDATED", "ContentPage", id);
  revalidatePath("/admin/content/pages");
  return { ok: true, message: "Page mise a jour." };
}

// ------------------------------------------------------------
// Images des packs (import par l'admin, comme les residences)
// ------------------------------------------------------------
export async function addPackImage(packId: string, url: string): Promise<AdminResult> {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const count = await prisma.packImage.count({ where: { packId } });
  await prisma.packImage.create({ data: { packId, url, sortOrder: count, isCover: count === 0 } });
  revalidatePath(`/admin/packs/${packId}/edit`);
  return { ok: true };
}

export async function deletePackImage(imageId: string): Promise<AdminResult> {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const img = await prisma.packImage.findUnique({ where: { id: imageId } });
  if (!img) return { ok: false, error: "Image introuvable." };
  await prisma.packImage.delete({ where: { id: imageId } });
  if (img.isCover) {
    const next = await prisma.packImage.findFirst({ where: { packId: img.packId }, orderBy: { sortOrder: "asc" } });
    if (next) await prisma.packImage.update({ where: { id: next.id }, data: { isCover: true } });
  }
  revalidatePath(`/admin/packs/${img.packId}/edit`);
  return { ok: true };
}

export async function setPackCoverImage(imageId: string): Promise<AdminResult> {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const img = await prisma.packImage.findUnique({ where: { id: imageId } });
  if (!img) return { ok: false, error: "Image introuvable." };
  await prisma.$transaction([
    prisma.packImage.updateMany({ where: { packId: img.packId }, data: { isCover: false } }),
    prisma.packImage.update({ where: { id: imageId }, data: { isCover: true } }),
  ]);
  revalidatePath(`/admin/packs/${img.packId}/edit`);
  return { ok: true };
}
