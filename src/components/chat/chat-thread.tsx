"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  Paperclip,
  Briefcase,
  Clapperboard,
  CalendarDays,
  MapPin,
  MessageSquareText,
} from "lucide-react";
import { useMessages, sendMessage, markConversationRead } from "@/hooks/use-messages";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  parseServiceRequestMessage,
  type ParsedServiceRequest,
} from "@/lib/service-request-message";
import type { Message } from "@/types";

interface ChatThreadProps {
  conversationId: string;
  currentUserId: string;
  participants: { id: string; display_name: string; avatar_url: string | null }[];
  jobPostingId?: string | null;
  jobTitle?: string | null;
  serviceId?: string | null;
  onMessageSent?: () => void;
}

export function ChatThread({
  conversationId,
  currentUserId,
  participants,
  jobPostingId,
  jobTitle,
  serviceId,
  onMessageSent,
}: ChatThreadProps) {
  const { messages, loading } = useMessages(conversationId);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const otherParticipant = participants.find((p) => p.id !== currentUserId);

  useEffect(() => {
    if (messages.length === 0) return;

    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) return;

    const latestMessageAt = messages[messages.length - 1]?.created_at ?? null;
    void markConversationRead(conversationId, currentUserId, latestMessageAt);
  }, [conversationId, currentUserId, messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    await sendMessage(conversationId, currentUserId, text.trim());
    setText("");
    setSending(false);
    onMessageSent?.();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const supabase = createClient();
    const path = `${conversationId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-attachments")
      .upload(path, file);

    if (uploadError) return;

    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-attachments").getPublicUrl(path);

    await sendMessage(conversationId, currentUserId, "", {
      url: publicUrl,
      type: file.type,
      name: file.name,
    });
    onMessageSent?.();
  }

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-muted-foreground">
        Cargando mensajes...
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {otherParticipant && (
        <div className="shrink-0 border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <Avatar
              src={otherParticipant.avatar_url}
              name={otherParticipant.display_name}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {otherParticipant.display_name}
              </p>
              {(jobPostingId || serviceId) && (
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                  {jobPostingId && (
                    <Link
                      href={`/ofertas/${jobPostingId}`}
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      <Briefcase className="h-3 w-3" />
                      {jobTitle ? `Oferta: ${jobTitle}` : "Ver oferta"}
                    </Link>
                  )}
                  {serviceId && (
                    <Link
                      href={`/servicios/${serviceId}`}
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      <Clapperboard className="h-3 w-3" />
                      Ver servicio
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain px-4 py-3"
      >
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay mensajes todavía. Empieza la conversación.
          </p>
        )}
        {messages.map((msg) => {
          const request = parseServiceRequestMessage(msg.content);
          if (request) {
            return (
              <ServiceRequestCard
                key={msg.id}
                request={request}
                isOwn={msg.sender_id === currentUserId}
                senderName={
                  participants.find((p) => p.id === msg.sender_id)?.display_name ??
                  ""
                }
                createdAt={msg.created_at}
                serviceId={serviceId}
              />
            );
          }

          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === currentUserId}
              senderName={
                participants.find((p) => p.id === msg.sender_id)?.display_name ??
                ""
              }
            />
          );
        })}
      </div>

      <form
        onSubmit={handleSend}
        className="flex shrink-0 items-center gap-2 border-t border-border bg-card px-3 py-2.5"
      >
        <label className="cursor-pointer rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <input type="file" className="hidden" onChange={handleFileUpload} />
          <Paperclip className="h-4 w-4" />
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-ring"
        />
        <Button type="submit" disabled={!text.trim() || sending} size="sm">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function ServiceRequestCard({
  request,
  isOwn,
  senderName,
  createdAt,
  serviceId,
}: {
  request: ParsedServiceRequest;
  isOwn: boolean;
  senderName: string;
  createdAt: string;
  serviceId?: string | null;
}) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <article className="w-full max-w-[min(100%,22rem)] overflow-hidden rounded-md border border-border bg-surface shadow-[0_1px_0_oklch(0.26_0.04_290/0.04)]">
        <header className="flex items-center justify-between gap-2 border-b border-border bg-card px-3.5 py-2">
          <p className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.14em] text-stage">
            Solicitud de servicio
          </p>
          <time className="text-[10px] text-muted-foreground">
            {formatTime(createdAt)}
          </time>
        </header>

        <div className="space-y-3 px-3.5 py-3">
          {!isOwn && senderName && (
            <p className="text-xs text-muted-foreground">
              De <span className="font-medium text-foreground">{senderName}</span>
            </p>
          )}

          <div>
            <p className="text-sm font-semibold leading-snug text-foreground">
              {request.title}
            </p>
            {serviceId && (
              <Link
                href={`/servicios/${serviceId}`}
                className="mt-1 inline-block text-[11px] text-primary hover:underline"
              >
                Ver ficha del servicio
              </Link>
            )}
          </div>

          <dl className="space-y-2.5">
            <div className="flex gap-2.5">
              <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <dt className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  Fechas
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">{request.dates}</dd>
              </div>
            </div>

            {request.location && (
              <div className="flex gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <dt className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Ubicación
                  </dt>
                  <dd className="mt-0.5 text-sm text-foreground">{request.location}</dd>
                </div>
              </div>
            )}

            {request.comments && (
              <div className="flex gap-2.5">
                <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <dt className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Comentarios
                  </dt>
                  <dd className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {request.comments}
                  </dd>
                </div>
              </div>
            )}
          </dl>
        </div>
      </article>
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
  senderName,
}: {
  message: Message;
  isOwn: boolean;
  senderName: string;
}) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[min(75%,20rem)] rounded-2xl px-3.5 py-2 text-sm ${
          isOwn
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-secondary"
        }`}
      >
        {!isOwn && !message.is_system && (
          <p className="mb-0.5 text-xs font-medium opacity-70">{senderName}</p>
        )}
        {message.content && (
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        )}
        {message.attachment_url && (
          <a
            href={message.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-xs underline opacity-80"
          >
            {message.attachment_name ?? "Archivo adjunto"}
          </a>
        )}
        {message.link_url && (
          <a
            href={message.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-xs underline"
          >
            {message.link_url}
          </a>
        )}
        <p
          className={`mt-1 text-[10px] ${
            isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
          }`}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}
