// Supabase Edge Function: procesa la cola de emails pendientes
// Desplegar con: supabase functions deploy send-notification-email
// Configurar: supabase secrets set RESEND_API_KEY=re_xxx

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Portal Audiovisual <noreply@portalaudiovisual.com>";

interface EmailQueueItem {
  id: string;
  to_email: string;
  subject: string;
  body_html: string;
  body_text: string | null;
  attempts: number;
}

async function sendEmail(item: EmailQueueItem): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`[DEV] Email to ${item.to_email}: ${item.subject}`);
    return true;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: item.to_email,
      subject: item.subject,
      html: item.body_html,
      text: item.body_text,
    }),
  });

  return response.ok;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: pending, error } = await supabase
    .from("email_queue")
    .select("*")
    .eq("status", "pending")
    .lt("attempts", 3)
    .order("created_at")
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const item of pending ?? []) {
    try {
      const success = await sendEmail(item);

      if (success) {
        await supabase
          .from("email_queue")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", item.id);
        sent++;
      } else {
        await supabase
          .from("email_queue")
          .update({
            attempts: item.attempts + 1,
            status: item.attempts >= 2 ? "failed" : "pending",
            error_message: "Send failed",
          })
          .eq("id", item.id);
        failed++;
      }
    } catch (err) {
      await supabase
        .from("email_queue")
        .update({
          attempts: item.attempts + 1,
          error_message: String(err),
        })
        .eq("id", item.id);
      failed++;
    }
  }

  return new Response(JSON.stringify({ processed: pending?.length ?? 0, sent, failed }), {
    headers: { "Content-Type": "application/json" },
  });
});
