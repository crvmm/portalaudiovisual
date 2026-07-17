"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateConversation } from "@/hooks/use-messages";
import { ChatThread } from "@/components/chat/chat-thread";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import { authModalLoginUrl, isAuthModalOpen } from "@/lib/auth/redirect";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { MessageSquare } from "lucide-react";

interface ConversationItem {
  id: string;
  title: string | null;
  updated_at: string;
  job_posting_id: string | null;
  service_id: string | null;
  otherParticipant: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  lastMessage: string | null;
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAuth } = useAuthModal();
  const authPromptedRef = useRef(false);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(
    searchParams.get("conversacion")
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<
    { id: string; display_name: string; avatar_url: string | null }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);

  const loadConversations = useCallback(async (uid: string) => {
    const supabase = createClient();

    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("profile_id", uid);

    if (!participations?.length) {
      setLoading(false);
      return;
    }

    const convIds = participations.map((p) => p.conversation_id);
    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .in("id", convIds)
      .order("updated_at", { ascending: false });

    const items: ConversationItem[] = [];

    for (const conv of convs ?? []) {
      const { data: parts } = await supabase
        .from("conversation_participants")
        .select("profile_id, profiles(id, display_name, avatar_url)")
        .eq("conversation_id", conv.id);

      const other = parts?.find((p) => {
        const prof = p.profiles as unknown as { id: string };
        return prof.id !== uid;
      });

      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const otherProfile = other?.profiles as unknown as {
        id: string;
        display_name: string;
        avatar_url: string | null;
      } | null;

      items.push({
        id: conv.id,
        title: conv.title,
        updated_at: conv.updated_at,
        job_posting_id: conv.job_posting_id,
        service_id: conv.service_id,
        otherParticipant: otherProfile,
        lastMessage: lastMsg?.content ?? null,
      });
    }

    setConversations(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (isAuthModalOpen(searchParams)) {
          authPromptedRef.current = true;
          setNeedsAuth(true);
          setLoading(false);
          return;
        }

        if (!authPromptedRef.current) {
          authPromptedRef.current = true;
          router.replace(authModalLoginUrl("/mensajes"));
          return;
        }

        setNeedsAuth(true);
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const contactar = searchParams.get("contactar");
      const oferta = searchParams.get("oferta");
      const servicio = searchParams.get("servicio");

      if (contactar) {
        const convId = await getOrCreateConversation(user.id, contactar, {
          jobPostingId: oferta ?? undefined,
          serviceId: servicio ?? undefined,
        });
        if (convId) {
          setActiveId(convId);
          router.replace(`/mensajes?conversacion=${convId}`);
        }
      }

      await loadConversations(user.id);
    }

    init();
  }, [router, searchParams, loadConversations]);

  useEffect(() => {
    if (!activeId) return;

    const supabase = createClient();
    supabase
      .from("conversation_participants")
      .select("profile_id, profiles(id, display_name, avatar_url)")
      .eq("conversation_id", activeId)
      .then(({ data }) => {
        setParticipants(
          (data ?? []).map((p) => {
            const prof = p.profiles as unknown as {
              id: string;
              display_name: string;
              avatar_url: string | null;
            };
            return prof;
          })
        );
      });
  }, [activeId]);

  if (loading) {
    return <p className="py-16 text-center text-muted-foreground">Cargando...</p>;
  }

  if (needsAuth) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">
          Inicia sesión para ver tus mensajes
        </p>
        <button
          type="button"
          onClick={() => openAuth({ mode: "login", redirect: "/mensajes" })}
          className="btn-primary-glow mt-4 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-[filter] hover:brightness-105"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold mb-6">Mensajes</h1>

      <div className="flex h-[calc(100vh-12rem)] rounded-xl border border-border overflow-hidden">
        {/* Conversation list */}
        <div className="w-full sm:w-80 border-r border-border overflow-y-auto shrink-0">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No tienes conversaciones todavía
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => {
                  setActiveId(conv.id);
                  router.push(`/mensajes?conversacion=${conv.id}`);
                }}
                className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-accent/50 ${
                  activeId === conv.id ? "bg-accent" : ""
                }`}
              >
                {conv.otherParticipant && (
                  <Avatar
                    src={conv.otherParticipant.avatar_url}
                    name={conv.otherParticipant.display_name}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {conv.title ?? conv.otherParticipant?.display_name ?? "Conversación"}
                  </p>
                  {conv.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.lastMessage}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatRelativeTime(conv.updated_at)}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Chat area */}
        <div className="hidden sm:flex flex-1 flex-col">
          {activeId && userId ? (
            <ChatThread
              conversationId={activeId}
              currentUserId={userId}
              participants={participants}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              Selecciona una conversación
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<p className="py-16 text-center text-muted-foreground">Cargando...</p>}>
      <MessagesContent />
    </Suspense>
  );
}
