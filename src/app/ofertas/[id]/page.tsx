import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Calendar,
  Briefcase,
  Wrench,
  Users,
  Clock,
  MessageSquare,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MatchScoreCard } from "@/components/matching/match-score-card";
import { ApplicationForm } from "@/components/applications/application-form";
import { authModalLoginUrl } from "@/lib/auth/redirect";
import {
  JOB_POSTING_TYPE_LABELS,
  WORK_MODALITY_LABELS,
  CONTRACT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  type JobPostingType,
  type WorkModality,
  type ContractType,
  type ExperienceLevel,
} from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { formatSpanishLocation } from "@/lib/spain-territories";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: posting } = await supabase
    .from("job_postings")
    .select(`
      *,
      profiles:author_id (id, display_name, profile_type, avatar_url)
    `)
    .eq("id", id)
    .single();

  if (!posting) notFound();

  const [
    { data: categories },
    { data: specialties },
    { data: tools },
    { data: equipment },
    { data: languages },
    { data: applications },
    { data: match },
  ] = await Promise.all([
    supabase
      .from("job_posting_categories")
      .select("categories(id, name, slug)")
      .eq("job_posting_id", id),
    supabase
      .from("job_posting_specialties")
      .select("specialties(id, name)")
      .eq("job_posting_id", id),
    supabase
      .from("job_posting_tools")
      .select("tools(name)")
      .eq("job_posting_id", id),
    supabase
      .from("job_posting_equipment")
      .select("equipment(name)")
      .eq("job_posting_id", id),
    supabase
      .from("job_posting_languages")
      .select("languages(name)")
      .eq("job_posting_id", id),
    user
      ? supabase
          .from("applications")
          .select("id, status")
          .eq("job_posting_id", id)
          .eq("applicant_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("job_matches")
          .select("*")
          .eq("job_posting_id", id)
          .eq("professional_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const author = posting.profiles as unknown as {
    id: string;
    display_name: string;
    profile_type: string;
    avatar_url: string | null;
  };

  const isAuthor = user?.id === posting.author_id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Ofertas", href: "/ofertas" },
          { label: posting.title },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="signal">
                {JOB_POSTING_TYPE_LABELS[posting.posting_type as JobPostingType]}
              </Badge>
              <Badge variant="muted">
                {WORK_MODALITY_LABELS[posting.work_modality as WorkModality]}
              </Badge>
              {posting.contract_type && (
                <Badge variant="muted">
                  {CONTRACT_TYPE_LABELS[posting.contract_type as ContractType]}
                </Badge>
              )}
              <Badge
                variant={
                  posting.status === "open"
                    ? "success"
                    : posting.status === "filled"
                      ? "warning"
                      : "muted"
                }
              >
                {posting.status === "open" ? "Abierta" : posting.status}
              </Badge>
            </div>
            <h1 className="mt-4 text-2xl font-bold">{posting.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Publicada por{" "}
              <Link href={`/empresas/${author.id}`} className="text-primary hover:underline">
                {author.display_name}
              </Link>
              {" · "}
              {formatDate(posting.created_at)}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {posting.description}
              </p>
            </CardContent>
          </Card>

          {categories && categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Categorías requeridas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const cat = c.categories as unknown as { id: string; name: string };
                    return (
                      <Badge key={cat.id} variant="primary">
                        {cat.name}
                      </Badge>
                    );
                  })}
                </div>
                {specialties && specialties.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {specialties.map((s) => {
                      const spec = s.specialties as unknown as { id: string; name: string };
                      return (
                        <Badge key={spec.id} variant="muted">
                          {spec.name}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(tools?.length || equipment?.length || languages?.length) ? (
            <Card>
              <CardHeader>
                <CardTitle>Requisitos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {tools && tools.length > 0 && (
                  <div>
                    <p className="mb-2 font-medium flex items-center gap-2">
                      <Wrench className="h-4 w-4" /> Herramientas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {tools.map((t, i) => (
                        <Badge key={i} variant="muted">
                          {(t.tools as unknown as { name: string }).name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {equipment && equipment.length > 0 && (
                  <div>
                    <p className="mb-2 font-medium">Equipo necesario</p>
                    <div className="flex flex-wrap gap-1.5">
                      {equipment.map((e, i) => (
                        <Badge key={i} variant="muted">
                          {(e.equipment as unknown as { name: string }).name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {languages && languages.length > 0 && (
                  <div>
                    <p className="mb-2 font-medium">Idiomas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {languages.map((l, i) => (
                        <Badge key={i} variant="muted">
                          {(l.languages as unknown as { name: string }).name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {posting.requires_own_equipment && (
                  <p className="text-muted-foreground">Se requiere equipo propio</p>
                )}
                {posting.requires_vehicle && (
                  <p className="text-muted-foreground">Se requiere vehículo propio</p>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 pt-6 text-sm">
              {(posting.location_city || posting.location_province || posting.location_region) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Ubicación</p>
                    <p className="text-muted-foreground">
                      {formatSpanishLocation({
                        city: posting.location_city,
                        province: posting.location_province,
                        autonomousCommunity: posting.location_region,
                      })}
                    </p>
                  </div>
                </div>
              )}
              {(posting.project_start_date || posting.project_end_date) && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Fechas del proyecto</p>
                    <p className="text-muted-foreground">
                      {posting.project_start_date && formatDate(posting.project_start_date)}
                      {posting.project_end_date &&
                        ` — ${formatDate(posting.project_end_date)}`}
                    </p>
                  </div>
                </div>
              )}
              {posting.schedule && (
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Horario</p>
                    <p className="text-muted-foreground">{posting.schedule}</p>
                  </div>
                </div>
              )}
              {posting.duration && (
                <div className="flex items-start gap-3">
                  <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Duración</p>
                    <p className="text-muted-foreground">{posting.duration}</p>
                  </div>
                </div>
              )}
              {posting.experience_required && (
                <div>
                  <p className="font-medium">Experiencia requerida</p>
                  <p className="text-muted-foreground">
                    {EXPERIENCE_LEVEL_LABELS[posting.experience_required as ExperienceLevel]}
                  </p>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Plazas</p>
                  <p className="text-muted-foreground">{posting.positions_count}</p>
                </div>
              </div>
              {(posting.budget_max || posting.salary_max) && (
                <div>
                  <p className="font-medium">Compensación</p>
                  <p className="text-lg font-semibold text-primary">
                    {posting.budget_max
                      ? `hasta ${formatCurrency(posting.budget_max, posting.currency)}`
                      : posting.salary_max
                        ? `hasta ${formatCurrency(posting.salary_max, posting.currency)}`
                        : null}
                  </p>
                  {(posting.budget_min || posting.salary_min) && (
                    <p className="text-xs text-muted-foreground">
                      desde{" "}
                      {formatCurrency(
                        (posting.budget_min || posting.salary_min)!,
                        posting.currency
                      )}
                    </p>
                  )}
                </div>
              )}
              {posting.application_deadline && (
                <div>
                  <p className="font-medium">Fecha límite</p>
                  <p className="text-muted-foreground">
                    {formatDate(posting.application_deadline)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {match && <MatchScoreCard match={match} />}

          {!isAuthor && posting.status === "open" && user && (
            <Card>
              <CardHeader>
                <CardTitle>Candidatura</CardTitle>
              </CardHeader>
              <CardContent>
                {applications ? (
                  <div className="text-center">
                    <Badge variant="primary" className="mb-3">
                      Candidatura enviada — {applications.status}
                    </Badge>
                    <Link href={`/mensajes?oferta=${id}`}>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="h-4 w-4" />
                        Enviar mensaje
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <ApplicationForm jobPostingId={id} />
                )}
              </CardContent>
            </Card>
          )}

          {isAuthor && (
            <Link href={`/dashboard/ofertas/${id}`}>
              <Button variant="outline" className="w-full">
                Gestionar candidaturas
              </Button>
            </Link>
          )}

          {!user && posting.status === "open" && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Inicia sesión para presentar tu candidatura
                </p>
                <Link href={authModalLoginUrl(`/ofertas/${id}`)}>
                  <Button className="w-full">Iniciar sesión</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
