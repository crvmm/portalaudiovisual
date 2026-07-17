import { createClient } from "@/lib/supabase/server";
import { JobPostingForm } from "@/components/jobs/job-posting-form";
import { AuthRequiredPlaceholder } from "@/components/auth/auth-required-placeholder";

export default async function PublishPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <AuthRequiredPlaceholder message="Inicia sesión para publicar una oferta" />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Publicar oferta</h1>
      <p className="mt-2 text-muted-foreground">
        Vacante de empleo, proyecto freelance o encargo puntual para el sector audiovisual
      </p>
      <div className="mt-8">
        <JobPostingForm />
      </div>
    </div>
  );
}
