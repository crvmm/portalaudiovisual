import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AvailabilityEditor } from "@/components/calendar/availability-editor";
import { AuthRequiredPlaceholder } from "@/components/auth/auth-required-placeholder";
import { authModalLoginUrl, isAuthModalOpenFromParams } from "@/lib/auth/redirect";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (!isAuthModalOpenFromParams(params)) {
      redirect(authModalLoginUrl("/dashboard/calendario"));
    }
    return <AuthRequiredPlaceholder message="Inicia sesión para ver tu calendario" />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_type")
    .eq("id", user.id)
    .single();

  if (profile?.profile_type !== "professional") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Calendario de disponibilidad</h1>
      <p className="mt-2 text-muted-foreground">
        Marca los días en los que estás disponible, ocupado o de vacaciones
      </p>
      <div className="mt-8">
        <AvailabilityEditor />
      </div>
    </div>
  );
}
