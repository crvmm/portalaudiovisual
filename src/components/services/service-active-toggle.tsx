"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function ServiceActiveToggle({
  serviceId,
  isActive,
}: {
  serviceId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("services").update({ is_active: !isActive }).eq("id", serviceId);
    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
    >
      {loading ? "…" : isActive ? "Pausar" : "Activar"}
    </Button>
  );
}
