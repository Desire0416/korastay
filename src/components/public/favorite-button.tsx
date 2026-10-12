"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleFavorite } from "@/server/actions/favorites";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n";

interface FavoriteButtonProps {
  residenceId?: string;
  packId?: string;
  initialFavorited?: boolean;
  className?: string;
  variant?: "floating" | "inline";
}

export function FavoriteButton({
  residenceId,
  packId,
  initialFavorited = false,
  className,
  variant = "floating",
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = React.useState(initialFavorited);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();
  const dict = useI18n();

  React.useEffect(() => setFavorited(initialFavorited), [initialFavorited]);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;
    const next = !favorited;
    setFavorited(next); // mise a jour optimiste

    startTransition(async () => {
      const res = await toggleFavorite({ residenceId, packId });
      if (!res.ok) {
        setFavorited(!next); // rollback
        if (res.error?.includes("Connectez")) {
          toast.error(res.error, {
            action: { label: dict.common.login, onClick: () => router.push(localePath("/login", dict.locale)) },
          });
        } else {
          toast.error(res.error ?? dict.common.genericError);
        }
      } else {
        setFavorited(!!res.favorited);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={favorited ? dict.common.removeFavorite : dict.common.addFavorite}
      aria-pressed={favorited}
      className={cn(
        "group/fav inline-flex items-center justify-center transition-transform active:scale-90",
        variant === "floating" &&
          "h-9 w-9 rounded-full bg-white/90 text-ink shadow-soft ring-1 ring-black/5 backdrop-blur hover:bg-white",
        variant === "inline" &&
          "h-10 w-10 rounded-full border border-border bg-surface hover:border-brand-300",
        className
      )}
    >
      <Heart
        className={cn(
          "h-[18px] w-[18px] transition-all duration-200",
          favorited
            ? "scale-110 fill-danger text-danger"
            : "text-ink group-hover/fav:text-danger"
        )}
      />
    </button>
  );
}
