"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLocale } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";

interface LogoProps {
  className?: string;
  variant?: "default" | "light" | "mono";
  withText?: boolean;
  href?: string | null;
}

/**
 * Logo officiel KoraStay (assets fournis dans /public/brand).
 * - withText : logo horizontal (icone + mot) ; sinon icone seule.
 * - variant "light" : version blanche (sur fond sombre).
 */
export function Logo({
  className,
  variant = "default",
  withText = true,
  href = "/",
}: LogoProps) {
  const locale = useLocale();
  const isLight = variant === "light";
  const src = withText
    ? isLight
      ? "/brand/logo-white.svg"
      : "/brand/logo.svg"
    : "/brand/icon.svg";

  const content = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="KoraStay"
      className={cn(withText ? "h-8 w-auto sm:h-9" : "h-9 w-auto", className)}
    />
  );

  if (href) {
    return (
      <Link href={localePath(href, locale)} aria-label="KoraStay - accueil" className="inline-flex items-center">
        {content}
      </Link>
    );
  }
  return content;
}
