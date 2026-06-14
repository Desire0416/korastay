import { prisma } from "./prisma";
import { SERVICE_FEE_RATE, CONTACT_EMAIL, CONTACT_PHONE } from "./constants";

export const SETTING_DEFAULTS: Record<string, string> = {
  service_fee_rate: String(SERVICE_FEE_RATE),
  contact_email: CONTACT_EMAIL,
  contact_phone: CONTACT_PHONE,
  whatsapp_number: "",
  announcement: "",
  // Section publique "KoraStay en chiffres" : masquee par defaut (chiffres faibles).
  community_stats_visible: "false",
};

export async function getSettingsMap(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany();
  const map = { ...SETTING_DEFAULTS };
  for (const r of rows) map[r.key] = r.value;
  return map;
}

// Taux de frais de service (fraction). Source : payment_settings (nouveau),
// repli sur l'ancienne cle service_fee_rate puis sur la constante.
export async function getServiceFeeRate(): Promise<number> {
  const pay = await prisma.setting.findUnique({ where: { key: "payment_settings" } });
  if (pay) {
    try {
      const pct = JSON.parse(pay.value)?.serviceFeePercent;
      if (typeof pct === "number" && pct >= 0 && pct <= 30) return pct / 100;
    } catch {
      /* ignore */
    }
  }
  const s = await prisma.setting.findUnique({ where: { key: "service_fee_rate" } });
  const v = s ? parseFloat(s.value) : NaN;
  return Number.isFinite(v) && v >= 0 && v < 1 ? v : SERVICE_FEE_RATE;
}

export async function getAnnouncement(): Promise<string | null> {
  const s = await prisma.setting.findUnique({ where: { key: "announcement" } });
  return s?.value?.trim() ? s.value.trim() : null;
}
