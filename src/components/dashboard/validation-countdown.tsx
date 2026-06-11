"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { expireStaleReservations } from "@/server/actions/reservations";
import { cn } from "@/lib/utils";

// Compte a rebours visuel pour la validation d'une demande de reservation.
// La barre diminue ; a 0, la demande est expiree (annulee) et la page rafraichie.
export function ValidationCountdown({ deadline, startedAt }: { deadline: string; startedAt: string }) {
  const router = useRouter();
  const end = React.useMemo(() => new Date(deadline).getTime(), [deadline]);
  const start = React.useMemo(() => new Date(startedAt).getTime(), [startedAt]);
  const total = Math.max(1, end - start);

  const [now, setNow] = React.useState(() => Date.now());
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = end - now;
  const expired = remaining <= 0;
  const pct = Math.max(0, Math.min(100, (remaining / total) * 100));

  React.useEffect(() => {
    if (expired && !firedRef.current) {
      firedRef.current = true;
      void (async () => {
        await expireStaleReservations();
        router.refresh();
      })();
    }
  }, [expired, router]);

  function label() {
    if (expired) return "Delai expire";
    const s = Math.floor(remaining / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (d > 0) return `${d}j ${h}h ${m}min`;
    if (h > 0) return `${h}h ${String(m).padStart(2, "0")}min`;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  const barColor = pct < 20 ? "bg-danger" : pct < 45 ? "bg-gold-500" : "bg-brand-500";
  const textColor = pct < 20 ? "text-danger" : pct < 45 ? "text-gold-700" : "text-brand-700";

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Clock className="h-4 w-4 text-muted" /> Temps restant pour validation
        </span>
        <span className={cn("text-sm font-extrabold tabular-nums", textColor)}>{label()}</span>
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-soft">
        <div className={cn("h-full rounded-full transition-all duration-1000 ease-linear", barColor)} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted">
        {expired
          ? "Sans validation a temps, la demande est annulee automatiquement."
          : "Votre demande sera annulee automatiquement si elle n'est pas validee a temps."}
      </p>
    </div>
  );
}
