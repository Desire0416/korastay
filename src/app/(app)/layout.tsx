import { I18nProvider } from "@/components/i18n/provider";
import { getI18n } from "@/lib/i18n.server";

// Espaces connectes : dictionnaire complet (y compris les cles "dash*")
// pour les composants clients des tableaux de bord.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { dict } = await getI18n();
  return <I18nProvider dict={dict}>{children}</I18nProvider>;
}
