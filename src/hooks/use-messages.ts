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
): Promise<string | null> {
  if (currentUserId === otherUserId) return null;

  const supabase = createClient();

  const { data, error } = await supabase.rpc("find_or_create_conversation", {
    p_other_user_id: otherUserId,
    p_job_posting_id: options?.jobPostingId ?? null,
    p_service_id: options?.serviceId ?? null,
    p_title: options?.title ?? null,
  });

  if (error) {
    console.error("find_or_create_conversation failed:", error.message);
    return null;
  }

  return typeof data === "string" ? data : null;
}
