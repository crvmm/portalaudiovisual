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
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  AVAILABILITY_STATUS_LABELS,
  AVAILABILITY_STATUS_COLORS,
  type AvailabilitySlot,
  type AvailabilityStatus,
} from "@/types";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

interface AvailabilityCalendarProps {
  slots: AvailabilitySlot[];
  readOnly?: boolean;
  compact?: boolean;
  onSlotChange?: (date: string, status: AvailabilityStatus) => void;
}

export function AvailabilityCalendar({
  slots,
  readOnly = false,
  compact = false,
  onSlotChange,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const slotMap = new Map(slots.map((s) => [s.date, s.status]));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startPadding = (getDay(monthStart) + 6) % 7;

  function handleDayClick(dateStr: string) {
    if (readOnly || !onSlotChange) return;

    const current = slotMap.get(dateStr);
    const cycle: AvailabilityStatus[] = [
      "available",
      "partial",
      "busy",
      "tentative",
      "vacation",
    ];
    const nextIndex = current
      ? (cycle.indexOf(current) + 1) % cycle.length
      : 0;
    onSlotChange(dateStr, cycle[nextIndex]);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="rounded-lg p-1.5 hover:bg-accent"
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
          className="rounded-lg p-1.5 hover:bg-accent"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-1"
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

          return (
            <button
              key={dateStr}
              type="button"
              disabled={readOnly}
              onClick={() => handleDayClick(dateStr)}
              className={cn(
                "relative flex items-center justify-center rounded-md text-xs transition-colors",
                compact ? "h-7 w-7" : "h-9 w-9",
                !inMonth && "opacity-30",
                isToday(day) && "ring-1 ring-primary",
                readOnly ? "cursor-default" : "cursor-pointer hover:bg-accent",
                !status && "text-muted-foreground"
              )}
              title={status ? AVAILABILITY_STATUS_LABELS[status] : undefined}
            >
              {format(day, "d")}
              {status && (
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

      {!compact && (
        <div className="mt-4 flex flex-wrap gap-3">
          {(Object.keys(AVAILABILITY_STATUS_LABELS) as AvailabilityStatus[]).map(
            (status) => (
              <div key={status} className="flex items-center gap-1.5 text-xs">
                <span
                  className={cn("h-2 w-2 rounded-full", AVAILABILITY_STATUS_COLORS[status])}
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
