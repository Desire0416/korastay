"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export type SettingsResult = { ok: boolean; error?: string; message?: string };

async function setKey(key: string, value: string) {
  await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
}

export async function saveSettings(_prev: SettingsResult, formData: FormData): Promise<SettingsResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);

  // Les frais de service sont desormais geres dans /admin/settings/payments.
  await setKey("contact_email", String(formData.get("contact_email") ?? "").trim());
  await setKey("contact_phone", String(formData.get("contact_phone") ?? "").trim());
  await setKey("announcement", String(formData.get("announcement") ?? "").trim());

  // Affichage (ou non) de la section publique "KoraStay en chiffres".
  await setKey("community_stats_visible", formData.get("community_stats_visible") ? "true" : "false");

  await prisma.auditLog.create({ data: { actorId: admin.id, action: "SETTINGS_UPDATED", entityType: "Setting", entityId: "global" } });
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  // Reflete immediatement le basculement sur l'accueil public.
  revalidateTag("community-stats");
  revalidatePath("/");
  return { ok: true, message: "Paramètres enregistrés." };
}
