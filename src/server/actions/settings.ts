"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export type SettingsResult = { ok: boolean; error?: string; message?: string };

async function setKey(key: string, value: string) {
  await prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
}

export async function saveSettings(_prev: SettingsResult, formData: FormData): Promise<SettingsResult> {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);

  const feePercent = Number(formData.get("feePercent"));
  if (Number.isFinite(feePercent) && feePercent >= 0 && feePercent <= 30) {
    await setKey("service_fee_rate", String(feePercent / 100));
  }
  await setKey("contact_email", String(formData.get("contact_email") ?? "").trim());
  await setKey("contact_phone", String(formData.get("contact_phone") ?? "").trim());
  await setKey("announcement", String(formData.get("announcement") ?? "").trim());

  await prisma.auditLog.create({ data: { actorId: admin.id, action: "SETTINGS_UPDATED", entityType: "Setting", entityId: "global" } });
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  return { ok: true, message: "Parametres enregistres." };
}
