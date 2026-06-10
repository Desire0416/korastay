"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Bell, PanelLeftClose, PanelLeft, ExternalLink } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Icon } from "@/components/ui/icon";
import { UserMenu } from "@/components/public/user-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/navigation";
import type { SessionUser } from "@/lib/auth";

interface NavGroup {
  group: string;
  items: NavItem[];
}

interface ConnectedShellProps {
  user: SessionUser;
  spaceLabel: string;
  items?: NavItem[];
  groups?: NavGroup[];
  notifCount?: number;
  children: React.ReactNode;
}

export function ConnectedShell({
  user,
  spaceLabel,
  items,
  groups,
  notifCount = 0,
  children,
}: ConnectedShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navGroups: NavGroup[] = groups ?? [{ group: "", items: items ?? [] }];
  const flatItems = navGroups.flatMap((g) => g.items);
  const mobileTabs = flatItems.slice(0, 4);

  function isActive(href: string) {
    const base = href.split("?")[0];
    if (pathname === base) return true;
    // active si sous-route, mais pas pour les racines courtes type "/owner"
    const segments = base.split("/").filter(Boolean);
    if (segments.length >= 2) return pathname.startsWith(base + "/") || pathname === base;
    return pathname === base;
  }

  const sidebarNav = (onNavigate?: () => void) => (
    <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {navGroups.map((group, gi) => (
        <div key={gi}>
          {group.group && !collapsed && (
            <p className="px-3 pb-1.5 text-2xs font-bold uppercase tracking-wider text-muted">
              {group.group}
            </p>
          )}
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-500 text-white shadow-soft"
                      : "text-foreground/80 hover:bg-surface-soft hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-background">
      {/* Sidebar desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-surface transition-all duration-300 lg:flex",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        <div className={cn("flex h-[var(--header-h)] items-center border-b border-border px-4", collapsed && "justify-center px-2")}>
          {collapsed ? <Logo withText={false} /> : <Logo />}
        </div>
        {sidebarNav()}
        <div className="border-t border-border p-3">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-soft"
          >
            {collapsed ? <PanelLeft className="h-[18px] w-[18px]" /> : <><PanelLeftClose className="h-[18px] w-[18px]" /> Reduire</>}
          </button>
        </div>
      </aside>

      {/* Zone principale */}
      <div className={cn("flex min-h-dvh flex-col transition-all duration-300", collapsed ? "lg:pl-[76px]" : "lg:pl-64")}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-[var(--header-h)] items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            {/* Menu mobile */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button aria-label="Menu" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface lg:hidden">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-[var(--header-h)] shrink-0 items-center border-b border-border px-5"><Logo /></div>
                <div className="flex min-h-0 flex-1 flex-col">
                  {sidebarNav(() => setMobileOpen(false))}
                </div>
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{spaceLabel}</p>
              <p className="hidden text-sm font-medium text-muted sm:block">
                Bonjour {user.firstName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted transition-colors hover:bg-surface-soft sm:flex"
            >
              <ExternalLink className="h-4 w-4" /> Site public
            </Link>
            <Link
              href={notifLinkForRole(user.role)}
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-soft"
            >
              <Bell className="h-5 w-5" />
              {notifCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-2xs font-bold text-white">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </Link>
            <UserMenu user={user} />
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 px-4 py-6 pb-24 lg:px-6 lg:pb-8">{children}</main>

        {/* Tabs mobile */}
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur lg:hidden">
          <ul className="flex h-[var(--bottom-nav-h)] items-stretch justify-around">
            {mobileTabs.map((tab) => {
              const active = isActive(tab.href);
              return (
                <li key={tab.href} className="flex-1">
                  <Link href={tab.href} className={cn("flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium", active ? "text-brand-600" : "text-muted")}>
                    <span className={cn("flex h-7 w-12 items-center justify-center rounded-full", active && "bg-brand-50")}>
                      <Icon name={tab.icon} className="h-[18px] w-[18px]" />
                    </span>
                    {tab.label.split(" ")[0]}
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
