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
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { RatingStars } from "@/components/ui/rating";
import { AvailabilityCalendar } from "@/components/calendar/availability-calendar";
import {
  WORK_MODALITY_LABELS,
  JOB_SEEKING_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  type WorkModality,
  type JobSeekingType,
  type ExperienceLevel,
} from "@/types";
import { formatCurrency } from "@/lib/utils";

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
      .select("id, title, pricing_type, price_amount, currency, work_modality")
      .eq("professional_id", id)
      .eq("is_active", true)
      .limit(6),
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Profesionales", href: "/profesionales" },
          { label: profile.display_name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-start gap-6">
            <Avatar src={profile.avatar_url} name={profile.display_name} size="xl" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                {profile.is_verified && <Badge variant="primary">Verificado</Badge>}
                {professional?.is_available && <Badge variant="success">Disponible</Badge>}
              </div>
              {professional?.headline && (
                <p className="mt-1 text-lg text-muted-foreground">{professional.headline}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {professional?.location_city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {professional.location_city}
                    {professional.location_region && `, ${professional.location_region}`}
                  </span>
                )}
                {professional?.years_experience && (
                  <span>{professional.years_experience} años de experiencia</span>
                )}
                {professional?.experience_level && (
                  <span>{EXPERIENCE_LEVEL_LABELS[professional.experience_level as ExperienceLevel]}</span>
                )}
                {avgRating > 0 && (
                  <RatingStars rating={avgRating} showValue />
                )}
              </div>
              {professional?.work_modality && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {professional.work_modality.map((m: WorkModality) => (
                    <Badge key={m} variant="muted">
                      {WORK_MODALITY_LABELS[m]}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {professional?.bio && (
            <Card>
              <CardHeader>
                <CardTitle>Presentación</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {professional.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Categories */}
          {categories && categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Especialidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const cat = c.categories as unknown as { id: string; name: string; slug: string };
                    return (
                      <Link key={cat.id} href={`/profesionales?categoria=${cat.slug}`}>
                        <Badge variant="primary" className="cursor-pointer hover:opacity-80">
                          {cat.name}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Portfolio */}
          {portfolio && portfolio.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Porfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="group overflow-hidden rounded-lg border border-border"
                    >
                      {item.thumbnail_url || item.media_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnail_url || item.media_url!}
                          alt={item.title}
                          className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex aspect-video items-center justify-center bg-secondary text-muted-foreground">
                          {item.media_type}
                        </div>
                      )}
                      <div className="p-3">
                        <h4 className="font-medium">{item.title}</h4>
                        {item.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {experiences && experiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Experiencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-primary/30 pl-4">
                    <h4 className="font-medium">{exp.position}</h4>
                    <p className="text-sm text-primary">{exp.company_name}</p>
                    {exp.project_name && (
                      <p className="text-sm text-muted-foreground">{exp.project_name}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {exp.start_date} — {exp.is_current ? "Actualidad" : exp.end_date}
                    </p>
                    {exp.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{exp.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {educations && educations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Formación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {educations.map((edu) => (
                  <div key={edu.id}>
                    <h4 className="font-medium">{edu.institution}</h4>
                    <p className="text-sm text-muted-foreground">
                      {[edu.degree, edu.field_of_study].filter(Boolean).join(" — ")}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <Link href={`/mensajes?contactar=${id}`}>
                <Button className="w-full">
                  <MessageSquare className="h-4 w-4" />
                  Contactar
                </Button>
              </Link>
              {professional?.cv_url && (
                <a href={professional.cv_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4" />
                    Ver currículum
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>

          {/* Rates */}
          {(professional?.hourly_rate_min || professional?.daily_rate_min) && (
            <Card>
              <CardHeader>
                <CardTitle>Tarifas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {professional.hourly_rate_min && (
                  <p>
                    <span className="text-muted-foreground">Por hora: </span>
                    {formatCurrency(professional.hourly_rate_min, professional.currency)}
                    {professional.hourly_rate_max &&
                      ` — ${formatCurrency(professional.hourly_rate_max, professional.currency)}`}
                  </p>
                )}
                {professional.daily_rate_min && (
                  <p>
                    <span className="text-muted-foreground">Por día: </span>
                    {formatCurrency(professional.daily_rate_min, professional.currency)}
                    {professional.daily_rate_max &&
                      ` — ${formatCurrency(professional.daily_rate_max, professional.currency)}`}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Seeking */}
          {seeking && seeking.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Busca
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {seeking.map((s) => (
                    <li key={s.seeking_type}>
                      {JOB_SEEKING_LABELS[s.seeking_type as JobSeekingType]}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tools */}
          {tools && tools.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Herramientas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {tools.map((t, i) => {
                    const tool = t.tools as unknown as { name: string };
                    return (
                      <Badge key={i} variant="muted">
                        {tool.name}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Idiomas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {languages.map((l, i) => {
                    const lang = l.languages as unknown as { name: string };
                    return (
                      <li key={i} className="flex justify-between">
                        <span>{lang.name}</span>
                        <span className="text-muted-foreground capitalize">{l.proficiency}</span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Links */}
          {links && links.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Enlaces
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
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
              </CardContent>
            </Card>
          )}

          {/* Availability preview */}
          {availability && availability.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Disponibilidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AvailabilityCalendar
                  slots={availability}
                  readOnly
                  compact
                />
              </CardContent>
            </Card>
          )}

          {/* Services */}
          {services && services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Servicios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/servicios/${service.id}`}
                    className="block rounded-lg border border-border p-3 text-sm transition-colors hover:border-primary/50"
                  >
                    <p className="font-medium">{service.title}</p>
                    {service.price_amount && (
                      <p className="text-muted-foreground">
                        {formatCurrency(service.price_amount, service.currency)}
                      </p>
                    )}
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
