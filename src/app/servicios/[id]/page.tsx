import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { AvailabilityCalendar } from "@/components/calendar/availability-calendar";
import { RequestServiceButton } from "@/components/services/request-service-button";
import {
  ServiceOwnerRequestsPanel,
  type ServiceRequestListItem,
} from "@/components/services/service-owner-requests-panel";
import {
  WORK_MODALITY_LABELS,
  PRICING_TYPE_LABELS,
  type WorkModality,
  type PricingType,
  type ServiceRequestStatus,
} from "@/types";
import { formatCurrency } from "@/lib/utils";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: service } = await supabase
    .from("services")
    .select(`
      *,
      categories:category_id (name, slug),
      professional_profiles!professional_id (
        id,
        location_city,
        is_available,
        profiles!professional_profiles_id_fkey (display_name, avatar_url)
      )
    `)
    .eq("id", id)
    .single();

  if (!service) notFound();

  const { data: media } = await supabase
    .from("service_media")
    .select("*")
    .eq("service_id", id)
    .order("sort_order");

  const prof = service.professional_profiles as unknown as {
    id: string;
    location_city: string | null;
    is_available: boolean;
    profiles: { display_name: string; avatar_url: string | null };
  };

  const category = service.categories as unknown as { name: string; slug: string } | null;
  const isOwner = Boolean(user && user.id === prof.id);

  let ownerRequests: ServiceRequestListItem[] = [];
  if (isOwner) {
    const { data: requests } = await supabase
      .from("service_requests")
      .select(
        `
        id,
        conversation_id,
        status,
        date_start,
        date_end,
        profiles:requester_id (id, display_name, avatar_url)
      `
      )
      .eq("service_id", id)
      .order("created_at", { ascending: false });

    ownerRequests = (requests ?? []).map((row) => {
      const requester = row.profiles as unknown as {
        id: string;
        display_name: string;
        avatar_url: string | null;
      };
      return {
        id: row.id,
        conversation_id: row.conversation_id,
        status: row.status as ServiceRequestStatus,
        date_start: row.date_start,
        date_end: row.date_end,
        requester,
      };
    });
  }

  const { data: availability } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("professional_id", prof.id)
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date")
    .limit(60);

  const facts = [
    {
      label: "Modalidad",
      value: WORK_MODALITY_LABELS[service.work_modality as WorkModality],
    },
    service.estimated_duration
      ? { label: "Duración", value: service.estimated_duration }
      : null,
    service.location_city
      ? { label: "Ubicación", value: service.location_city }
      : prof.location_city
        ? { label: "Ubicación", value: prof.location_city }
        : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Servicios", href: "/servicios" },
          { label: service.title },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="min-w-0 space-y-8">
          {media && media.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-md border border-border bg-surface"
                >
                  {item.media_type === "video" ? (
                    <video
                      src={item.media_url}
                      controls
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.media_url}
                      alt=""
                      className="aspect-video w-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <header>
            {category && (
              <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stage">
                {category.name}
              </p>
            )}
            <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {service.title}
            </h1>

            {facts.length > 0 && (
              <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                {facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="rounded-md bg-surface px-3.5 py-3"
                  >
                    <dt className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-foreground">
                      {fact.label === "Duración" ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {fact.value}
                        </span>
                      ) : fact.label === "Ubicación" ? (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {fact.value}
                        </span>
                      ) : (
                        fact.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </header>

          <section>
            <h2 className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stage">
              Qué incluye
            </h2>
            <p className="mt-3 max-w-prose whitespace-pre-wrap text-base leading-relaxed text-foreground">
              {service.description}
            </p>
          </section>

          {(service.included_materials || service.terms) && (
            <section className="divide-y divide-border border-y border-border">
              {service.included_materials && (
                <div className="grid gap-2 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                  <h3 className="font-mono text-[0.6875rem] font-medium uppercase leading-5 tracking-[0.12em] text-muted-foreground">
                    Material
                  </h3>
                  <p className="text-sm leading-5 text-foreground">
                    {service.included_materials}
                  </p>
                </div>
              )}
              {service.terms && (
                <div className="grid gap-2 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                  <h3 className="font-mono text-[0.6875rem] font-medium uppercase leading-5 tracking-[0.12em] text-muted-foreground">
                    Condiciones
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-5 text-foreground">
                    {service.terms}
                  </p>
                </div>
              )}
            </section>
          )}

          {availability && availability.length > 0 && (
            <section>
              <h2 className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stage">
                Disponibilidad
              </h2>
              <div className="mt-4">
                <AvailabilityCalendar slots={availability} readOnly compact />
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-md border border-border bg-card p-5">
            <p className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {PRICING_TYPE_LABELS[service.pricing_type as PricingType]}
            </p>
            {service.price_amount ? (
              <p className="mt-2 text-3xl font-semibold tracking-tight text-primary">
                {formatCurrency(service.price_amount, service.currency)}
              </p>
            ) : service.price_min ? (
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {formatCurrency(service.price_min, service.currency)}
                {service.price_max &&
                  ` – ${formatCurrency(service.price_max, service.currency)}`}
              </p>
            ) : (
              <p className="mt-2 text-lg font-medium text-foreground">
                A consultar
              </p>
            )}

            {isOwner ? (
              <ServiceOwnerRequestsPanel serviceId={id} requests={ownerRequests} />
            ) : (
              <div className="mt-5">
                <RequestServiceButton
                  serviceId={id}
                  serviceTitle={service.title}
                  professionalId={prof.id}
                />
                <p className="mt-2.5 text-center text-xs text-muted-foreground">
                  Indica fechas y detalles. Llega como mensaje al profesional.
                </p>
              </div>
            )}
          </div>

          <Link
            href={`/profesionales/${prof.id}`}
            className="flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-stage/35 hover:bg-surface"
          >
            <Avatar
              src={prof.profiles.avatar_url}
              name={prof.profiles.display_name}
              size="md"
            />
            <div className="min-w-0">
              <p className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Profesional
              </p>
              <p className="truncate text-sm font-medium">{prof.profiles.display_name}</p>
              {prof.is_available && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-green-700">
                  <Check className="h-3 w-3" />
                  Disponible
                </p>
              )}
            </div>
          </Link>
        </aside>
      </div>
    </div>
  );
}
