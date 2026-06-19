"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, ChevronRight, LogOut, Shield } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  PUBLIC_NAV,
  ACCOUNT_NAV,
  OWNER_NAV,
  PARTNER_NAV,
  BUSINESS_NAV,
  ADMIN_NAV,
} from "@/lib/navigation";
import { logoutAction } from "@/server/actions/auth";
import { initials, cn } from "@/lib/utils";
import { navLabel, localePath, switchLocalePath, LOCALES, LOCALE_LABELS, type Locale, type Dictionary } from "@/lib/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SessionUser } from "@/lib/auth";

const ROLE_NAV: Record<string, typeof ACCOUNT_NAV> = {
  TRAVELER: ACCOUNT_NAV,
  OWNER: OWNER_NAV,
  PARTNER: PARTNER_NAV,
  BUSINESS: BUSINESS_NAV,
};

export function MobileNavSheet({ user, locale, currentPath, dict }: { user: SessionUser | null; locale: Locale; currentPath: string; dict: Dictionary }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [, startLang] = React.useTransition();
  const roleNav = user ? ROLE_NAV[user.role] : null;
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  function chooseLang(next: Locale) {
    if (next === locale) return;
    setOpen(false);
    startLang(() => { router.push(switchLocalePath(currentPath, next)); });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Ouvrir le menu"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-soft md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col p-0">
        <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
        <div className="border-b border-border px-4 py-3.5">
          <Logo />
        </div>

        <div className="flex-1 overflow-y-auto p-2.5">
          {user && (
            <Link
              href={localePath(isAdmin ? "/admin" : roleNav ? roleNav[0].href : "/account", locale)}
              onClick={() => setOpen(false)}
              className="mb-2 flex items-center gap-2.5 rounded-2xl bg-surface-soft p-2.5 transition-colors active:bg-border"
            >
              <Avatar className="h-9 w-9">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                <AvatarFallback className="text-xs">{initials(user.firstName, user.lastName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-[11px] text-muted">{user.email}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
            </Link>
          )}

          <nav className="space-y-0.5">
            {PUBLIC_NAV.map((item) => (
              <SheetClose key={item.href} asChild>
                <Link
                  href={localePath(item.href, locale)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[14px] font-semibold text-foreground transition-colors hover:bg-surface-soft"
                >
                  {navLabel(dict, item.href, item.label)}
                  <ChevronRight className="h-4 w-4 text-muted" />
                </Link>
              </SheetClose>
            ))}
          </nav>

          {/* Espace administrateur : menu de gestion complet (groupe) */}
          {isAdmin && (
            <>
              <p className="flex items-center gap-1.5 px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wide text-danger">
                <Shield className="h-3.5 w-3.5" /> Administration
              </p>
              {ADMIN_NAV.map((group) => (
                <div key={group.group} className="mt-2">
                  <p className="px-3 pb-1 text-2xs font-bold uppercase tracking-wider text-muted">
                    {group.group}
                  </p>
                  <nav className="space-y-0.5">
                    {group.items.map((item) => (
                      <SheetClose key={item.href} asChild>
                        <Link
                          href={localePath(item.href, locale)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-medium text-foreground transition-colors hover:bg-surface-soft"
                        >
                          <Icon name={item.icon} className="h-4 w-4 text-muted" />
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </div>
              ))}
            </>
          )}

          {/* Autres roles connectes : leur espace dedie */}
          {!isAdmin && roleNav && (
            <>
              <p className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wide text-muted">
                Mon espace
              </p>
              <nav className="space-y-0.5">
                {roleNav.map((item) => (
                  <SheetClose key={item.href} asChild>
                    <Link
                      href={localePath(item.href, locale)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-medium text-foreground transition-colors hover:bg-surface-soft"
                    >
                      <Icon name={item.icon} className="h-4 w-4 text-muted" />
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </>
          )}
        </div>

        <div className="border-t border-border p-4">
          {/* Selecteur de langue */}
          <div className="mb-3 flex items-center gap-1 rounded-2xl bg-surface-soft p-1">
            {LOCALES.map((l) => (
              <button
                key={l}
                onClick={() => chooseLang(l)}
                className={cn(
                  "flex-1 rounded-xl py-2 text-sm font-semibold transition-colors",
                  l === locale ? "bg-surface text-foreground shadow-soft" : "text-muted hover:text-foreground"
                )}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>

          {user ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setOpen(false);
                React.startTransition(() => {
                  void logoutAction();
                });
              }}
            >
              <LogOut className="h-4 w-4" />
              {dict.header.logout}
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <SheetClose asChild>
                <Button asChild variant="outline">
                  <Link href={localePath("/login", locale)}>{dict.header.login}</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild>
                  <Link href={localePath("/register", locale)}>{dict.header.register}</Link>
                </Button>
              </SheetClose>
            </div>
          )}
          <SheetClose asChild>
            <Link
              href={localePath("/devenir-proprietaire", locale)}
              className="mt-3 block text-center text-sm font-semibold text-brand-600"
            >
              {dict.header.becomeHost} &rarr;
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
