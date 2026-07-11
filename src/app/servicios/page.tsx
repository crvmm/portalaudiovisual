import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { WORK_MODALITY_LABELS, type WorkModality, type PricingType } from "@/types";
import { formatCurrency } from "@/lib/utils";

const PRICING_LABELS: Record<PricingType, string> = {
  fixed: "Precio fijo",
  hourly: "Por hora",
  estimate: "Presupuesto orientativo",
};

export default async function ServicesPage() {
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("services")
    .select(`
      *,
      professional_profiles:professional_id (
        id,
        location_city,
        profiles:id (display_name, avatar_url)
      ),
      categories:category_id (name)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Servicios audiovisuales</h1>
      <p className="mt-2 text-muted-foreground">
        Servicios ofrecidos por profesionales autónomos
      </p>

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
                className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
              >
                {category && (
                  <span className="text-xs font-medium text-primary">
                    {category.name}
                  </span>
                )}
                <h2 className="mt-1 font-semibold">{service.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {service.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    {service.price_amount ? (
                      <span className="font-semibold">
                        {formatCurrency(service.price_amount, service.currency)}
                      </span>
                    ) : service.price_min ? (
                      <span className="text-sm">
                        {formatCurrency(service.price_min, service.currency)}
                        {service.price_max && ` — ${formatCurrency(service.price_max, service.currency)}`}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {PRICING_LABELS[service.pricing_type as PricingType]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>{prof?.profiles?.display_name}</span>
                  {prof?.location_city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {prof.location_city}
                    </span>
                  )}
                  {service.estimated_duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {service.estimated_duration}
                    </span>
                  )}
                  <span>
                    {WORK_MODALITY_LABELS[service.work_modality as WorkModality]}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No hay servicios publicados todavía.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Si ofreces servicios audiovisuales, publícalos desde tu perfil profesional.
          </p>
          <Link
            href="/?auth=register&tipo=professional"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Crear perfil profesional →
          </Link>
        </div>
      )}
    </div>
  );
}
