"use client";

import NextLink from "next/link";
import { useLocale } from "./provider";
import { localePath } from "@/lib/i18n";

/**
 * Variante de next/link qui prefixe automatiquement les liens internes
 * avec la locale courante (/en/...). Les liens externes / mailto / tel /
 * ancres restent intacts. A utiliser dans les composants client.
 */
export function LocaleLink({
  href,
  ...props
}: React.ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  const resolved = typeof href === "string" ? localePath(href, locale) : href;
  return <NextLink href={resolved} {...props} />;
}
