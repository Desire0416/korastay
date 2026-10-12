import { getLocale } from "./i18n.server";
import { ACTION_MESSAGES_EN } from "./dictionaries/action-messages";

/**
 * Traduit un message d'action serveur (cle = texte FR) dans la langue de la
 * requete. Les actions sont postees sur l'URL de la page, donc x-locale y est
 * disponible ; hors requete (script, cron sans en-tete), repli sur le FR.
 *   tr("Note invalide.")                          -> "Invalid rating." en EN
 *   tr("Paiement de {amount} validé.", { amount }) -> gabarit avec variables
 */
export async function tr(fr: string, vars?: Record<string, string | number>): Promise<string> {
  let locale = "fr";
  try {
    locale = await getLocale();
  } catch {
    // pas de contexte de requete
  }
  let text = locale === "en" ? ACTION_MESSAGES_EN[fr] ?? fr : fr;
  if (vars) {
    for (const [key, value] of Object.entries(vars)) text = text.split(`{${key}}`).join(String(value));
  }
  return text;
}
