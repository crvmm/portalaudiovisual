"use client";

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateConversation, markConversationRead } from "@/hooks/use-messages";
import { useUnreadMessages } from "@/hooks/use-unread-messages";
import { ChatThread } from "@/components/chat/chat-thread";
import { ServiceRequestStatusActions } from "@/components/services/service-request-status-actions";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { authModalLoginUrl, isAuthModalOpen } from "@/lib/auth/redirect";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { ArrowLeft, MessageSquare } from "lucide-react";
import {
  SERVICE_REQUEST_STATUS_LABELS,
  type ServiceRequestStatus,
} from "@/types";

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
  requestStatus?: ServiceRequestStatus | null;
  requestId?: string | null;
}

interface ServiceFilterMeta {
  id: string;
  title: string;
  isOwner: boolean;
}

function statusBadgeVariant(
  status: ServiceRequestStatus
): "primary" | "signal" | "success" | "muted" {
  switch (status) {
    case "new":
      return "primary";
    case "in_conversation":
      return "signal";
    case "reserved":
      return "success";
    default:
      return "muted";
  }
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAuth } = useAuthModal();
  const authPromptedRef = useRef(false);
  const contactHandledRef = useRef(false);
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
  const [serviceFilter, setServiceFilter] = useState<ServiceFilterMeta | null>(null);
  const [activeContext, setActiveContext] = useState<{
    jobPostingId: string | null;
    jobTitle: string | null;
    serviceId: string | null;
  }>({ jobPostingId: null, jobTitle: null, serviceId: null });
  const { unreadByConversation, setActiveConversation } = useUnreadMessages();

  const filterServiceId = searchParams.get("servicio");

  const loadConversations = useCallback(
    async (uid: string, serviceIdFilter: string | null) => {
      const supabase = createClient();

      const { data: participations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", uid);

      if (!participations?.length) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const convIds = participations.map((p) => p.conversation_id);
      let query = supabase
        .from("conversations")
        .select("*")
        .in("id", convIds)
        .order("updated_at", { ascending: false });

      if (serviceIdFilter) {
        query = query.eq("service_id", serviceIdFilter);
      }

      const { data: convs } = await query;

      const requestByConversation = new Map<
        string,
        { id: string; status: ServiceRequestStatus }
      >();

      if (serviceIdFilter && convs?.length) {
        const { data: requests } = await supabase
          .from("service_requests")
          .select("id, conversation_id, status")
          .eq("service_id", serviceIdFilter)
          .in(
            "conversation_id",
            convs.map((c) => c.id)
          );

        for (const req of requests ?? []) {
          if (req.conversation_id) {
            requestByConversation.set(req.conversation_id, {
              id: req.id,
              status: req.status as ServiceRequestStatus,
            });
          }
        }
      }

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

        const requestMeta = requestByConversation.get(conv.id);

        items.push({
          id: conv.id,
          title: conv.title,
          updated_at: conv.updated_at,
          job_posting_id: conv.job_posting_id,
          service_id: conv.service_id,
          otherParticipant: otherProfile,
          lastMessage: lastMsg?.content ?? null,
          requestId: requestMeta?.id ?? null,
          requestStatus: requestMeta?.status ?? null,
        });
      }

      setConversations(items);
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (isAuthModalOpen(searchParams)) {
          authPromptedRef.current = true;
          setNeedsAuth(true);
          setLoading(false);
          return;
        }

        if (!authPromptedRef.current) {
          authPromptedRef.current = true;
          const redirectPath = searchParams.toString()
            ? `/mensajes?${searchParams.toString()}`
            : "/mensajes";
          router.replace(authModalLoginUrl(redirectPath));
          return;
        }

        setNeedsAuth(true);
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const conversacion = searchParams.get("conversacion");
      const contactar = searchParams.get("contactar");
      const oferta = searchParams.get("oferta");
      const servicio = searchParams.get("servicio");

      if (conversacion) {
        setActiveId(conversacion);
      }

      if (servicio) {
        const { data: service } = await supabase
          .from("services")
          .select("id, title, professional_id")
          .eq("id", servicio)
          .maybeSingle();

        if (service) {
          setServiceFilter({
            id: service.id,
            title: service.title,
            isOwner: service.professional_id === user.id,
          });
        } else {
          setServiceFilter(null);
        }
      } else {
        setServiceFilter(null);
      }

      const shouldHandleContact =
        contactar && (!contactHandledRef.current || !conversacion);

      if (shouldHandleContact) {
        contactHandledRef.current = true;

        let contactUserId = contactar;
        let jobPostingId = oferta ?? undefined;
        let conversationTitle: string | undefined;

        if (oferta) {
          const { data: job } = await supabase
            .from("job_postings")
            .select("author_id, title")
            .eq("id", oferta)
            .single();

          if (job) {
            contactUserId = contactUserId ?? job.author_id;
            conversationTitle = job.title;
            jobPostingId = oferta;
          }
        }

        if (contactUserId && contactUserId !== user.id) {
          const convId = await getOrCreateConversation(user.id, contactUserId, {
            jobPostingId,
            serviceId: servicio ?? undefined,
            title: conversationTitle,
          });

          if (convId) {
            setActiveId(convId);
            setActiveContext({
              jobPostingId: jobPostingId ?? null,
              jobTitle: conversationTitle ?? null,
              serviceId: servicio,
            });
            const params = new URLSearchParams();
            params.set("conversacion", convId);
            if (servicio) params.set("servicio", servicio);
            router.replace(`/mensajes?${params.toString()}`);
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
          }
        }
      }

      await loadConversations(user.id, servicio);
    }

    init();
  }, [router, searchParams, loadConversations]);

  useEffect(() => {
    const conversacion = searchParams.get("conversacion");
    if (conversacion) {
      setActiveId(conversacion);
    }
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [activeId]);

  useEffect(() => {
    setActiveConversation(activeId);
  }, [activeId, setActiveConversation]);

  useEffect(() => {
    return () => {
      setActiveConversation(null);
    };
  }, [setActiveConversation]);

  useEffect(() => {
    if (!activeId || !userId) return;

    void (async () => {
      const supabase = createClient();
      const { data: latest } = await supabase
        .from("messages")
        .select("created_at")
        .eq("conversation_id", activeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      await markConversationRead(
        activeId,
        userId,
        latest?.created_at ?? new Date().toISOString()
      );
    })();

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

    supabase
      .from("conversations")
      .select("job_posting_id, service_id, title, job_postings(title)")
      .eq("id", activeId)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const job = data.job_postings as unknown as { title: string } | null;
        setActiveContext({
          jobPostingId: data.job_posting_id,
          jobTitle: job?.title ?? data.title,
          serviceId: data.service_id,
        });
      });
  }, [activeId, userId]);

  const statusCounts = useMemo(() => {
    const counts: Record<ServiceRequestStatus, number> = {
      new: 0,
      in_conversation: 0,
      reserved: 0,
      discarded: 0,
    };
    for (const conv of conversations) {
      if (conv.requestStatus) counts[conv.requestStatus] += 1;
    }
    return counts;
  }, [conversations]);

  const activeRequest = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  function openConversation(conv: ConversationItem) {
    setActiveId(conv.id);
    setActiveContext({
      jobPostingId: conv.job_posting_id,
      jobTitle: conv.title,
      serviceId: conv.service_id,
    });
    const params = new URLSearchParams();
    params.set("conversacion", conv.id);
    if (filterServiceId) params.set("servicio", filterServiceId);
    router.push(`/mensajes?${params.toString()}`);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  function handleRequestStatusUpdated(
    conversationId: string,
    status: ServiceRequestStatus
  ) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, requestStatus: status } : c
      )
    );
  }

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
    <div className="mx-auto flex max-w-7xl flex-col px-4 py-6 sm:px-6 lg:h-[calc(100dvh-5.5rem)]">
      <div className="mb-4 shrink-0">
        {serviceFilter ? (
          <div>
            <Link
              href={`/servicios/${serviceFilter.id}`}
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al servicio
            </Link>
            <h1 className="text-2xl font-bold">Candidaturas</h1>
            <p className="mt-1 text-sm text-muted-foreground">{serviceFilter.title}</p>
            {serviceFilter.isOwner && (
              <div className="mt-3 flex flex-wrap gap-2">
                {(Object.keys(SERVICE_REQUEST_STATUS_LABELS) as ServiceRequestStatus[]).map(
                  (status) => (
                    <Badge key={status} variant={statusBadgeVariant(status)}>
                      {SERVICE_REQUEST_STATUS_LABELS[status]}: {statusCounts[status]}
                    </Badge>
                  )
                )}
              </div>
            )}
          </div>
        ) : (
          <h1 className="text-2xl font-bold">Mensajes</h1>
        )}
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border">
        <div className="w-full shrink-0 overflow-y-auto border-r border-border sm:w-80">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-50" />
              {filterServiceId
                ? "No hay candidaturas para este servicio"
                : "No tienes conversaciones todavía"}
            </div>
          ) : (
            conversations.map((conv) => {
              const unreadCount = unreadByConversation[conv.id] ?? 0;

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => openConversation(conv)}
                  className={`flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-accent/50 ${
                    activeId === conv.id ? "bg-accent" : ""
                  } ${unreadCount > 0 ? "bg-primary/5" : ""}`}
                >
                  <div className="relative shrink-0">
                    {conv.otherParticipant && (
                      <Avatar
                        src={conv.otherParticipant.avatar_url}
                        name={conv.otherParticipant.display_name}
                      />
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-red-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm ${
                        unreadCount > 0 ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {conv.otherParticipant?.display_name ??
                        conv.title ??
                        "Conversación"}
                    </p>
                    {conv.requestStatus && (
                      <Badge
                        variant={statusBadgeVariant(conv.requestStatus)}
                        className="mt-1"
                      >
                        {SERVICE_REQUEST_STATUS_LABELS[conv.requestStatus]}
                      </Badge>
                    )}
                    {conv.lastMessage && (
                      <p
                        className={`mt-1 truncate text-xs ${
                          unreadCount > 0
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {conv.lastMessage}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(conv.updated_at)}
                    </span>
                    {unreadCount > 0 && (
                      <span className="inline-flex min-w-[1.125rem] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="hidden flex-1 flex-col sm:flex">
          {activeId && userId ? (
            <>
              {serviceFilter?.isOwner &&
                activeRequest?.requestId &&
                activeRequest.requestStatus && (
                  <div className="shrink-0 border-b border-border px-4 py-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Estado de la solicitud
                    </p>
                    <ServiceRequestStatusActions
                      requestId={activeRequest.requestId}
                      currentStatus={activeRequest.requestStatus}
                      onUpdated={(status) =>
                        handleRequestStatusUpdated(activeId, status)
                      }
                    />
                  </div>
                )}
              <ChatThread
                conversationId={activeId}
                currentUserId={userId}
                participants={participants}
                jobPostingId={activeContext.jobPostingId}
                jobTitle={activeContext.jobTitle}
                serviceId={activeContext.serviceId}
                onMessageSent={() => {
                  if (userId && filterServiceId) {
                    void loadConversations(userId, filterServiceId);
                  }
                }}
              />
            </>
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
