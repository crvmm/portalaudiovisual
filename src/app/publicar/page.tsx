import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobPostingForm } from "@/components/jobs/job-posting-form";

export default async function PublishPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/publicar");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Publicar oferta o encargo</h1>
      <p className="mt-2 text-muted-foreground">
        Publica una oportunidad para que los profesionales adecuados la encuentren
      </p>
      <div className="mt-8">
        <JobPostingForm />
      </div>
    </div>
  );
}
