"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Paperclip, Briefcase, Clapperboard } from "lucide-react";
import { useMessages, sendMessage, markConversationRead } from "@/hooks/use-messages";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
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
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Cargando mensajes...
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {otherParticipant && (
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={otherParticipant.avatar_url}
              name={otherParticipant.display_name}
            />
            <p className="font-medium">{otherParticipant.display_name}</p>
          </div>
          {jobPostingId && (
            <Link
              href={`/ofertas/${jobPostingId}`}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Briefcase className="h-3.5 w-3.5" />
              {jobTitle ? `Oferta: ${jobTitle}` : "Ver oferta relacionada"}
            </Link>
          )}
          {serviceId && (
            <Link
              href={`/servicios/${serviceId}`}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Clapperboard className="h-3.5 w-3.5" />
              Ver servicio relacionado
            </Link>
          )}
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className="flex-1 space-y-3 overflow-y-auto overscroll-y-contain p-4"
      >
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay mensajes todavía. ¡Empieza la conversación!
          </p>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.sender_id === currentUserId}
            senderName={
              participants.find((p) => p.id === msg.sender_id)?.display_name ?? ""
            }
          />
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-4">
        <label className="cursor-pointer rounded-lg p-2.5 text-muted-foreground hover:bg-accent">
          <input type="file" className="hidden" onChange={handleFileUpload} />
          <Paperclip className="h-5 w-5" />
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <Button type="submit" disabled={!text.trim() || sending} size="md">
          <Send className="h-4 w-4" />
        </Button>
      </form>
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
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
          isOwn
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-secondary"
        }`}
      >
        {!isOwn && message.is_system === false && (
          <p className="mb-1 text-xs font-medium opacity-70">{senderName}</p>
        )}
        {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
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
