"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AvailabilityCalendar } from "@/components/calendar/availability-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AvailabilitySlot, AvailabilityStatus } from "@/types";

export function AvailabilityEditor() {
  const router = useRouter();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        router.push("/auth/login?redirect=/dashboard/calendario");
        return;
      }
      setUserId(user.id);
      loadSlots(user.id);
    });
  }, [router, loadSlots]);

  async function handleSlotChange(date: string, status: AvailabilityStatus) {
    if (!userId) return;

    const supabase = createClient();
    const existing = slots.find((s) => s.date === date);

    if (existing) {
      const { data: updated } = await supabase
        .from("availability_slots")
        .update({ status })
        .eq("id", existing.id)
        .select()
        .single();

      if (updated) {
        setSlots((prev) => prev.map((s) => (s.id === existing.id ? updated : s)));
      }
    } else {
      const { data: created } = await supabase
        .from("availability_slots")
        .insert({ professional_id: userId, date, status })
        .select()
        .single();

      if (created) {
        setSlots((prev) => [...prev, created]);
      }
    }
  }

  if (loading) {
    return <p className="py-16 text-center text-muted-foreground">Cargando calendario...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestiona tu disponibilidad</CardTitle>
        <p className="text-sm text-muted-foreground">
          Haz clic en un día para cambiar su estado. Los clientes podrán ver tu disponibilidad antes de contactarte.
        </p>
      </CardHeader>
      <CardContent>
        <AvailabilityCalendar
          slots={slots}
          onSlotChange={handleSlotChange}
        />
      </CardContent>
    </Card>
  );
}
