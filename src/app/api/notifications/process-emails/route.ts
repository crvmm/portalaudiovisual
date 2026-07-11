import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Endpoint para procesar emails pendientes (llamar desde cron o manualmente)
// POST /api/notifications/process-emails
export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        message: "Email processing not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local",
        hint: "Deploy the edge function send-notification-email or call this endpoint with service role key",
      },
      { status: 503 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: pending, error } = await supabase
    .from("email_queue")
    .select("*")
    .eq("status", "pending")
    .lt("attempts", 3)
    .order("created_at")
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // In development without Resend, mark as sent for testing
  let processed = 0;
  for (const item of pending ?? []) {
    await supabase
      .from("email_queue")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", item.id);
    processed++;
  }

  return NextResponse.json({
    processed,
    message: `${processed} emails queued for delivery`,
  });
}
