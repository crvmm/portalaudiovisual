import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ApplicationStatusActions } from "@/components/applications/application-status-actions";
import { MessageSquare, ExternalLink } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pendiente",
  reviewed: "Revisada",
  shortlisted: "Preseleccionada",
  accepted: "Aceptada",
  rejected: "Rechazada",
  withdrawn: "Retirada",
};

export default async function DashboardJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: posting } = await supabase
    .from("job_postings")
    .select("*")
    .eq("id", id)
    .eq("author_id", user.id)
    .single();

  if (!posting) notFound();

  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      professional_profiles:applicant_id (
        id,
        headline,
        location_city,
        years_experience,
        hourly_rate_min,
        profiles:id (display_name, avatar_url)
      )
    `)
    .eq("job_posting_id", id)
    .order("created_at", { ascending: false });

  const { data: matches } = await supabase
    .from("job_matches")
    .select(`
      *,
      professional_profiles:professional_id (
        id,
        headline,
        profiles:id (display_name, avatar_url)
      )
    `)
    .eq("job_posting_id", id)
    .gte("match_score", 50)
    .order("match_score", { ascending: false })
    .limit(10);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Mis ofertas", href: "/dashboard/ofertas" },
          { label: posting.title },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{posting.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {applications?.length ?? 0} candidaturas recibidas
          </p>
        </div>
        <Link href={`/ofertas/${id}`}>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4" />
            Ver publicación
          </Button>
        </Link>
      </div>

      {/* Matches */}
      {matches && matches.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Profesionales compatibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {matches.map((match) => {
              const prof = match.professional_profiles as unknown as {
                id: string;
                headline: string | null;
                profiles: { display_name: string; avatar_url: string | null };
              };
              return (
                <div
                  key={match.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={prof.profiles.avatar_url}
                      name={prof.profiles.display_name}
                    />
                    <div>
                      <Link
                        href={`/profesionales/${prof.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {prof.profiles.display_name}
                      </Link>
                      {prof.headline && (
                        <p className="text-sm text-muted-foreground">{prof.headline}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success">{Math.round(match.match_score)}%</Badge>
                    <Link href={`/mensajes?contactar=${prof.id}&oferta=${id}`}>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Applications */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Candidaturas</CardTitle>
        </CardHeader>
        <CardContent>
          {applications && applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => {
                const prof = app.professional_profiles as unknown as {
                  id: string;
                  headline: string | null;
                  location_city: string | null;
                  years_experience: number | null;
                  hourly_rate_min: number | null;
                  profiles: { display_name: string; avatar_url: string | null };
                };

                return (
                  <div
                    key={app.id}
                    className="rounded-lg border border-border p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={prof.profiles.avatar_url}
                          name={prof.profiles.display_name}
                          size="lg"
                        />
                        <div>
                          <Link
                            href={`/profesionales/${prof.id}`}
                            className="font-semibold hover:text-primary"
                          >
                            {prof.profiles.display_name}
                          </Link>
                          {prof.headline && (
                            <p className="text-sm text-muted-foreground">{prof.headline}</p>
                          )}
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {prof.location_city && <span>{prof.location_city}</span>}
                            {prof.years_experience && (
                              <span>{prof.years_experience} años exp.</span>
                            )}
                            {prof.hourly_rate_min && (
                              <span>desde {formatCurrency(prof.hourly_rate_min)}/h</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          app.status === "accepted"
                            ? "success"
                            : app.status === "rejected"
                              ? "danger"
                              : "muted"
                        }
                      >
                        {STATUS_LABELS[app.status as ApplicationStatus]}
                      </Badge>
                    </div>

                    {app.cover_message && (
                      <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">
                        {app.cover_message}
                      </p>
                    )}

                    {app.proposed_budget && (
                      <p className="mt-2 text-sm">
                        <span className="text-muted-foreground">Presupuesto propuesto: </span>
                        <span className="font-medium">
                          {formatCurrency(app.proposed_budget)}
                        </span>
                      </p>
                    )}

                    <p className="mt-2 text-xs text-muted-foreground">
                      Enviada {formatDate(app.created_at)}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <ApplicationStatusActions
                        applicationId={app.id}
                        currentStatus={app.status as ApplicationStatus}
                      />
                      <Link href={`/mensajes?contactar=${prof.id}&oferta=${id}`}>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                          Mensaje
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              Aún no hay candidaturas para esta oferta
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
