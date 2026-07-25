"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  SERVICE_REQUEST_STATUS_LABELS,
  type ServiceRequestStatus,
} from "@/types";

const STATUS_OPTIONS: { value: ServiceRequestStatus; label: string }[] = [
  { value: "in_conversation", label: "En conversación" },
  { value: "reserved", label: "Reservar" },
  { value: "discarded", label: "Descartar" },
];

export function ServiceRequestStatusActions({
  requestId,
  currentStatus,
  onUpdated,
}: {
  requestId: string;
  currentStatus: ServiceRequestStatus;
  onUpdated?: (status: ServiceRequestStatus) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: ServiceRequestStatus) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("service_requests")
      .update({ status })
      .eq("id", requestId);

    if (!error) {
      onUpdated?.(status);
      router.refresh();
    }
    setLoading(false);
  }

  if (currentStatus === "reserved" || currentStatus === "discarded") {
    return (
      <p className="text-xs text-muted-foreground">
        Estado: {SERVICE_REQUEST_STATUS_LABELS[currentStatus]}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_OPTIONS.filter(({ value }) => value !== currentStatus).map(
        ({ value, label }) => (
          <Button
            key={value}
            type="button"
            variant={
              value === "discarded"
                ? "danger"
                : value === "reserved"
                  ? "primary"
                  : "outline"
            }
            size="sm"
            disabled={loading}
            onClick={() => updateStatus(value)}
          >
            {label}
          </Button>
        )
      )}
    </div>
  );
}
