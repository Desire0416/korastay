import { cn } from "@/lib/utils";

// Titre des ecrans d'authentification (serif + accent italique terracotta).
export function AuthHeading({
  title,
  accent,
  subtitle,
  className,
}: {
  title: string;
  accent?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h1 className="text-balance font-display text-[2.2rem] font-normal leading-[1.08] tracking-[-0.02em] text-foreground">
        {title} {accent && <em className="italic text-terracotta">{accent}</em>}
      </h1>
      {subtitle && <p className="mt-2.5 text-[15.5px] leading-relaxed text-muted">{subtitle}</p>}
    </div>
  );
}

/** Pastille d'etat (succes / erreur / info) en arche, pour les ecrans de resultat. */
export function AuthStatusIcon({
  tone = "brand",
  children,
}: {
  tone?: "brand" | "danger";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex h-20 w-16 items-center justify-center rounded-arch-sm shadow-card",
        tone === "brand" ? "bg-brand-500 text-white" : "bg-terracotta text-white"
      )}
    >
      {children}
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-danger ring-1 ring-inset ring-red-200/70">
      {message}
    </div>
  );
}
