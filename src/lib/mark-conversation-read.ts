import { createClient } from "@/lib/supabase/client";
import {
  applyLocalRead,
  syncLocalReadFromServer,
} from "@/lib/unread-read-state";
import { requestUnreadRefresh } from "@/hooks/use-unread-messages";

async function fetchLatestMessageAt(conversationId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("messages")
    .select("created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.created_at ?? null;
}

async function fetchParticipantReadAt(
  conversationId: string,
  userId: string
) {
  const supabase = createClient();
  const { data } = await supabase
    .from("conversation_participants")
    .select("last_read_at")
    .eq("conversation_id", conversationId)
    .eq("profile_id", userId)
    .maybeSingle();

  return data?.last_read_at ?? null;
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
  latestMessageAt?: string | null
) {
  const serverReadAt =
    latestMessageAt ?? (await fetchLatestMessageAt(conversationId));

  if (serverReadAt) {
    syncLocalReadFromServer(userId, conversationId, serverReadAt);
    requestUnreadRefresh();
  }

  const supabase = createClient();

  const { error: rpcError } = await supabase.rpc("mark_conversation_read", {
    p_conversation_id: conversationId,
  });

  if (!rpcError) {
    const readAt = await fetchParticipantReadAt(conversationId, userId);
    if (readAt) {
      syncLocalReadFromServer(userId, conversationId, readAt);
    }
    requestUnreadRefresh();
    return true;
  }

  if (serverReadAt) {
    const { data: updated, error: updateError } = await supabase
      .from("conversation_participants")
      .update({ last_read_at: serverReadAt })
      .eq("conversation_id", conversationId)
      .eq("profile_id", userId)
      .select("last_read_at")
      .maybeSingle();

    if (!updateError && updated?.last_read_at) {
      syncLocalReadFromServer(userId, conversationId, updated.last_read_at);
      requestUnreadRefresh();
      return true;
    }

    console.error("markConversationRead failed:", rpcError.message, updateError?.message);
    return false;
  }

  console.error("markConversationRead failed:", rpcError.message);
  return false;
}
