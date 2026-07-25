import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AuthRequiredPlaceholder } from "@/components/auth/auth-required-placeholder";
import { ServiceForm } from "@/components/services/service-form";

export default async function NewServicePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <AuthRequiredPlaceholder message="Inicia sesión para publicar un servicio" />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_type")
    .eq("id", user.id)
    .single();

  if (profile?.profile_type !== "professional") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold">Publicar servicio</h1>
        <p className="mt-2 text-muted-foreground">
          Solo los perfiles profesionales pueden publicar servicios.
        </p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-primary hover:underline">
          Volver al panel →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Publicar servicio</h1>
      <p className="mt-2 text-muted-foreground">
        Describe un servicio que ofreces como profesional autónomo
      </p>
      <div className="mt-8">
        <ServiceForm />
      </div>
    </div>
  );
}
