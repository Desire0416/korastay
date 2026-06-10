"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { getOrCreateDirectConversation } from "@/server/actions/messaging";
import { toast } from "sonner";

interface ContactButtonProps {
  otherUserId: string;
  reservationId?: string;
  subject?: string;
  basePath: string; // ex: "/account/messages" ou "/owner/messages"
  label: string;
  variant?: ButtonProps["variant"];
  className?: string;
}

export function ContactButton({ otherUserId, reservationId, subject, basePath, label, variant = "outline", className }: ContactButtonProps) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  return (
    <Button
      variant={variant}
      className={className}
      loading={pending}
      onClick={() =>
        start(async () => {
          const res = await getOrCreateDirectConversation({ otherUserId, reservationId, subject });
          if (res.ok && res.id) router.push(`${basePath}/${res.id}`);
          else toast.error(res.error ?? "Impossible d'ouvrir la conversation.");
        })
      }
    >
      <MessageCircle className="h-4 w-4" /> {label}
    </Button>
  );
}
