import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";

export default async function DashboardNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirect=/dashboard/notificaciones");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold mb-8">Notificaciones</h1>
      <NotificationsPanel />
    </div>
  );
}
