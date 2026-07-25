"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { isMessageRead, mergeLastRead, syncLocalReadFromServer } from "@/lib/unread-read-state";

type UnreadMessagesContextValue = {
  unreadCount: number;
  unreadByConversation: Record<string, number>;
  refresh: () => Promise<void>;
  clearConversationUnread: (conversationId: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
};

const UnreadMessagesContext = createContext<UnreadMessagesContextValue | null>(
  null
);

const unreadRefreshListeners = new Set<() => void>();
const activeConversationIdRef = { current: null as string | null };

function sameUser(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

function dedupeMessages<T extends { id: string }>(messages: T[]): T[] {
  return Array.from(new Map(messages.map((msg) => [msg.id, msg])).values());
}

function countUnreadMessages(
  messages: Array<{
    id: string;
    conversation_id: string;
    sender_id: string;
    created_at: string;
  }>,
  lastReadByConv: Record<string, string | null>,
  userId: string,
  activeConversationId: string | null
) {
  const uniqueMessages = dedupeMessages(messages);
  const latestByConv = new Map<
    string,
    (typeof uniqueMessages)[number]
  >();

  for (const msg of uniqueMessages) {
    const existing = latestByConv.get(msg.conversation_id);
    if (
      !existing ||
      new Date(msg.created_at) > new Date(existing.created_at)
    ) {
      latestByConv.set(msg.conversation_id, msg);
    }
  }

  const counts: Record<string, number> = {};
  let total = 0;

  for (const [convId, latest] of latestByConv) {
    if (convId === activeConversationId) continue;
    if (sameUser(latest.sender_id, userId)) continue;

    let hasUnread = false;

    for (const msg of uniqueMessages) {
      if (msg.conversation_id !== convId) continue;
      if (sameUser(msg.sender_id, userId)) continue;

      const lastRead = lastReadByConv[convId] ?? null;
      if (isMessageRead(msg.created_at, lastRead)) continue;

      hasUnread = true;
      break;
    }

    if (hasUnread) {
      counts[convId] = 1;
      total += 1;
    }
  }

  return { counts, total };
}

let unreadRealtimeChannel: RealtimeChannel | null = null;
let unreadRealtimeSubscribers = 0;

function ensureUnreadRealtimeSubscription() {
  if (unreadRealtimeChannel || !isSupabaseConfigured()) return;

  const supabase = createClient();
  const onChange = () => {
    requestUnreadRefresh();
  };

  unreadRealtimeChannel = supabase
    .channel(`unread-messages:${Date.now()}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      onChange
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "conversations" },
      onChange
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "conversation_participants",
      },
      onChange
    )
    .subscribe();
}

function subscribeToUnreadRealtime() {
  unreadRealtimeSubscribers += 1;
  ensureUnreadRealtimeSubscription();

  return () => {
    unreadRealtimeSubscribers -= 1;

    if (unreadRealtimeSubscribers <= 0 && unreadRealtimeChannel) {
      const supabase = createClient();
      void supabase.removeChannel(unreadRealtimeChannel);
      unreadRealtimeChannel = null;
      unreadRealtimeSubscribers = 0;
    }
  };
}

export function requestUnreadRefresh() {
  unreadRefreshListeners.forEach((listener) => listener());
}

export function UnreadMessagesProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadByConversation, setUnreadByConversation] = useState<
    Record<string, number>
  >({});

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUnreadCount(0);
      setUnreadByConversation({});
      return;
    }

    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id, last_read_at")
      .eq("profile_id", user.id);

    if (!participations?.length) {
      setUnreadCount(0);
      setUnreadByConversation({});
      return;
    }

    for (const p of participations) {
      if (p.last_read_at) {
        syncLocalReadFromServer(user.id, p.conversation_id, p.last_read_at);
      }
    }

    const activeConversationId = activeConversationIdRef.current;

    const { data: summary, error: summaryError } = await supabase.rpc(
      "get_unread_message_summary"
    );

    if (!summaryError && summary) {
      const counts: Record<string, number> = {};

      for (const row of summary) {
        if (row.conversation_id === activeConversationId) continue;
        counts[row.conversation_id] = row.unread_count;
      }

      const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
      setUnreadByConversation(counts);
      setUnreadCount(total);
      return;
    }

    const lastReadByConv = Object.fromEntries(
      participations.map((p) => [
        p.conversation_id,
        mergeLastRead(user.id, p.conversation_id, p.last_read_at),
      ])
    );
    const convIds = participations.map((p) => p.conversation_id);

    const { data: messages } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, created_at")
      .in("conversation_id", convIds);

    const { counts, total } = countUnreadMessages(
      messages ?? [],
      lastReadByConv,
      user.id,
      activeConversationIdRef.current
    );

    setUnreadByConversation(counts);
    setUnreadCount(total);
  }, []);

  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  const clearConversationUnread = useCallback((conversationId: string) => {
    setUnreadByConversation((prev) => {
      const removed = prev[conversationId] ?? 0;
      if (removed === 0) return prev;

      const next = { ...prev };
      delete next[conversationId];
      setUnreadCount((count) => Math.max(0, count - removed));
      return next;
    });
  }, []);

  useEffect(() => {
    const listener = () => {
      void refreshRef.current();
    };

    unreadRefreshListeners.add(listener);
    return () => {
      unreadRefreshListeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    void refreshRef.current();

    const unsubscribeRealtime = subscribeToUnreadRealtime();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshRef.current();
      }
    };

    const onFocus = () => {
      void refreshRef.current();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshRef.current();
    });

    const pollId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshRef.current();
      }
    }, 30000);

    return () => {
      unsubscribeRealtime();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      subscription.unsubscribe();
      window.clearInterval(pollId);
    };
  }, []);

  const setActiveConversation = useCallback((conversationId: string | null) => {
    activeConversationIdRef.current = conversationId;
    requestUnreadRefresh();
  }, []);

  const value = useMemo(
    () => ({
      unreadCount,
      unreadByConversation,
      refresh,
      clearConversationUnread,
      setActiveConversation,
    }),
    [
      unreadCount,
      unreadByConversation,
      refresh,
      clearConversationUnread,
      setActiveConversation,
    ]
  );

  return (
    <UnreadMessagesContext.Provider value={value}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext);
  if (!context) {
    throw new Error(
      "useUnreadMessages must be used within UnreadMessagesProvider"
    );
  }
  return context;
}
