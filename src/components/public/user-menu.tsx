"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { initials } from "@/lib/utils";
import { logoutAction } from "@/server/actions/auth";
import {
  ACCOUNT_NAV,
  OWNER_NAV,
  PARTNER_NAV,
  BUSINESS_NAV,
  ADMIN_NAV,
} from "@/lib/navigation";
import { ChevronDown, LogOut, Shield } from "lucide-react";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";
import type { SessionUser } from "@/lib/auth";

const ADMIN_ITEMS = ADMIN_NAV.flatMap((g) => g.items);

const ROLE_MENUS: Record<string, typeof ACCOUNT_NAV> = {
  TRAVELER: ACCOUNT_NAV.slice(0, 5),
  OWNER: OWNER_NAV.slice(0, 5),
  PARTNER: PARTNER_NAV.slice(0, 5),
  BUSINESS: BUSINESS_NAV,
  ADMIN: ADMIN_ITEMS.slice(1, 6),
  SUPER_ADMIN: ADMIN_ITEMS.slice(1, 6),
};

export function UserMenu({ user }: { user: SessionUser }) {
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const items = ROLE_MENUS[user.role] ?? ROLE_MENUS.TRAVELER;
  const dict = useI18n();
  const [, startLogout] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-ink/15 bg-surface py-1 pl-1 pr-3 shadow-soft transition-shadow hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
          <Avatar className="h-8 w-8">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback>{initials(user.firstName, user.lastName)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-semibold text-foreground sm:block">
            {user.firstName}
          </span>
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <div className="text-sm font-bold text-foreground">
            {user.firstName} {user.lastName}
          </div>
          <div className="truncate text-xs font-normal text-muted">{user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link href={localePath("/admin", dict.locale)}>
                <Shield className="h-4 w-4 text-terracotta" />
                {dict.header.admin}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={localePath(item.href, dict.locale)}>
              <Icon name={item.icon} className="h-4 w-4 text-muted" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            startLogout(() => {
              void logoutAction();
            });
          }}
          className="text-danger focus:bg-red-50 focus:text-danger"
        >
          <LogOut className="h-4 w-4" />
          {dict.header.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
