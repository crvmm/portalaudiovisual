import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AvailabilityEditor } from "@/components/calendar/availability-editor";
import { AuthRequiredPlaceholder } from "@/components/auth/auth-required-placeholder";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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
    <div className="mx-auto max-w-xl px-4 py-6 sm:px-6">
      <h1 className="text-xl font-semibold tracking-tight">Disponibilidad</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Elige estado, rellena el mes y ajusta días si hace falta.
      </p>
      <div className="mt-4">
        <AvailabilityEditor />
      </div>
    </div>
  );
}
