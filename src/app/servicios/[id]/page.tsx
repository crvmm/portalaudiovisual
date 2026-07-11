import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, MessageSquare, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { AvailabilityCalendar } from "@/components/calendar/availability-calendar";
import {
  WORK_MODALITY_LABELS,
  PRICING_TYPE_LABELS,
  type WorkModality,
  type PricingType,
} from "@/types";
import { formatCurrency } from "@/lib/utils";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select(`
      *,
      categories:category_id (name, slug),
      professional_profiles:professional_id (
        id,
        location_city,
        is_available,
        profiles:id (display_name, avatar_url)
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

  const { data: availability } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("professional_id", prof.id)
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date")
    .limit(60);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Servicios", href: "/servicios" },
          { label: service.title },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {media && media.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {media.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-xl border border-border">
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

          <div>
            {category && (
              <Badge variant="primary" className="mb-2">
                {category.name}
              </Badge>
            )}
            <h1 className="text-2xl font-bold">{service.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="muted">
                {WORK_MODALITY_LABELS[service.work_modality as WorkModality]}
              </Badge>
              {service.estimated_duration && (
                <Badge variant="muted">
                  <Clock className="mr-1 h-3 w-3" />
                  {service.estimated_duration}
                </Badge>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Descripción del servicio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            </CardContent>
          </Card>

          {service.included_materials && (
            <Card>
              <CardHeader>
                <CardTitle>Material incluido</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{service.included_materials}</p>
              </CardContent>
            </Card>
          )}

          {service.terms && (
            <Card>
              <CardHeader>
                <CardTitle>Condiciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {service.terms}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                {service.price_amount ? (
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(service.price_amount, service.currency)}
                  </p>
                ) : service.price_min ? (
                  <p className="text-2xl font-bold">
                    {formatCurrency(service.price_min, service.currency)}
                    {service.price_max &&
                      ` — ${formatCurrency(service.price_max, service.currency)}`}
                  </p>
                ) : (
                  <p className="text-lg text-muted-foreground">
                    {PRICING_TYPE_LABELS[service.pricing_type as PricingType]}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {PRICING_TYPE_LABELS[service.pricing_type as PricingType]}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <Link href={`/mensajes?servicio=${id}&contactar=${prof.id}`}>
                  <Button className="w-full">
                    <MessageSquare className="h-4 w-4" />
                    Solicitar presupuesto
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profesional</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/profesionales/${prof.id}`}
                className="flex items-center gap-3 group"
              >
                <Avatar
                  src={prof.profiles.avatar_url}
                  name={prof.profiles.display_name}
                  size="lg"
                />
                <div>
                  <p className="font-medium group-hover:text-primary transition-colors">
                    {prof.profiles.display_name}
                  </p>
                  {prof.location_city && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {prof.location_city}
                    </p>
                  )}
                  {prof.is_available && (
                    <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                      <Check className="h-3 w-3" />
                      Disponible
                    </p>
                  )}
                </div>
              </Link>
            </CardContent>
          </Card>

          {service.location_city && (
            <Card>
              <CardContent className="pt-6 text-sm">
                <p className="font-medium">Ubicación del servicio</p>
                <p className="text-muted-foreground">{service.location_city}</p>
              </CardContent>
            </Card>
          )}

          {availability && availability.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Disponibilidad</CardTitle>
              </CardHeader>
              <CardContent>
                <AvailabilityCalendar slots={availability} readOnly compact />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
