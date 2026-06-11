"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell, Check, CalendarCheck, MessageCircle, Home, Handshake,
  ShieldCheck, Star, XCircle, type LucideIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { relativeTime, cn } from "@/lib/utils";

type Notif = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  url: string | null;
  read: boolean;
  createdAt: string;
};

const ICONS: Record<string, LucideIcon> = {
  NEW_MESSAGE: MessageCircle,
  RESERVATION_REQUEST: CalendarCheck,
  RESERVATION_APPROVED: Check,
  RESERVATION_CONFIRMED: CalendarCheck,
  RESERVATION_CANCELLED: XCircle,
  OWNER_BOOKING: Home,
  PARTNER_MISSION: Handshake,
  ADMIN_VALIDATION: ShieldCheck,
  CHECKIN_REMINDER: CalendarCheck,
  REVIEW_INVITE: Star,
};

export function NotificationBell({ initialUnread, allHref }: { initialUnread: number; allHref: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<Notif[]>([]);
  const [unread, setUnread] = React.useState(initialUnread);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const d = (await res.json()) as { unread: number; notifications: Notif[] };
        setItems(d.notifications);
        setUnread(d.unread);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) void load();
  }, [open, load]);

  async function markAll() {
    setItems((p) => p.map((n) => ({ ...n, read: true })));
    setUnread(0);
    await fetch("/api/notifications", { method: "POST", body: JSON.stringify({}) }).catch(() => {});
    router.refresh();
  }

  async function onItem(n: Notif) {
    setOpen(false);
    if (!n.read) {
      setUnread((u) => Math.max(0, u - 1));
      await fetch("/api/notifications", { method: "POST", body: JSON.stringify({ id: n.id }) }).catch(() => {});
    }
    if (n.url) router.push(n.url);
    router.refresh();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-soft"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-2xs font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] max-w-[92vw] overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="font-bold text-foreground">Notifications</p>
          {unread > 0 && (
            <button onClick={markAll} className="text-xs font-semibold text-brand-600 hover:underline">
              Tout marquer lu
            </button>
          )}
        </div>

        <div className="max-h-[min(60vh,420px)] overflow-y-auto">
          {loading && items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">Chargement...</p>
          ) : items.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="mx-auto h-8 w-8 text-border" />
              <p className="mt-2 text-sm text-muted">Aucune notification pour le moment.</p>
            </div>
          ) : (
            items.map((n) => {
              const Icon = ICONS[n.type] ?? Bell;
              return (
                <button
                  key={n.id}
                  onClick={() => onItem(n)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-surface-soft",
                    !n.read && "bg-brand-50/40"
                  )}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-snug text-foreground">{n.title}</span>
                    {n.body && <span className="mt-0.5 block line-clamp-2 text-xs text-muted">{n.body}</span>}
                    <span className="mt-0.5 block text-2xs text-muted">{relativeTime(n.createdAt)}</span>
                  </span>
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                </button>
              );
            })
          )}
        </div>

        <Link
          href={allHref}
          onClick={() => setOpen(false)}
          className="block border-t border-border px-4 py-3 text-center text-sm font-semibold text-brand-600 hover:bg-surface-soft"
        >
          Voir toutes les notifications
        </Link>
      </PopoverContent>
    </Popover>
  );
}
