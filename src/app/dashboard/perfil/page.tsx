import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { CompanyProfileEditor } from "@/components/profile/company-profile-editor";
import { IndividualProfileEditor } from "@/components/profile/individual-profile-editor";
import { AuthRequiredPlaceholder } from "@/components/auth/auth-required-placeholder";
import type { ProfileType } from "@/types";

const PROFILE_COPY: Record<
  ProfileType,
  { title: string; description: string }
> = {
  professional: {
    title: "Editar perfil profesional",
    description: "Completa tu perfil para que las oportunidades te encuentren",
  },
  company: {
    title: "Perfil de empresa",
    description: "Presenta tu empresa a profesionales y candidatos",
  },
  individual: {
    title: "Mi perfil",
    description: "Tu información de contacto y ubicación",
  },
};

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <AuthRequiredPlaceholder message="Inicia sesión para editar tu perfil" />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_type")
    .eq("id", user.id)
    .single();

  const profileType = (profile?.profile_type ?? "professional") as ProfileType;
  const copy = PROFILE_COPY[profileType];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">{copy.title}</h1>
      <p className="mt-2 text-muted-foreground">{copy.description}</p>
      <div className="mt-8">
        {profileType === "company" ? (
          <CompanyProfileEditor />
        ) : profileType === "individual" ? (
          <IndividualProfileEditor />
        ) : (
          <Suspense
            fallback={
              <p className="py-16 text-center text-muted-foreground">Cargando perfil...</p>
            }
          >
            <ProfileEditor />
          </Suspense>
        )}
      </div>
    </div>
  );
}
