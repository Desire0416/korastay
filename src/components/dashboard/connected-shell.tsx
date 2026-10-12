"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeft, ExternalLink } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Motif, MotifBand } from "@/components/brand/motif";
import { Icon } from "@/components/ui/icon";
import { UserMenu } from "@/components/public/user-menu";
import { NotificationBell } from "./notification-bell";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";
import { navText, navShortText } from "@/lib/dictionaries/dashboard";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/navigation";
import type { SessionUser } from "@/lib/auth";

interface NavGroup {
  group: string;
  items: NavItem[];
}

interface ConnectedShellProps {
  user: SessionUser;
  /** Libelle deja traduit de l'espace (calcule par le layout serveur). */
  spaceLabel: string;
  items?: NavItem[];
  groups?: NavGroup[];
  notifCount?: number;
  children: React.ReactNode;
}

// Coque des espaces connectes v2 : barre laterale indigo (trame bogolan,
// frise terracotta), element actif en pastille claire, en-tete creme.
export function ConnectedShell({
  user,
  spaceLabel,
  items,
  groups,
  notifCount = 0,
  children,
}: ConnectedShellProps) {
  const pathname = usePathname();
  const dict = useI18n();
  const d = dict.dash;
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navGroups: NavGroup[] = groups ?? [{ group: "", items: items ?? [] }];
  const flatItems = navGroups.flatMap((g) => g.items);
  const mobileTabs = flatItems.slice(0, 4);
  const href = (h: string) => localePath(h, dict.locale);

  function isActive(itemHref: string) {
    const base = href(itemHref.split("?")[0]);
    if (pathname === base) return true;
    // actif si sous-route, sauf pour les racines courtes type "/owner"
    const segments = itemHref.split("?")[0].split("/").filter(Boolean);
    if (segments.length >= 2) return pathname.startsWith(base + "/");
    return false;
  }

  const sidebarNav = (onNavigate?: () => void, forceExpanded = false) => {
    const compact = collapsed && !forceExpanded;
    return (
      <nav className="relative min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.group && !compact && (
              <p className="eyebrow px-3 pb-2 text-[9.5px] text-gold-300/80">{navText(d, group.group)}</p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const label = navText(d, item.label);
                return (
                  <Link
                    key={item.href + item.label}
                    href={href(item.href)}
                    onClick={onNavigate}
                    title={compact ? label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                      active ? "bg-white text-ink shadow-soft" : "text-white/70 hover:bg-white/[0.06] hover:text-white",
                      compact && "justify-center px-2"
                    )}
                  >
                    <Icon name={item.icon} className={cn("h-[18px] w-[18px] shrink-0", active && "text-terracotta")} />
                    {!compact && <span className="truncate">{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    );
  };

  return (
    <div className="min-h-dvh bg-background">
      {/* Barre laterale (desktop) */}
      <aside
        className={cn(
          "grain fixed inset-y-0 left-0 z-30 hidden flex-col overflow-hidden bg-ink-800 text-white transition-[width] duration-300 lg:flex print:!hidden",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        <Motif variant="bogolan" fade="bottom" className="text-white/[0.04]" />
        <div className={cn("relative flex h-[var(--header-h)] shrink-0 items-center border-b border-white/10 px-5", collapsed && "justify-center px-2")}>
          {collapsed ? <Logo withText={false} href="/" /> : <Logo variant="light" />}
        </div>
        {sidebarNav()}
        <div className="relative border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white",
              collapsed && "justify-center px-2"
            )}
            aria-label={d.collapse}
          >
            {collapsed ? <PanelLeft className="h-[18px] w-[18px]" /> : <><PanelLeftClose className="h-[18px] w-[18px]" /> {d.collapse}</>}
          </button>
        </div>
        <MotifBand className="relative text-terracotta" />
      </aside>

      {/* Zone principale */}
      <div className={cn("flex min-h-dvh flex-col transition-[padding] duration-300 print:!pl-0", collapsed ? "lg:pl-[76px]" : "lg:pl-64")}>
        {/* En-tete */}
        <header className="sticky top-0 z-20 flex h-[var(--header-h)] items-center justify-between gap-3 border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl lg:px-8 print:hidden">
          <div className="flex min-w-0 items-center gap-3">
            {/* Menu mobile */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label={d.menu}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 bg-surface text-ink lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="grain flex flex-col overflow-hidden border-0 bg-ink-800 p-0 text-white">
                <SheetTitle className="sr-only">{d.navigation}</SheetTitle>
                <Motif variant="bogolan" fade="bottom" className="text-white/[0.04]" />
                <div className="relative flex h-[var(--header-h)] shrink-0 items-center border-b border-white/10 px-5">
                  <Logo variant="light" />
                </div>
                <div className="relative flex min-h-0 flex-1 flex-col">{sidebarNav(() => setMobileOpen(false), true)}</div>
                <MotifBand className="relative text-terracotta" />
              </SheetContent>
            </Sheet>
            <div className="min-w-0">
              <p className="eyebrow truncate text-[10px] text-terracotta">{spaceLabel}</p>
              <p className="hidden truncate font-display text-[17px] leading-tight text-foreground sm:block">
                {d.hello.replace("{name}", user.firstName)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={href("/")}
              className="hidden h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-foreground/70 transition-colors hover:bg-sand-100 hover:text-ink sm:flex"
            >
              <ExternalLink className="h-4 w-4" /> {d.publicSite}
            </Link>
            <NotificationBell initialUnread={notifCount} allHref={href(notifLinkForRole(user.role))} />
            <UserMenu user={user} />
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-10 print:p-0">{children}</main>

        {/* Onglets mobiles */}
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-lg lg:hidden print:hidden">
          <ul className="flex h-[var(--bottom-nav-h)] items-stretch justify-around">
            {mobileTabs.map((tab) => {
              const active = isActive(tab.href);
              const label = navShortText(d, tab.label);
              return (
                <li key={tab.href + tab.label} className="flex-1">
                  <Link
                    href={href(tab.href)}
                    className={cn(
                      "flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium",
                      active ? "font-semibold text-ink" : "text-muted"
                    )}
                  >
                    <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition-colors", active && "bg-sand-200/70 text-terracotta")}>
                      <Icon name={tab.icon} className="h-[18px] w-[18px]" />
                    </span>
                    <span className="max-w-[5.5rem] truncate">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function notifLinkForRole(role: string): string {
  switch (role) {
    case "OWNER": return "/owner";
    case "PARTNER": return "/partner";
    case "BUSINESS": return "/business/dashboard";
    case "ADMIN":
    case "SUPER_ADMIN": return "/admin";
    default: return "/account/notifications";
  }
}
