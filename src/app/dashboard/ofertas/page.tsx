import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JOB_POSTING_TYPE_LABELS, type JobPostingType } from "@/types";
import { formatDate } from "@/lib/utils";
import { Users } from "lucide-react";

export default async function DashboardJobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirect=/dashboard/ofertas");

  const { data: postings } = await supabase
    .from("job_postings")
    .select(`
      *,
      applications(count)
    `)
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis ofertas</h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona tus publicaciones y revisa candidaturas
          </p>
        </div>
        <Link
          href="/publicar"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Nueva oferta
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {postings && postings.length > 0 ? (
          postings.map((posting) => {
            const appCount = (posting.applications as { count: number }[])?.[0]?.count ?? 0;
            return (
              <Link key={posting.id} href={`/dashboard/ofertas/${posting.id}`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="signal">
                          {JOB_POSTING_TYPE_LABELS[posting.posting_type as JobPostingType]}
                        </Badge>
                        <Badge
                          variant={posting.status === "open" ? "success" : "muted"}
                        >
                          {posting.status === "open" ? "Abierta" : posting.status}
                        </Badge>
                      </div>
                      <h2 className="mt-2 font-semibold">{posting.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        Publicada {formatDate(posting.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {appCount} candidaturas
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No has publicado ninguna oferta todavía</p>
              <Link href="/publicar" className="mt-4 inline-block text-primary hover:underline">
                Publicar tu primera oferta →
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
