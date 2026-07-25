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
import { getPublicProfileUrl } from "@/lib/profile-urls";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const locationLabel = formatSpanishLocation({
    city: posting.location_city,
    province: posting.location_province,
    autonomousCommunity: posting.location_region,
  });

  const facts = [
    locationLabel ? { label: "Ubicación", value: locationLabel, icon: "map" as const } : null,
    posting.project_start_date || posting.project_end_date
      ? {
          label: "Fechas",
          value: [
            posting.project_start_date && formatDate(posting.project_start_date),
            posting.project_end_date && formatDate(posting.project_end_date),
          ]
            .filter(Boolean)
            .join(" – "),
          icon: "calendar" as const,
        }
      : null,
    posting.schedule
      ? { label: "Horario", value: posting.schedule, icon: "clock" as const }
      : null,
    posting.duration
      ? { label: "Duración", value: posting.duration, icon: "briefcase" as const }
      : null,
    {
      label: "Plazas",
      value: String(posting.positions_count),
      icon: "users" as const,
    },
  ].filter(Boolean) as {
    label: string;
    value: string;
    icon: "map" | "calendar" | "clock" | "briefcase" | "users";
  }[];

  const compensation =
    posting.budget_max || posting.salary_max
      ? {
          max: formatCurrency(
            (posting.budget_max || posting.salary_max)!,
            posting.currency
          ),
          min:
            posting.budget_min || posting.salary_min
              ? formatCurrency(
                  (posting.budget_min || posting.salary_min)!,
                  posting.currency
                )
              : null,
        }
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Ofertas", href: "/ofertas" },
          { label: posting.title },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="min-w-0 space-y-8">
          <header>
            <div className="flex flex-wrap items-center gap-2">
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

            <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {posting.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Publicada por{" "}
              <Link
                href={getPublicProfileUrl(author.profile_type, author.id)}
                className="font-medium text-foreground hover:text-primary"
              >
                {author.display_name}
              </Link>
              <span className="text-border"> · </span>
              {formatDate(posting.created_at)}
            </p>

            {facts.length > 0 && (
              <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {facts.map((fact) => (
                  <div key={fact.label} className="rounded-md bg-surface px-3.5 py-3">
                    <dt className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 flex items-start gap-1.5 text-sm font-medium text-foreground">
                      {fact.icon === "map" && (
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      {fact.icon === "calendar" && (
                        <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      {fact.icon === "clock" && (
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      {fact.icon === "briefcase" && (
                        <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      {fact.icon === "users" && (
                        <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span>{fact.value}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </header>

          <section>
            <h2 className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stage">
              Descripción
            </h2>
            <p className="mt-3 max-w-prose whitespace-pre-wrap text-base leading-relaxed text-foreground">
              {posting.description}
            </p>
          </section>

          {categories && categories.length > 0 && (
            <section>
              <h2 className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stage">
                Perfil buscado
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
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
                <div className="mt-2.5 flex flex-wrap gap-2">
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
              {posting.experience_required && (
                <p className="mt-3 text-sm text-foreground">
                  <span className="text-muted-foreground">Experiencia: </span>
                  {
                    EXPERIENCE_LEVEL_LABELS[
                      posting.experience_required as ExperienceLevel
                    ]
                  }
                </p>
              )}
            </section>
          )}

          {(tools?.length || equipment?.length || languages?.length || posting.requires_own_equipment || posting.requires_vehicle) ? (
            <section className="divide-y divide-border border-y border-border">
              {tools && tools.length > 0 && (
                <div className="grid gap-2 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                  <h3 className="flex items-center gap-1.5 font-mono text-[0.6875rem] font-medium uppercase leading-5 tracking-[0.12em] text-muted-foreground">
                    <Wrench className="h-3.5 w-3.5" />
                    Herramientas
                  </h3>
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
                <div className="grid gap-2 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                  <h3 className="font-mono text-[0.6875rem] font-medium uppercase leading-5 tracking-[0.12em] text-muted-foreground">
                    Equipo
                  </h3>
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
                <div className="grid gap-2 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                  <h3 className="font-mono text-[0.6875rem] font-medium uppercase leading-5 tracking-[0.12em] text-muted-foreground">
                    Idiomas
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {languages.map((l, i) => (
                      <Badge key={i} variant="muted">
                        {(l.languages as unknown as { name: string }).name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(posting.requires_own_equipment || posting.requires_vehicle) && (
                <div className="grid gap-2 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                  <h3 className="font-mono text-[0.6875rem] font-medium uppercase leading-5 tracking-[0.12em] text-muted-foreground">
                    Otros
                  </h3>
                  <ul className="space-y-1 text-sm leading-5 text-foreground">
                    {posting.requires_own_equipment && <li>Se requiere equipo propio</li>}
                    {posting.requires_vehicle && <li>Se requiere vehículo propio</li>}
                  </ul>
                </div>
              )}
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-md border border-border bg-card p-5">
            {compensation ? (
              <>
                <p className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Compensación
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-primary">
                  hasta {compensation.max}
                </p>
                {compensation.min && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    desde {compensation.min}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Compensación
                </p>
                <p className="mt-2 text-lg font-medium">A consultar</p>
              </>
            )}

            {posting.application_deadline && (
              <p className="mt-4 border-t border-border pt-4 text-sm">
                <span className="text-muted-foreground">Fecha límite: </span>
                <span className="font-medium">
                  {formatDate(posting.application_deadline)}
                </span>
              </p>
            )}

            {isAuthor && (
              <Link href={`/dashboard/ofertas/${id}`} className="mt-5 block">
                <Button variant="outline" className="w-full">
                  Gestionar candidaturas
                </Button>
              </Link>
            )}

            {!isAuthor && posting.status === "open" && user && (
              <div className="mt-5 border-t border-border pt-5">
                {applications ? (
                  <div>
                    <Badge variant="primary" className="mb-3">
                      Candidatura enviada: {applications.status}
                    </Badge>
                    <Link
                      href={`/mensajes?contactar=${posting.author_id}&oferta=${id}`}
                    >
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="h-4 w-4" />
                        Enviar mensaje
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <ApplicationForm jobPostingId={id} />
                )}
              </div>
            )}

            {!user && posting.status === "open" && (
              <div className="mt-5 border-t border-border pt-5">
                <p className="mb-3 text-sm text-muted-foreground">
                  Inicia sesión para presentar tu candidatura
                </p>
                <Link href={authModalLoginUrl(`/ofertas/${id}`)}>
                  <Button className="w-full">Iniciar sesión</Button>
                </Link>
              </div>
            )}
          </div>

          {match && <MatchScoreCard match={match} />}
        </aside>
      </div>
    </div>
  );
}
