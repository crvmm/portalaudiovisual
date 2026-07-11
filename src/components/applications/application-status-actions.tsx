"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { ApplicationStatus } from "@/types";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "reviewed", label: "Marcar revisada" },
  { value: "shortlisted", label: "Preseleccionar" },
  { value: "accepted", label: "Aceptar" },
  { value: "rejected", label: "Rechazar" },
];

export function ApplicationStatusActions({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: ApplicationStatus) {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("applications")
      .update({ status })
      .eq("id", applicationId);
    router.refresh();
    setLoading(false);
  }

  if (currentStatus === "accepted" || currentStatus === "rejected") {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_OPTIONS.map(({ value, label }) => (
        <Button
          key={value}
          variant={value === "rejected" ? "danger" : value === "accepted" ? "primary" : "outline"}
          size="sm"
          disabled={loading || currentStatus === value}
          onClick={() => updateStatus(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
