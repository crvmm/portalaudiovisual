"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { createClient } from "@/lib/supabase/client";
import { formatSupabaseError } from "@/lib/supabase/errors";
import {
  getOrCreateConversation,
  sendMessage,
} from "@/hooks/use-messages";
import { buildServiceRequestMessagePayload } from "@/lib/service-request-message";

interface RequestServiceButtonProps {
  serviceId: string;
  serviceTitle: string;
  professionalId: string;
}

export function RequestServiceButton({
  serviceId,
  serviceTitle,
  professionalId,
}: RequestServiceButtonProps) {
  const router = useRouter();
  const { openAuth } = useAuthModal();
  const titleId = useId();

  const [open, setOpen] = useState(false);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [location, setLocation] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gateError, setGateError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, loading]);

  function resetForm() {
    setDateStart("");
    setDateEnd("");
    setLocation("");
    setComments("");
    setError(null);
    setLoading(false);
  }

  function closeModal() {
    if (loading) return;
    setOpen(false);
    resetForm();
  }

  async function handleOpen() {
    setGateError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      openAuth({
        mode: "login",
        redirect: `/servicios/${serviceId}`,
      });
      return;
    }

    if (user.id === professionalId) {
      setGateError("No puedes solicitar tu propio servicio.");
      return;
    }

    resetForm();
    setOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!dateStart) {
      setError("Indica al menos una fecha de interés.");
      return;
    }

    if (dateEnd && dateEnd < dateStart) {
      setError("La fecha de fin no puede ser anterior a la de inicio.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setOpen(false);
      openAuth({
        mode: "login",
        redirect: `/servicios/${serviceId}`,
      });
      return;
    }

    if (user.id === professionalId) {
      setError("No puedes solicitar tu propio servicio.");
      setLoading(false);
      return;
    }

    const conversationId = await getOrCreateConversation(user.id, professionalId, {
      serviceId,
      title: serviceTitle,
    });

    if (!conversationId) {
      setError("No se pudo crear la conversación. Inténtalo de nuevo.");
      setLoading(false);
      return;
    }

    const requestPayload = {
      service_id: serviceId,
      requester_id: user.id,
      conversation_id: conversationId,
      date_start: dateStart,
      date_end: dateEnd || null,
      location: location.trim() || null,
      comments: comments.trim() || null,
      status: "new" as const,
    };

    const { data: existingRequest } = await supabase
      .from("service_requests")
      .select("id")
      .eq("service_id", serviceId)
      .eq("requester_id", user.id)
      .maybeSingle();

    if (existingRequest) {
      const { error: updateError } = await supabase
        .from("service_requests")
        .update({
          conversation_id: conversationId,
          date_start: dateStart,
          date_end: dateEnd || null,
          location: location.trim() || null,
          comments: comments.trim() || null,
          status: "new",
        })
        .eq("id", existingRequest.id);

      if (updateError) {
        setError(formatSupabaseError(updateError));
        setLoading(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("service_requests")
        .insert(requestPayload);

      if (insertError) {
        setError(formatSupabaseError(insertError));
        setLoading(false);
        return;
      }
    }

    const content = buildServiceRequestMessagePayload({
      serviceTitle,
      dateStart,
      dateEnd,
      location,
      comments,
    });

    const { error: sendError } = await sendMessage(conversationId, user.id, content);

    if (sendError) {
      setError(formatSupabaseError(sendError));
      setLoading(false);
      return;
    }

    setOpen(false);
    resetForm();
    router.push(`/mensajes?conversacion=${conversationId}`);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <Button type="button" className="w-full" onClick={handleOpen}>
        <MessageSquare className="h-4 w-4" />
        Solicitar servicio
      </Button>
      {gateError && (
        <p className="mt-2 text-center text-xs text-red-700">{gateError}</p>
      )}

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/25 backdrop-blur-[3px]"
            aria-label="Cerrar"
            onClick={closeModal}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
            className="relative z-10 max-h-[min(90vh,720px)] w-full max-w-md overflow-y-auto rounded-lg border border-border bg-card shadow-[0_24px_64px_oklch(0.26_0.04_290/0.16)]"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Cerrar ventana"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 sm:p-7">
              <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stage">
                Solicitud
              </p>
              <h2 id={titleId} className="mt-2 font-display text-2xl font-medium">
                Solicitar servicio
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Indica fechas, ubicación si la sabes y cualquier detalle. Se enviará
                como mensaje al profesional.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    id="request-date-start"
                    type="date"
                    label="Fecha de interés *"
                    required
                    min={today}
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                  />
                  <Input
                    id="request-date-end"
                    type="date"
                    label="Hasta (opcional)"
                    min={dateStart || today}
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                  />
                </div>
                <p className="-mt-2 text-xs text-muted-foreground">
                  Si te interesan varias fechas sueltas, indícalo en comentarios.
                </p>

                <Input
                  id="request-location"
                  type="text"
                  label="Ubicación exacta (opcional)"
                  placeholder="Dirección, estudio, localización…"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                <Textarea
                  id="request-comments"
                  label="Comentarios (opcional)"
                  placeholder="Detalles del proyecto, horarios, necesidades…"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                />

                {error && (
                  <p className="rounded-md bg-red-600/10 px-3 py-2.5 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando…" : "Enviar solicitud"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
