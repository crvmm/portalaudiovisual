import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types";

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages(data ?? []);
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    loadMessages();

    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, loadMessages]);

  return { messages, loading, reload: loadMessages };
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  attachment?: { url: string; type: string; name: string }
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content || null,
      attachment_url: attachment?.url ?? null,
      attachment_type: attachment?.type ?? null,
      attachment_name: attachment?.name ?? null,
    })
    .select()
    .single();

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return { data, error };
}

export async function getOrCreateConversation(
  currentUserId: string,
  otherUserId: string,
  options?: {
    jobPostingId?: string;
    serviceId?: string;
    title?: string;
  }
) {
  const supabase = createClient();

  const { data: existingParticipations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", currentUserId);

  if (existingParticipations) {
    for (const p of existingParticipations) {
      const { data: otherParticipant } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("conversation_id", p.conversation_id)
        .eq("profile_id", otherUserId)
        .maybeSingle();

      if (otherParticipant) {
        if (options?.jobPostingId || options?.serviceId) {
          const { data: conv } = await supabase
            .from("conversations")
            .select("job_posting_id, service_id")
            .eq("id", p.conversation_id)
            .single();

          if (
            conv &&
            (conv.job_posting_id === options.jobPostingId ||
              conv.service_id === options.serviceId)
          ) {
            return p.conversation_id;
          }
        } else {
          return p.conversation_id;
        }
      }
    }
  }

  const conversationType = options?.jobPostingId
    ? "job_related"
    : options?.serviceId
      ? "service_related"
      : "direct";

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      conversation_type: conversationType,
      job_posting_id: options?.jobPostingId ?? null,
      service_id: options?.serviceId ?? null,
      title: options?.title ?? null,
    })
    .select("id")
    .single();

  if (error || !conversation) return null;

  await supabase.from("conversation_participants").insert([
    { conversation_id: conversation.id, profile_id: currentUserId },
    { conversation_id: conversation.id, profile_id: otherUserId },
  ]);

  return conversation.id;
}
