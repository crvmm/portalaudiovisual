import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Globe,
  Briefcase,
  MessageSquare,
  ExternalLink,
  Building2,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  JOB_POSTING_TYPE_LABELS,
  TEAM_SIZE_LABELS,
  type JobPostingType,
} from "@/types";
import { formatDate } from "@/lib/utils";
import { formatSpanishLocation } from "@/lib/spain-territories";

export default async function CompanyDetailPage({
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
    .eq("profile_type", "company")
    .single();

  if (!profile) notFound();

  const [
    { data: company },
    { data: projects },
    { data: gallery },
    { data: socialLinks },
    { data: jobPostings },
  ] = await Promise.all([
    supabase.from("company_profiles").select("*").eq("id", id).single(),
    supabase
      .from("company_projects")
      .select("*")
      .eq("company_id", id)
      .order("sort_order"),
    supabase
      .from("company_gallery")
      .select("*")
      .eq("company_id", id)
      .order("sort_order"),
    supabase
      .from("company_social_links")
      .select("*")
      .eq("company_id", id),
    supabase
      .from("job_postings")
      .select("id, title, posting_type, created_at")
      .eq("author_id", id)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const displayName = company?.company_name ?? profile.display_name;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Ofertas", href: "/ofertas" },
          { label: displayName },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex flex-wrap items-start gap-6">
            <Avatar
              src={company?.logo_url ?? profile.avatar_url}
              name={displayName}
              size="xl"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{displayName}</h1>
                {profile.is_verified && <Badge variant="primary">Verificado</Badge>}
                {company?.is_audiovisual_sector && (
                  <Badge variant="signal">Sector audiovisual</Badge>
                )}
              </div>
              {company?.sector && (
                <p className="mt-1 text-lg text-muted-foreground">{company.sector}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {(company?.location_city ||
                  company?.location_province ||
                  company?.location_region) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {formatSpanishLocation({
                      city: company?.location_city,
                      province: company?.location_province,
                      autonomousCommunity: company?.location_region,
                    })}
                  </span>
                )}
                {company?.team_size && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {TEAM_SIZE_LABELS[company.team_size] ?? company.team_size}
                  </span>
                )}
              </div>
            </div>
          </div>

          {company?.description && (
            <Card>
              <CardHeader>
                <CardTitle>Sobre la empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {company.description}
                </p>
              </CardContent>
            </Card>
          )}

          {projects && projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Proyectos destacados</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="overflow-hidden rounded-lg border border-border"
                  >
                    {project.thumbnail_url || project.media_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.thumbnail_url ?? project.media_url ?? ""}
                        alt={project.title}
                        className="aspect-video w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-muted">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-medium">{project.title}</h3>
                      {project.year && (
                        <p className="mt-1 text-xs text-muted-foreground">{project.year}</p>
                      )}
                      {project.description && (
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {gallery && gallery.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Galería</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {gallery.map((item) => (
                  <figure key={item.id} className="overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.media_url}
                      alt={item.caption ?? "Imagen de la empresa"}
                      className="aspect-video w-full object-cover"
                    />
                    {item.caption && (
                      <figcaption className="p-2 text-xs text-muted-foreground">
                        {item.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <Link href={`/mensajes?contactar=${id}`}>
                <Button className="w-full">
                  <MessageSquare className="h-4 w-4" />
                  Contactar
                </Button>
              </Link>
              {company?.website_url && (
                <a
                  href={company.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4" />
                    Sitio web
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>

          {socialLinks && socialLinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Redes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {socialLinks.map((link) => (
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

          {jobPostings && jobPostings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Ofertas abiertas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {jobPostings.map((posting) => (
                  <Link
                    key={posting.id}
                    href={`/ofertas/${posting.id}`}
                    className="block rounded-lg border border-border p-3 transition-colors hover:border-primary/50 hover:bg-accent/30"
                  >
                    <p className="font-medium">{posting.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="muted">
                        {JOB_POSTING_TYPE_LABELS[posting.posting_type as JobPostingType]}
                      </Badge>
                      <span>{formatDate(posting.created_at)}</span>
                    </div>
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
