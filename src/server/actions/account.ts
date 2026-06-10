"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";

export type FormResult = { ok: boolean; error?: string; message?: string };

export async function updateProfile(_prev: FormResult, formData: FormData): Promise<FormResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non autorise." };

  const schema = z.object({
    firstName: z.string().min(2, "Prenom requis"),
    lastName: z.string().min(2, "Nom requis"),
    phone: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    bio: z.string().max(600, "Bio trop longue (600 caracteres max)").optional(),
    avatarUrl: z.string().optional(),
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  // N'accepte que les photos hebergees localement (uploadees via /api/upload)
  const avatar = parsed.data.avatarUrl?.trim();
  const safeAvatar = avatar && avatar.startsWith("/uploads/") ? avatar : avatar === "" ? null : undefined;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || null,
      city: parsed.data.city || null,
      country: parsed.data.country || null,
      bio: parsed.data.bio?.trim() || null,
      ...(safeAvatar !== undefined ? { avatarUrl: safeAvatar } : {}),
    },
  });
  ["/account/profile", "/owner/profile", "/partner/profile", "/business/profile"].forEach((p) => revalidatePath(p));
  return { ok: true, message: "Profil mis a jour avec succes." };
}

export async function changePassword(_prev: FormResult, formData: FormData): Promise<FormResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non autorise." };

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  if (next.length < 8) return { ok: false, error: "Le nouveau mot de passe doit faire 8 caracteres minimum." };

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || !(await verifyPassword(current, dbUser.passwordHash))) {
    return { ok: false, error: "Mot de passe actuel incorrect." };
  }
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  return { ok: true, message: "Mot de passe modifie avec succes." };
}

export async function createReview(_prev: FormResult, formData: FormData): Promise<FormResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non autorise." };

  const reservationId = String(formData.get("reservationId") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "");

  if (rating < 1 || rating > 5) return { ok: false, error: "Note invalide." };

  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, travelerId: user.id, status: "COMPLETED" },
    include: { review: true },
  });
  if (!reservation) return { ok: false, error: "Reservation introuvable ou non eligible." };
  if (reservation.review) return { ok: false, error: "Vous avez deja laisse un avis." };

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        authorId: user.id,
        reservationId: reservation.id,
        residenceId: reservation.residenceId,
        packId: reservation.packId,
        rating,
        cleanlinessRating: Number(formData.get("cleanlinessRating")) || rating,
        locationRating: Number(formData.get("locationRating")) || rating,
        valueRating: Number(formData.get("valueRating")) || rating,
        communicationRating: Number(formData.get("communicationRating")) || rating,
        comment: comment || null,
      },
    });
    // Recalcule la moyenne de la residence
    if (reservation.residenceId) {
      const agg = await tx.review.aggregate({
        where: { residenceId: reservation.residenceId, status: "PUBLISHED" },
        _avg: { rating: true },
        _count: true,
      });
      await tx.residence.update({
        where: { id: reservation.residenceId },
        data: { ratingAverage: agg._avg.rating ?? 0, ratingCount: agg._count },
      });
    }
  });

  revalidatePath("/account/reviews");
  return { ok: true, message: "Merci pour votre avis !" };
}

export async function markAllNotificationsRead(): Promise<FormResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Non autorise." };
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/account/notifications");
  return { ok: true };
}
