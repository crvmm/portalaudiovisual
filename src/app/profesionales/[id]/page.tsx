import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Globe,
  Briefcase,
  MessageSquare,
  ExternalLink,
  Wrench,
  Languages,
  Calendar,
  ArrowRight,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { RatingStars } from "@/components/ui/rating";
import { AvailabilityCalendar } from "@/components/calendar/availability-calendar";
import {
  WORK_MODALITY_LABELS,
  JOB_SEEKING_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  PRICING_TYPE_LABELS,
  type WorkModality,
  type JobSeekingType,
  type ExperienceLevel,
  type PricingType,
} from "@/types";
import { formatCurrency } from "@/lib/utils";
import { formatSpanishLocation } from "@/lib/spain-territories";

export default async function ProfessionalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("profile_type", "professional")
    .single();

  if (!profile) notFound();

  const { data: professional } = await supabase
    .from("professional_profiles")
    .select("*")
    .eq("id", id)
    .single();

  const [
    { data: categories },
    { data: portfolio },
    { data: services },
    { data: experiences },
    { data: educations },
    { data: links },
    { data: seeking },
    { data: languages },
    { data: tools },
    { data: availability },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from("professional_categories")
      .select("categories(id, name, slug)")
      .eq("professional_id", id),
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("professional_id", id)
      .order("sort_order"),
    supabase
      .from("services")
      .select(
        "id, title, pricing_type, price_amount, price_min, price_max, currency, work_modality, estimated_duration"
      )
      .eq("professional_id", id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("work_experiences")
      .select("*")
      .eq("professional_id", id)
      .order("sort_order"),
    supabase.from("educations").select("*").eq("professional_id", id).order("sort_order"),
    supabase.from("professional_links").select("*").eq("professional_id", id).order("sort_order"),
    supabase.from("professional_job_seeking").select("seeking_type").eq("professional_id", id),
    supabase
      .from("professional_languages")
      .select("proficiency, languages(name)")
      .eq("professional_id", id),
    supabase
      .from("professional_tools")
      .select("proficiency, tools(name)")
      .eq("professional_id", id),
    supabase
      .from("availability_slots")
      .select("*")
      .eq("professional_id", id)
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date")
      .limit(60),
    supabase.from("reviews").select("overall_rating").eq("reviewee_id", id),
  ]);

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length
      : 0;

  const locationLabel = formatSpanishLocation({
    city: professional?.location_city,
    province: professional?.location_province,
    autonomousCommunity: professional?.location_region,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Profesionales", href: "/profesionales" },
          { label: profile.display_name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18.5rem] lg:items-start">
        <div className="min-w-0 space-y-10">
          <header className="flex flex-wrap items-start gap-5">
            <Avatar src={profile.avatar_url} name={profile.display_name} size="xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight">
                  {profile.display_name}
                </h1>
                {profile.is_verified && <Badge variant="primary">Verificado</Badge>}
                {professional?.is_available && (
                  <Badge variant="success">Disponible</Badge>
                )}
              </div>
              {professional?.headline && (
                <p className="mt-1.5 text-base text-muted-foreground">
                  {professional.headline}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                {locationLabel && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {locationLabel}
                  </span>
                )}
                {professional?.years_experience != null && (
                  <span>{professional.years_experience} años de experiencia</span>
                )}
                {professional?.experience_level && (
                  <span>
                    {
                      EXPERIENCE_LEVEL_LABELS[
                        professional.experience_level as ExperienceLevel
                      ]
                    }
                  </span>
                )}
                {avgRating > 0 && <RatingStars rating={avgRating} showValue />}
              </div>
              {professional?.work_modality && professional.work_modality.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {professional.work_modality.map((m: WorkModality) => (
                    <Badge key={m} variant="muted">
                      {WORK_MODALITY_LABELS[m]}
                    </Badge>
                  ))}
                </div>
              )}
              {categories && categories.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {categories.map((c) => {
                    const cat = c.categories as unknown as {
                      id: string;
                      name: string;
                      slug: string;
                    };
                    return (
                      <Link key={cat.id} href={`/profesionales?categoria=${cat.slug}`}>
                        <Badge
                          variant="primary"
                          className="cursor-pointer transition-opacity hover:opacity-80"
                        >
                          {cat.name}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </header>

          {professional?.bio && (
            <section>
              <h2 className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stage">
                Presentación
              </h2>
              <p className="mt-3 max-w-prose whitespace-pre-wrap text-base leading-relaxed text-foreground">
                {professional.bio}
              </p>
            </section>
          )}

          {services && services.length > 0 && (
            <section>
              <div>
                <h2 className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stage">
                  Servicios
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Lo que puedes contratar directamente
                </p>
              </div>

              <ul className="mt-4 divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
                {services.map((service) => {
                  const price = service.price_amount
                    ? formatCurrency(service.price_amount, service.currency)
                    : service.price_min
                      ? `${formatCurrency(service.price_min, service.currency)}${
                          service.price_max
                            ? ` – ${formatCurrency(service.price_max, service.currency)}`
                            : ""
                        }`
                      : PRICING_TYPE_LABELS[service.pricing_type as PricingType];

                  return (
                    <li key={service.id}>
                      <Link
                        href={`/servicios/${service.id}`}
                        className="group flex items-center gap-4 px-4 py-3.5 transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-surface"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground group-hover:text-primary">
                            {service.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>
                              {
                                WORK_MODALITY_LABELS[
                                  service.work_modality as WorkModality
                                ]
                              }
                            </span>
                            {service.estimated_duration && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {service.estimated_duration}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-base font-semibold tabular-nums text-primary">
                            {price}
                          </p>
                          <p className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] text-muted-foreground group-hover:text-primary">
                            Ver
                            <ArrowRight className="h-3 w-3" />
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {portfolio && portfolio.length > 0 && (
            <section>
              <h2 className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stage">
                Portfolio
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="group overflow-hidden rounded-md border border-border bg-card"
                  >
                    {item.thumbnail_url || item.media_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail_url || item.media_url!}
                        alt={item.title}
                        className="aspect-video w-full object-cover transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-surface text-sm text-muted-foreground">
                        {item.media_type}
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="text-sm font-medium">{item.title}</h3>
                      {item.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {experiences && experiences.length > 0 && (
            <section>
              <h2 className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stage">
                Experiencia
              </h2>
              <ol className="mt-4 divide-y divide-border border-y border-border">
                {experiences.map((exp) => (
                  <li key={exp.id} className="py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-medium text-foreground">{exp.position}</h3>
                      <p className="font-mono text-[0.65rem] text-muted-foreground">
                        {exp.start_date} –{" "}
                        {exp.is_current ? "Actualidad" : exp.end_date}
                      </p>
                    </div>
                    <p className="mt-0.5 text-sm text-primary">{exp.company_name}</p>
                    {exp.project_name && (
                      <p className="text-sm text-muted-foreground">{exp.project_name}</p>
                    )}
                    {exp.description && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {exp.description}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {educations && educations.length > 0 && (
            <section>
              <h2 className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stage">
                Formación
              </h2>
              <ul className="mt-4 space-y-3">
                {educations.map((edu) => (
                  <li key={edu.id}>
                    <h3 className="font-medium">{edu.institution}</h3>
                    <p className="text-sm text-muted-foreground">
                      {[edu.degree, edu.field_of_study].filter(Boolean).join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-md border border-border bg-card p-4">
            <Link href={`/mensajes?contactar=${id}`}>
              <Button className="w-full">
                <MessageSquare className="h-4 w-4" />
                Contactar
              </Button>
            </Link>
            {professional?.cv_url && (
              <a
                href={professional.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block"
              >
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4" />
                  Ver currículum
                </Button>
              </a>
            )}
          </div>

          {(professional?.hourly_rate_min || professional?.daily_rate_min) && (
            <div className="rounded-md border border-border bg-card p-4">
              <p className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Tarifas
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                {professional.hourly_rate_min && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Por hora</dt>
                    <dd className="font-medium tabular-nums">
                      {formatCurrency(
                        professional.hourly_rate_min,
                        professional.currency
                      )}
                      {professional.hourly_rate_max &&
                        ` – ${formatCurrency(professional.hourly_rate_max, professional.currency)}`}
                    </dd>
                  </div>
                )}
                {professional.daily_rate_min && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Por día</dt>
                    <dd className="font-medium tabular-nums">
                      {formatCurrency(
                        professional.daily_rate_min,
                        professional.currency
                      )}
                      {professional.daily_rate_max &&
                        ` – ${formatCurrency(professional.daily_rate_max, professional.currency)}`}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {seeking && seeking.length > 0 && (
            <div className="rounded-md border border-border bg-card p-4">
              <p className="flex items-center gap-1.5 font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <Briefcase className="h-3 w-3" />
                Busca
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {seeking.map((s) => (
                  <li key={s.seeking_type}>
                    {JOB_SEEKING_LABELS[s.seeking_type as JobSeekingType]}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tools && tools.length > 0 && (
            <div className="rounded-md border border-border bg-card p-4">
              <p className="flex items-center gap-1.5 font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <Wrench className="h-3 w-3" />
                Herramientas
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tools.map((t, i) => {
                  const tool = t.tools as unknown as { name: string };
                  return (
                    <Badge key={i} variant="muted">
                      {tool.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {languages && languages.length > 0 && (
            <div className="rounded-md border border-border bg-card p-4">
              <p className="flex items-center gap-1.5 font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <Languages className="h-3 w-3" />
                Idiomas
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {languages.map((l, i) => {
                  const lang = l.languages as unknown as { name: string };
                  return (
                    <li key={i} className="flex justify-between gap-2">
                      <span>{lang.name}</span>
                      <span className="capitalize text-muted-foreground">
                        {l.proficiency}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {links && links.length > 0 && (
            <div className="rounded-md border border-border bg-card p-4">
              <p className="flex items-center gap-1.5 font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <Globe className="h-3 w-3" />
                Enlaces
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {link.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {availability && availability.length > 0 && (
            <div className="rounded-md border border-border bg-card p-4">
              <p className="flex items-center gap-1.5 font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Disponibilidad
              </p>
              <div className="mt-3">
                <AvailabilityCalendar slots={availability} readOnly compact />
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
