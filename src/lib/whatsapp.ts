import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { CONTACT_PHONE } from "./constants";

// Nettoie un numero pour wa.me : chiffres uniquement, sans "+" ni "00".
// Ex : "+225 07 57 90 88 84" -> "2250757908884".
export function sanitizeWhatsApp(raw: string): string {
  let d = (raw || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  return d;
}

// Construit un lien wa.me (avec message pre-rempli optionnel) ou null si invalide.
export function buildWhatsAppLink(rawNumber: string, text?: string): string | null {
  const num = sanitizeWhatsApp(rawNumber);
  if (num.length < 8) return null; // numero absent / invalide
  const base = `https://wa.me/${num}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

// Numero WhatsApp KoraStay (reglage admin "whatsapp_number", repli sur le
// telephone de contact). Mis en cache : change rarement, revalide au save.
export const getWhatsAppNumber = unstable_cache(
  async (): Promise<string> => {
    try {
      const row = await prisma.setting.findUnique({ where: { key: "whatsapp_number" } });
      return row?.value?.trim() || CONTACT_PHONE;
    } catch {
      // Base indisponible (ex: Neon a froid) : on ne casse jamais le layout public.
      return CONTACT_PHONE;
    }
  },
  ["whatsapp-number-v1"],
  { revalidate: 300, tags: ["site-settings"] },
);
