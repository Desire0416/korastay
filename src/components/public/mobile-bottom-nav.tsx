"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MOBILE_TABS } from "@/lib/navigation";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";

const TAB_KEY: Record<string, "explore" | "favorites" | "stays" | "profile"> = {
  "/": "explore",
  "/account/favorites": "favorites",
  "/account/bookings": "stays",
  "/account": "profile",
};

export function MobileBottomNav() {
  const pathname = usePathname();
  const dict = useI18n();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-lg md:hidden">
      <ul className="flex h-[var(--bottom-nav-h)] items-stretch justify-around px-1">
        {MOBILE_TABS.map((tab) => {
          const href = localePath(tab.href, dict.locale);
          const active = tab.href === "/" ? pathname === href : pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  active ? "text-brand-600" : "text-muted"
                )}
              >
                <motion.span
                  whileTap={{ scale: 0.8 }}
                  animate={active ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    active && "bg-brand-50"
                  )}
                >
                  <Icon name={tab.icon} className="h-[18px] w-[18px]" />
                </motion.span>
                {dict.mobileTabs[TAB_KEY[tab.href] ?? "explore"]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
