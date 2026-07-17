import { createClient } from "@/lib/supabase/server";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";
import { AuthRequiredPlaceholder } from "@/components/auth/auth-required-placeholder";

export default async function DashboardNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <AuthRequiredPlaceholder message="Inicia sesión para ver tus notificaciones" />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold mb-8">Notificaciones</h1>
      <NotificationsPanel />
    </div>
  );
}
