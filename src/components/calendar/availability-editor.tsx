"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eraser, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  AvailabilityCalendar,
  getMonthAllDays,
  getMonthWeekdays,
  getMonthWeekends,
  type PaintStatus,
} from "@/components/calendar/availability-calendar";
import { cn } from "@/lib/utils";
import {
  AVAILABILITY_STATUS_LABELS,
  AVAILABILITY_STATUS_COLORS,
  type AvailabilitySlot,
  type AvailabilityStatus,
} from "@/types";

const STATUS_OPTIONS: AvailabilityStatus[] = [
  "available",
  "partial",
  "busy",
  "tentative",
  "vacation",
];

function makeTempId() {
  return `temp-${Math.random().toString(36).slice(2)}`;
}

export function AvailabilityEditor() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paintStatus, setPaintStatus] = useState<PaintStatus>("available");
  const [month, setMonth] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const saveQueueRef = useRef(Promise.resolve());

  const loadSlots = useCallback(async (uid: string) => {
    const supabase = createClient();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    const { data } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("professional_id", uid)
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0])
      .order("date");

    setSlots(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      loadSlots(user.id);
    });
  }, [loadSlots]);

  function applyOptimistic(dates: string[], status: PaintStatus, uid: string) {
    const uniqueDates = [...new Set(dates)];

    setSlots((prev) => {
      if (status === "clear") {
        return prev.filter((s) => !uniqueDates.includes(s.date));
      }

      const map = new Map(prev.map((s) => [s.date, s]));
      for (const date of uniqueDates) {
        const existing = map.get(date);
        map.set(date, {
          id: existing?.id ?? makeTempId(),
          professional_id: uid,
          date,
          status,
          start_time: existing?.start_time ?? null,
          end_time: existing?.end_time ?? null,
          notes: existing?.notes ?? null,
        });
      }
      return Array.from(map.values());
    });

    return uniqueDates;
  }

  function paintDays(dates: string[], status: PaintStatus) {
    if (!userId || dates.length === 0) return;

    const uniqueDates = applyOptimistic(dates, status, userId);
    setError(null);
    setSaving(true);

    saveQueueRef.current = saveQueueRef.current
      .then(async () => {
        const supabase = createClient();

        if (status === "clear") {
          const { error: deleteError } = await supabase
            .from("availability_slots")
            .delete()
            .eq("professional_id", userId)
            .in("date", uniqueDates);

          if (deleteError) throw deleteError;
          return;
        }

        const rows = uniqueDates.map((date) => ({
          professional_id: userId,
          date,
          status,
        }));

        const { data, error: upsertError } = await supabase
          .from("availability_slots")
          .upsert(rows, { onConflict: "professional_id,date" })
          .select();

        if (upsertError) throw upsertError;

        if (data) {
          setSlots((prev) => {
            const map = new Map(prev.map((s) => [s.date, s]));
            for (const row of data) map.set(row.date, row);
            return Array.from(map.values());
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudo guardar. Reintentando sincronizar…");
        void loadSlots(userId);
      })
      .finally(() => {
        setSaving(false);
      });
  }

  if (loading) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Cargando calendario...
      </p>
    );
  }

  const monthLabel = format(month, "MMMM", { locale: es });
  const statusLabel =
    paintStatus === "clear"
      ? "Borrar"
      : AVAILABILITY_STATUS_LABELS[paintStatus];

  return (
    <div className="space-y-3">
      <section className="rounded-md border border-border bg-card p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Estado
          </p>
          {saving && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Guardando
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {STATUS_OPTIONS.map((status) => {
            const selected = paintStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setPaintStatus(status)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  selected
                    ? "border-primary bg-primary/8 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-stage/35 hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    AVAILABILITY_STATUS_COLORS[status]
                  )}
                />
                {AVAILABILITY_STATUS_LABELS[status]}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPaintStatus("clear")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
              paintStatus === "clear"
                ? "border-primary bg-primary/8 text-foreground"
                : "border-border bg-background text-muted-foreground hover:border-stage/35 hover:text-foreground"
            )}
          >
            <Eraser className="h-3 w-3" />
            Borrar
          </button>
        </div>

        <div className="mt-3 border-t border-border pt-3">
          <p className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Relleno rápido
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Aplica <span className="font-medium text-foreground">{statusLabel}</span>
            {" · "}
            <span className="capitalize">{monthLabel}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => paintDays(getMonthWeekdays(month), paintStatus)}
              className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-stage/35 hover:text-foreground"
            >
              Laborables
            </button>
            <button
              type="button"
              onClick={() => paintDays(getMonthWeekends(month), paintStatus)}
              className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-stage/35 hover:text-foreground"
            >
              Fines de semana
            </button>
            <button
              type="button"
              onClick={() => paintDays(getMonthAllDays(month), paintStatus)}
              className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-stage/35 hover:text-foreground"
            >
              Todo el mes
            </button>
            <button
              type="button"
              onClick={() => paintDays(getMonthAllDays(month), "clear")}
              className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-stage/35 hover:text-foreground"
            >
              Limpiar
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-3 sm:p-4">
        <AvailabilityCalendar
          slots={slots}
          paintStatus={paintStatus}
          month={month}
          onMonthChange={setMonth}
          onPaintDays={paintDays}
        />
        {error && (
          <p className="mt-3 rounded-md bg-red-600/10 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
