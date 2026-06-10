"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function toggleFavorite(input: {
  residenceId?: string;
  packId?: string;
}): Promise<{ ok: boolean; favorited?: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Connectez-vous pour ajouter aux favoris." };
  }

  const where = input.residenceId
    ? { userId_residenceId: { userId: user.id, residenceId: input.residenceId } }
    : input.packId
      ? { userId_packId: { userId: user.id, packId: input.packId } }
      : null;

  if (!where) return { ok: false, error: "Element invalide." };

  const existing = await prisma.favorite.findUnique({ where: where as never });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/account/favorites");
    return { ok: true, favorited: false };
  }

  await prisma.favorite.create({
    data: {
      userId: user.id,
      residenceId: input.residenceId ?? null,
      packId: input.packId ?? null,
    },
  });
  revalidatePath("/account/favorites");
  return { ok: true, favorited: true };
}

export async function getUserFavoriteIds(): Promise<{
  residences: Set<string>;
  packs: Set<string>;
}> {
  const user = await getCurrentUser();
  if (!user) return { residences: new Set(), packs: new Set() };

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { residenceId: true, packId: true },
  });

  return {
    residences: new Set(
      favorites.map((f) => f.residenceId).filter(Boolean) as string[]
    ),
    packs: new Set(favorites.map((f) => f.packId).filter(Boolean) as string[]),
  };
}
