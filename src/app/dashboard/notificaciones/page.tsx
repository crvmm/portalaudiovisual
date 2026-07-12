import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";
import { AuthRequiredPlaceholder } from "@/components/auth/auth-required-placeholder";
import { authModalLoginUrl, isAuthModalOpenFromParams } from "@/lib/auth/redirect";

export default async function DashboardNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (!isAuthModalOpenFromParams(params)) {
      redirect(authModalLoginUrl("/dashboard/notificaciones"));
    }
    return <AuthRequiredPlaceholder message="Inicia sesión para ver tus notificaciones" />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold mb-8">Notificaciones</h1>
      <NotificationsPanel />
    </div>
  );
}
