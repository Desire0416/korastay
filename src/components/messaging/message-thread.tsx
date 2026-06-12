"use client";

import * as React from "react";
import { Send, Lock, Loader2, Paperclip, FileText, X, Wifi } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, initials, relativeTime } from "@/lib/utils";
import { sendMessage, type MessageAttachment } from "@/server/actions/messaging";
import { toast } from "sonner";

export interface ThreadMessage {
  id: string;
  body: string;
  isInternal: boolean;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string; role: string };
  pending?: boolean;
}

interface MessageThreadProps {
  conversationId: string;
  messages: ThreadMessage[];
  currentUserId: string;
  canInternalNote?: boolean;
}

const POLL_MS = 5000;

export function MessageThread({ conversationId, messages: initial, currentUserId, canInternalNote }: MessageThreadProps) {
  const [messages, setMessages] = React.useState<ThreadMessage[]>(initial);
  const [body, setBody] = React.useState("");
  const [internal, setInternal] = React.useState(false);
  const [attachment, setAttachment] = React.useState<MessageAttachment | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [pending, start] = React.useTransition();
  const [live, setLive] = React.useState(true);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const endRef = React.useRef<HTMLDivElement>(null);
  const atBottomRef = React.useRef(true);
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Re-synchronise si le serveur fournit une nouvelle liste initiale (navigation).
  React.useEffect(() => { setMessages(initial); }, [initial]);

  // Auto-scroll uniquement si l'utilisateur est deja en bas du fil.
  React.useEffect(() => {
    if (atBottomRef.current) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, { cache: "no-store" });
      if (!res.ok) { setLive(false); return; }
      const data = (await res.json()) as { messages: ThreadMessage[] };
      setLive(true);
      setMessages((prev) => {
        const optimistic = prev.filter((m) => m.pending);
        const serverIds = new Set(data.messages.map((m) => m.id));
        // Conserve les messages optimistes pas encore confirmes par le serveur.
        const stillPending = optimistic.filter((m) => !serverIds.has(m.id));
        return [...data.messages, ...stillPending];
      });
    } catch {
      setLive(false);
    }
  }, [conversationId]);

  // Polling temps reel (suspendu quand l'onglet est masque).
  React.useEffect(() => {
    const tick = () => { if (document.visibilityState === "visible") void refresh(); };
    const timer = setInterval(tick, POLL_MS);
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [refresh]);

  async function pickFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "doc");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) setAttachment({ url: data.url, name: data.name ?? file.name, type: data.type ?? file.type });
      else toast.error(data.error ?? "Échec de l'envoi du fichier.");
    } catch {
      toast.error("Échec de l'envoi du fichier.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = body.trim();
    if ((!text && !attachment) || pending || uploading) return;
    const isInternal = internal;
    const att = attachment;

    const optimistic: ThreadMessage = {
      id: `temp-${Date.now()}`,
      body: text,
      isInternal,
      attachmentUrl: att?.url ?? null,
      attachmentName: att?.name ?? null,
      attachmentType: att?.type ?? null,
      createdAt: new Date().toISOString(),
      sender: { id: currentUserId, firstName: "", lastName: "", role: "" },
      pending: true,
    };
    atBottomRef.current = true;
    setMessages((prev) => [...prev, optimistic]);
    setBody("");
    setAttachment(null);

    start(async () => {
      const res = await sendMessage(conversationId, text, isInternal, att);
      if (!res.ok) {
        toast.error(res.error ?? "Erreur.");
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setBody(text);
        setAttachment(att);
      } else {
        await refresh();
      }
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">Aucun message. Ecrivez le premier ci-dessous.</p>
        )}
        {messages.map((m) => {
          const mine = m.sender.id === currentUserId;
          return (
            <div key={m.id} className={cn("flex items-end gap-2", mine ? "flex-row-reverse" : "flex-row")}>
              {!mine && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-2xs">{initials(m.sender.firstName, m.sender.lastName)}</AvatarFallback>
                </Avatar>
              )}
              <div className={cn("max-w-[78%]")}>
                {!mine && (
                  <p className="mb-0.5 px-1 text-2xs font-semibold text-muted">{m.sender.firstName} {m.sender.lastName}</p>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    m.isInternal
                      ? "border border-gold-300 bg-gold-50 text-gold-800"
                      : mine
                        ? "bg-brand-500 text-white"
                        : "bg-surface-soft text-foreground",
                    m.pending && "opacity-70"
                  )}
                >
                  {m.isInternal && (
                    <span className="mb-1 flex items-center gap-1 text-2xs font-bold uppercase tracking-wide">
                      <Lock className="h-3 w-3" /> Note interne
                    </span>
                  )}
                  {m.attachmentUrl && <Attachment url={m.attachmentUrl} name={m.attachmentName} type={m.attachmentType} mine={mine && !m.isInternal} />}
                  {m.body && <p className={cn("whitespace-pre-wrap", m.attachmentUrl && "mt-2")}>{m.body}</p>}
                </div>
                <p className={cn("mt-0.5 px-1 text-2xs text-muted", mine && "text-right")}>
                  {m.pending ? "Envoi..." : relativeTime(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <form onSubmit={submit} className="border-t border-border bg-surface p-3">
        {canInternalNote && (
          <label className="mb-2 flex w-fit items-center gap-2 rounded-full bg-surface-soft px-3 py-1 text-xs font-medium text-foreground">
            <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} className="h-3.5 w-3.5 rounded border-border text-gold-600" />
            <Lock className="h-3 w-3 text-gold-600" /> Note interne (invisible pour le client)
          </label>
        )}

        {attachment && (
          <div className="mb-2 flex items-center gap-2 rounded-2xl border border-border bg-surface-soft px-3 py-2 text-xs">
            {attachment.type.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={attachment.url} alt="" className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <FileText className="h-5 w-5 text-brand-600" />
            )}
            <span className="max-w-[200px] truncate font-medium text-foreground">{attachment.name}</span>
            <button type="button" onClick={() => setAttachment(null)} className="ml-auto rounded-full p-1 text-muted hover:bg-surface hover:text-danger" aria-label="Retirer la pièce jointe">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || pending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-brand-300 hover:text-brand-600 disabled:opacity-40"
            aria-label="Joindre un fichier"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
          </button>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder={internal ? "Note interne pour l'équipe..." : "Ecrire un message..."}
            rows={1}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-sm focus-visible:border-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
          />
          <button
            type="submit"
            disabled={pending || uploading || (!body.trim() && !attachment)}
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition-colors disabled:opacity-40",
              internal ? "bg-gold-600 hover:bg-gold-700" : "bg-brand-500 hover:bg-brand-600"
            )}
            aria-label="Envoyer"
          >
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
        {!live && (
          <p className="mt-2 flex items-center gap-1 px-1 text-2xs text-muted">
            <Wifi className="h-3 w-3" /> Reconnexion en cours...
          </p>
        )}
      </form>
    </div>
  );
}

function Attachment({ url, name, type, mine }: { url: string; name?: string | null; type?: string | null; mine?: boolean }) {
  const isImage = (type ?? "").startsWith("image/");
  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name ?? "Pièce jointe"} className="max-h-56 w-auto max-w-full rounded-xl object-cover" />
      </a>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        mine ? "bg-white/15 text-white hover:bg-white/25" : "bg-surface text-foreground hover:bg-surface-soft"
      )}
    >
      <FileText className="h-5 w-5 shrink-0" />
      <span className="max-w-[200px] truncate">{name ?? "Document"}</span>
    </a>
  );
}
