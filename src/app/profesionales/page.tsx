import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Star, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProfessionalsFilterForm } from "@/components/professionals/professionals-filter-form";
import { EXPERIENCE_LEVEL_LABELS, JOB_SEEKING_LABELS, type ExperienceLevel, type JobSeekingType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { formatSpanishLocation } from "@/lib/spain-territories";

interface SearchParams {
  categoria?: string;
  ciudad?: string;
  q?: string;
}

interface ProfessionalListItem {
  id: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  location_city: string | null;
  location_province: string | null;
  location_region: string | null;
  years_experience: number | null;
  experience_level: string | null;
  hourly_rate_min: number | null;
  is_available: boolean;
  specialties: string[];
  seeking_types: JobSeekingType[];
  avg_rating: number;
  review_count: number;
}

export default async function ProfessionalsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let categoryId: string | undefined;
  if (params.categoria?.trim()) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.categoria.trim())
      .single();
    categoryId = cat?.id;
  }

  let professionals: ProfessionalListItem[] = [];

  let categoryProfessionalIds: string[] | null = null;
  if (categoryId) {
    const { data: categoryLinks } = await supabase
      .from("professional_categories")
      .select("professional_id")
      .eq("category_id", categoryId);

    categoryProfessionalIds = (categoryLinks ?? []).map((row) => row.professional_id);
    if (categoryProfessionalIds.length === 0) {
      professionals = [];
    }
  }

  if (!categoryId || (categoryProfessionalIds && categoryProfessionalIds.length > 0)) {
    let query = supabase
      .from("professional_profiles")
      .select(`
        id,
        headline,
        bio,
        location_city,
        location_province,
        location_region,
        years_experience,
        experience_level,
        hourly_rate_min,
        is_available,
        professional_categories (
          categories (name)
        ),
        professional_job_seeking (
          seeking_type
        ),
        profiles!inner (
          display_name,
          is_active
        )
      `)
      .eq("profiles.is_active", true);

    if (categoryProfessionalIds) {
      query = query.in("id", categoryProfessionalIds);
    }

    if (params.ciudad?.trim()) {
      query = query.ilike("location_city", `%${params.ciudad.trim()}%`);
    }

    if (params.q?.trim()) {
      const term = params.q.trim();
      query = query.or(`headline.ilike.%${term}%,profiles.display_name.ilike.%${term}%`);
    }

    const { data, error } = await query.limit(24);

    if (!error && data) {
      professionals = data.map((row) => {
        const profile = row.profiles as unknown as { display_name: string };
        const categoryRows = row.professional_categories as unknown as {
          categories: { name: string } | null;
        }[];
        const seekingRows = row.professional_job_seeking as unknown as {
          seeking_type: JobSeekingType;
        }[];

        return {
          id: row.id,
          display_name: profile.display_name,
          headline: row.headline,
          bio: row.bio,
          location_city: row.location_city,
          location_province: row.location_province,
          location_region: row.location_region,
          years_experience: row.years_experience,
          experience_level: row.experience_level,
          hourly_rate_min: row.hourly_rate_min,
          is_available: row.is_available,
          specialties: categoryRows
            .map((item) => item.categories?.name)
            .filter((name): name is string => Boolean(name)),
          seeking_types: seekingRows.map((item) => item.seeking_type),
          avg_rating: 0,
          review_count: 0,
        };
      });
    }
  }

  const hasFilters = Boolean(params.q || params.ciudad || params.categoria);

  const [
    { data: categories },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .eq("status", "active")
      .is("parent_id", null)
      .order("sort_order"),
    supabase.auth.getUser(),
  ]);

  let isProfessional = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_type")
      .eq("id", user.id)
      .single();
    isProfessional = profile?.profile_type === "professional";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Profesionales</h1>
          <p className="mt-2 text-muted-foreground">
            Talento por especialidad, ciudad y disponibilidad
          </p>
        </div>
        {isProfessional ? (
          <Link
            href="/dashboard/perfil"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Editar mi perfil
          </Link>
        ) : !user ? (
          <Link
            href="/?auth=register&tipo=professional"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Crear perfil profesional
          </Link>
        ) : null}
      </div>

      <div className="mt-10 flex flex-col gap-10 lg:flex-row">
        <aside className="shrink-0 lg:w-72">
          <ProfessionalsFilterForm
            initialQuery={params.q}
            initialCity={params.ciudad}
            initialCategory={params.categoria}
            categories={(categories ?? []).map((cat) => ({
              value: cat.slug,
              label: cat.name,
            }))}
          />
        </aside>

        <div className="min-w-0 flex-1">
          {professionals.length > 0 ? (
            <div className="space-y-4">
              {professionals.map((prof) => (
                <Link
                  key={prof.id}
                  href={`/profesionales/${prof.id}`}
                  className="block rounded-xl border border-border bg-card p-6 transition-colors hover:border-signal/35"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {prof.is_available ? (
                          <Badge variant="success">Disponible</Badge>
                        ) : (
                          <Badge variant="muted">No disponible</Badge>
                        )}
                        {prof.experience_level && (
                          <Badge variant="signal">
                            {EXPERIENCE_LEVEL_LABELS[prof.experience_level as ExperienceLevel]}
                          </Badge>
                        )}
                      </div>
                      <h2 className="mt-2 text-lg font-semibold">{prof.display_name}</h2>
                      {(prof.headline || prof.bio) && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {prof.headline ?? prof.bio}
                        </p>
                      )}
                      {prof.specialties.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {prof.specialties.map((name) => (
                            <Badge key={name} variant="primary">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {prof.seeking_types.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Busca:</span>
                          {prof.seeking_types.map((type) => (
                            <Badge key={type} variant="muted">
                              {JOB_SEEKING_LABELS[type]}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {prof.hourly_rate_min && (
                      <div className="text-right text-sm">
                        <span className="text-muted-foreground">Tarifa</span>
                        <p className="font-semibold">
                          desde {formatCurrency(prof.hourly_rate_min)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {(prof.location_city || prof.location_province || prof.location_region) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {formatSpanishLocation({
                          city: prof.location_city,
                          province: prof.location_province,
                          autonomousCommunity: prof.location_region,
                        })}
                      </span>
                    )}
                    {prof.years_experience != null && prof.years_experience > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {prof.years_experience} años de experiencia
                      </span>
                    )}
                    {prof.avg_rating > 0 && (
                      <span className="flex items-center gap-1 text-primary">
                        <Star className="h-3 w-3 fill-current" />
                        {prof.avg_rating}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">
                {hasFilters
                  ? "Ningún profesional coincide con estos filtros."
                  : "Aún no hay profesionales publicados en la plataforma."}
              </p>
              {hasFilters ? (
                <Link href="/profesionales" className="mt-4 inline-block text-sm text-primary hover:underline">
                  Quitar filtros
                </Link>
              ) : (
                <Link
                  href="/?auth=register&tipo=professional"
                  className="mt-4 inline-block text-sm text-primary hover:underline"
                >
                  Sé de los primeros en crear un perfil →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
