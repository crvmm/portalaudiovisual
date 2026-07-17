import { createClient } from "@/lib/supabase/server";
import { AccountSettings } from "@/components/settings/account-settings";
import { AuthRequiredPlaceholder } from "@/components/auth/auth-required-placeholder";

export default async function DashboardSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <AuthRequiredPlaceholder message="Inicia sesión para ver la configuración" />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Configuración</h1>
      <p className="mt-2 text-muted-foreground">
        Datos de cuenta, seguridad y sesión
      </p>
      <div className="mt-8">
        <AccountSettings />
      </div>
    </div>
  );
}
