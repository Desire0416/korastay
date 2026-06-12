"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

// Navigation desktop avec etat actif (pilule surlignee).
export function HeaderNav({ items }: { items: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-0.5 lg:flex">
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200",
              active
                ? "bg-brand-50 text-brand-700"
                : "text-foreground/70 hover:bg-surface-soft hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
