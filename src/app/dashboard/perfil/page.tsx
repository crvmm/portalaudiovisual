import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { AuthRequiredPlaceholder } from "@/components/auth/auth-required-placeholder";
import { authModalLoginUrl, isAuthModalOpenFromParams } from "@/lib/auth/redirect";

export default async function ProfileEditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (!isAuthModalOpenFromParams(params)) {
      redirect(authModalLoginUrl("/dashboard/perfil"));
    }
    return <AuthRequiredPlaceholder message="Inicia sesión para editar tu perfil" />;
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Editar perfil profesional</h1>
      <p className="mt-2 text-muted-foreground">
        Completa tu perfil para que las oportunidades te encuentren
      </p>
      <div className="mt-8">
        <ProfileEditor />
      </div>
    </div>
  );
}
