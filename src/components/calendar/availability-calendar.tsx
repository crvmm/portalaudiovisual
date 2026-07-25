"use client";

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  getDay,
  isBefore,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  AVAILABILITY_STATUS_LABELS,
  AVAILABILITY_STATUS_COLORS,
  type AvailabilitySlot,
  type AvailabilityStatus,
} from "@/types";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export type PaintStatus = AvailabilityStatus | "clear";

const DAY_FILL: Record<AvailabilityStatus, string> = {
  available: "bg-green-500/25 text-green-900 hover:bg-green-500/35",
  busy: "bg-red-500/25 text-red-900 hover:bg-red-500/35",
  partial: "bg-amber-500/25 text-amber-950 hover:bg-amber-500/35",
  tentative: "bg-blue-500/25 text-blue-900 hover:bg-blue-500/35",
  vacation: "bg-purple-500/25 text-purple-900 hover:bg-purple-500/35",
};

interface AvailabilityCalendarProps {
  slots: AvailabilitySlot[];
  readOnly?: boolean;
  compact?: boolean;
  paintStatus?: PaintStatus;
  onSlotChange?: (date: string, status: AvailabilityStatus) => void;
  onPaintDays?: (dates: string[], status: PaintStatus) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
}

function datesInRange(a: string, b: string): string[] {
  const start = parseISO(a <= b ? a : b);
  const end = parseISO(a <= b ? b : a);
  return eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"));
}

export function AvailabilityCalendar({
  slots,
  readOnly = false,
  compact = false,
  paintStatus,
  onSlotChange,
  onPaintDays,
  month,
  onMonthChange,
}: AvailabilityCalendarProps) {
  const [internalMonth, setInternalMonth] = useState(new Date());
  const currentMonth = month ?? internalMonth;

  function setCurrentMonth(next: Date) {
    if (onMonthChange) onMonthChange(next);
    else setInternalMonth(next);
  }

  const slotMap = new Map(slots.map((s) => [s.date, s.status]));
  const paintMode = !readOnly && paintStatus != null && Boolean(onPaintDays);

  const dragActiveRef = useRef(false);
  const originRef = useRef<string | null>(null);
  const previewRef = useRef<Set<string>>(new Set());
  const [dragPreview, setDragPreview] = useState<Set<string>>(new Set());
  const paintStatusRef = useRef(paintStatus);
  const onPaintDaysRef = useRef(onPaintDays);
  paintStatusRef.current = paintStatus;
  onPaintDaysRef.current = onPaintDays;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = (getDay(monthStart) + 6) % 7;

  function setPreview(next: Set<string>) {
    previewRef.current = next;
    setDragPreview(next);
  }

  function commitPaint() {
    if (!dragActiveRef.current) return;

    const dates = Array.from(previewRef.current);
    const status = paintStatusRef.current;
    dragActiveRef.current = false;
    originRef.current = null;
    setPreview(new Set());

    if (dates.length > 0 && status != null && onPaintDaysRef.current) {
      onPaintDaysRef.current(dates, status);
    }
  }

  useEffect(() => {
    function onUp() {
      commitPaint();
    }
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  function handleDayPointerDown(dateStr: string, event: React.PointerEvent) {
    if (readOnly) return;
    event.preventDefault();

    if (paintMode) {
      dragActiveRef.current = true;
      originRef.current = dateStr;
      setPreview(new Set([dateStr]));
      return;
    }

    if (!onSlotChange) return;
    const current = slotMap.get(dateStr);
    const cycle: AvailabilityStatus[] = [
      "available",
      "partial",
      "busy",
      "tentative",
      "vacation",
    ];
    const nextIndex = current ? (cycle.indexOf(current) + 1) % cycle.length : 0;
    onSlotChange(dateStr, cycle[nextIndex]);
  }

  function handleDayPointerEnter(dateStr: string) {
    if (!paintMode || !dragActiveRef.current || !originRef.current) return;
    setPreview(new Set(datesInRange(originRef.current, dateStr)));
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-medium capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h3>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid touch-none select-none grid-cols-7 gap-0.5">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-0.5 text-center text-[10px] font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const status = slotMap.get(dateStr);
          const inMonth = isSameMonth(day, currentMonth);
          const previewed = dragPreview.has(dateStr);
          const past = isBefore(day, new Date()) && !isToday(day);

          return (
            <button
              key={dateStr}
              type="button"
              disabled={readOnly}
              onPointerDown={(e) => handleDayPointerDown(dateStr, e)}
              onPointerEnter={() => handleDayPointerEnter(dateStr)}
              className={cn(
                "relative flex items-center justify-center rounded-md text-[11px] font-medium transition-colors duration-100",
                compact ? "h-7 w-7" : "h-8 w-full aspect-square max-h-9",
                !inMonth && "opacity-30",
                isToday(day) &&
                  "ring-1 ring-primary ring-offset-1 ring-offset-background",
                readOnly ? "cursor-default" : "cursor-pointer",
                past && !status && !previewed && "opacity-45",
                status && !previewed && !compact && DAY_FILL[status],
                !status &&
                  !previewed &&
                  !readOnly &&
                  "text-muted-foreground hover:bg-accent",
                previewed &&
                  (paintStatus === "clear"
                    ? "bg-muted text-muted-foreground ring-1 ring-border"
                    : paintStatus
                      ? DAY_FILL[paintStatus]
                      : "bg-accent")
              )}
              title={
                status
                  ? AVAILABILITY_STATUS_LABELS[status]
                  : paintMode
                    ? "Sin marcar"
                    : undefined
              }
            >
              {format(day, "d")}
              {status && (compact || readOnly) && (
                <span
                  className={cn(
                    "absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full",
                    AVAILABILITY_STATUS_COLORS[status]
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {!compact && readOnly && (
        <div className="mt-4 flex flex-wrap gap-3">
          {(Object.keys(AVAILABILITY_STATUS_LABELS) as AvailabilityStatus[]).map(
            (status) => (
              <div key={status} className="flex items-center gap-1.5 text-xs">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    AVAILABILITY_STATUS_COLORS[status]
                  )}
                />
                {AVAILABILITY_STATUS_LABELS[status]}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export function getMonthWeekdays(month: Date): string[] {
  return eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  })
    .filter((d) => {
      const day = getDay(d);
      return day !== 0 && day !== 6;
    })
    .map((d) => format(d, "yyyy-MM-dd"));
}

export function getMonthWeekends(month: Date): string[] {
  return eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  })
    .filter((d) => {
      const day = getDay(d);
      return day === 0 || day === 6;
    })
    .map((d) => format(d, "yyyy-MM-dd"));
}

export function getMonthAllDays(month: Date): string[] {
  return eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  }).map((d) => format(d, "yyyy-MM-dd"));
}
