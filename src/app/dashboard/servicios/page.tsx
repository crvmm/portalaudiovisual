import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AuthRequiredPlaceholder } from "@/components/auth/auth-required-placeholder";
import { ServiceActiveToggle } from "@/components/services/service-active-toggle";
import { PRICING_TYPE_LABELS, type PricingType } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function DashboardServicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <AuthRequiredPlaceholder message="Inicia sesión para gestionar tus servicios" />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_type")
    .eq("id", user.id)
    .single();

  if (profile?.profile_type !== "professional") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold">Mis servicios</h1>
        <p className="mt-2 text-muted-foreground">
          Solo los perfiles profesionales pueden publicar servicios.
        </p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-primary hover:underline">
          Volver al panel →
        </Link>
      </div>
    );
  }

  const { data: services } = await supabase
    .from("services")
    .select("*, categories:category_id (name)")
    .eq("professional_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mis servicios</h1>
          <p className="mt-2 text-muted-foreground">
            Publica y gestiona lo que ofreces como profesional
          </p>
        </div>
        <Link
          href="/dashboard/servicios/nuevo"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Nuevo servicio
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {services && services.length > 0 ? (
          services.map((service) => {
            const category = service.categories as unknown as { name: string } | null;
            return (
              <Card key={service.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {category && <Badge variant="signal">{category.name}</Badge>}
                      <Badge variant={service.is_active ? "success" : "muted"}>
                        {service.is_active ? "Activo" : "Pausado"}
                      </Badge>
                    </div>
                    <h2 className="mt-2 font-semibold">
                      <Link
                        href={`/servicios/${service.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {service.title}
                      </Link>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {service.price_amount != null
                        ? formatCurrency(service.price_amount, service.currency)
                        : service.price_min != null
                          ? `${formatCurrency(service.price_min, service.currency)}${
                              service.price_max
                                ? ` — ${formatCurrency(service.price_max, service.currency)}`
                                : ""
                            }`
                          : PRICING_TYPE_LABELS[service.pricing_type as PricingType]}
                      {" · "}
                      Publicado {formatDate(service.created_at)}
                    </p>
                  </div>
                  <ServiceActiveToggle serviceId={service.id} isActive={service.is_active} />
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>Aún no has publicado ningún servicio.</p>
              <p className="mt-2 text-sm">
                Describe lo que ofreces (grabación, edición, sonido…) para que te encuentren.
              </p>
              <Link
                href="/dashboard/servicios/nuevo"
                className="mt-4 inline-block text-primary hover:underline"
              >
                Publicar tu primer servicio →
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
