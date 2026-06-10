import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  className?: string;
  variant?: "default" | "light" | "mono";
  withText?: boolean;
  href?: string | null;
}

/**
 * Logo KoraStay : marque "Kora" (vert) + "Stay", avec un pin localise
 * sur le K (concept "Route & Repere" de la charte graphique).
 */
export function Logo({
  className,
  variant = "default",
  withText = true,
  href = "/",
}: LogoProps) {
  const stayColor =
    variant === "light" ? "#FFFFFF" : variant === "mono" ? "#12343B" : "#12343B";
  const koraColor =
    variant === "light" ? "#FFFFFF" : variant === "mono" ? "#12343B" : "#0F6B4F";

  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center">
        <svg
          viewBox="0 0 40 40"
          className="h-9 w-9"
          fill="none"
          aria-hidden="true"
        >
          <rect
            width="40"
            height="40"
            rx="11"
            fill={variant === "light" ? "rgba(255,255,255,0.14)" : "#0F6B4F"}
          />
          <path
            d="M14 9v22M14 20l8-8M14 20l8 9"
            stroke={variant === "light" ? "#FFFFFF" : "#FFFFFF"}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M27.5 12.5c2.6 0 4.7 2.05 4.7 4.6 0 3.2-4.7 7.4-4.7 7.4s-4.7-4.2-4.7-7.4c0-2.55 2.1-4.6 4.7-4.6Z"
            fill="#F2A23A"
          />
          <circle cx="27.5" cy="17" r="1.7" fill="#0F6B4F" />
        </svg>
      </span>
      {withText && (
        <span className="text-[1.35rem] font-extrabold leading-none tracking-tight">
          <span style={{ color: koraColor }}>Kora</span>
          <span style={{ color: stayColor }}>Stay</span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label="KoraStay - accueil" className="inline-flex">
        {content}
      </Link>
    );
  }
  return content;
}
