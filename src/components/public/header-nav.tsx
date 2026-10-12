"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

// Navigation desktop v2 : liens texte, l'etat actif est marque par un
// petit losange terracotta sous le libelle (rappel des motifs).
export function HeaderNav({ items }: { items: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative px-3 py-2 text-[14px] font-semibold transition-colors duration-200",
              active ? "text-ink" : "text-foreground/65 hover:text-ink"
            )}
          >
            {item.label}
            <svg
              viewBox="0 0 10 10"
              aria-hidden="true"
              className={cn(
                "absolute -bottom-0.5 left-1/2 h-[7px] w-[7px] -translate-x-1/2 text-terracotta transition-all duration-300",
                active ? "scale-100 opacity-100" : "scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-60"
              )}
            >
              <path d="M5 0 10 5 5 10 0 5Z" fill="currentColor" />
            </svg>
          </Link>
        );
      })}
    </nav>
  );
}
