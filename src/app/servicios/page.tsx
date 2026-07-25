import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Clock, Plus } from "lucide-react";
import { WORK_MODALITY_LABELS, type WorkModality, type PricingType } from "@/types";
import { formatCurrency } from "@/lib/utils";

const PRICING_LABELS: Record<PricingType, string> = {
  fixed: "Precio fijo",
  hourly: "Por hora",
  estimate: "Presupuesto orientativo",
};

export default async function ServicesPage() {
  const supabase = await createClient();

  const [
    { data: services },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase
      .from("services")
      .select(`
      *,
      professional_profiles!professional_id (
        id,
        location_city,
        profiles!professional_profiles_id_fkey (display_name, avatar_url)
      ),
      categories:category_id (name)
    `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase.auth.getUser(),
  ]);

  let profileType: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_type")
      .eq("id", user.id)
      .single();
    profileType = profile?.profile_type ?? null;
  }

  const isProfessional = profileType === "professional";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Servicios audiovisuales</h1>
          <p className="mt-2 text-muted-foreground">
            Servicios ofrecidos por profesionales autónomos
          </p>
        </div>
        {isProfessional && (
          <Link
            href="/dashboard/servicios/nuevo"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Publicar servicio
          </Link>
        )}
      </div>

      {services && services.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const prof = service.professional_profiles as unknown as {
              id: string;
              location_city: string | null;
              profiles: { display_name: string };
            };
            const category = service.categories as unknown as { name: string } | null;

            return (
              <Link
                key={service.id}
                href={`/servicios/${service.id}`}
                className="group flex flex-col rounded-md border border-border bg-card p-5 transition-[border-color,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-stage/35 hover:bg-surface"
              >
                {category && (
                  <span className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-stage">
                    {category.name}
                  </span>
                )}
                <h2 className="mt-1.5 text-base font-semibold tracking-tight group-hover:text-primary">
                  {service.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {service.description}
                </p>
                <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-3">
                  <div>
                    {service.price_amount ? (
                      <span className="text-lg font-semibold tabular-nums text-primary">
                        {formatCurrency(service.price_amount, service.currency)}
                      </span>
                    ) : service.price_min ? (
                      <span className="text-sm font-semibold tabular-nums">
                        {formatCurrency(service.price_min, service.currency)}
                        {service.price_max &&
                          ` – ${formatCurrency(service.price_max, service.currency)}`}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {PRICING_LABELS[service.pricing_type as PricingType]}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {WORK_MODALITY_LABELS[service.work_modality as WorkModality]}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{prof?.profiles?.display_name}</span>
                  {prof?.location_city && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {prof.location_city}
                    </span>
                  )}
                  {service.estimated_duration && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {service.estimated_duration}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No hay servicios publicados todavía.</p>
          {isProfessional ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Sé el primero: publica lo que ofreces desde tu panel.
              </p>
              <Link
                href="/dashboard/servicios/nuevo"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Publicar un servicio
              </Link>
              <p className="mt-3">
                <Link
                  href="/dashboard/servicios"
                  className="text-sm text-muted-foreground hover:text-primary hover:underline"
                >
                  Ver mis servicios →
                </Link>
              </p>
            </>
          ) : user ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Cuando los profesionales publiquen servicios, aparecerán aquí.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Si ofreces servicios audiovisuales, crea una cuenta de profesional para
                publicarlos.
              </p>
              <Link
                href="/?auth=register&tipo=professional"
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                Crear perfil profesional →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
