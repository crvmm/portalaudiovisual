import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  User,
  Briefcase,
  Calendar,
  MessageSquare,
  Settings,
  Bell,
  Plus,
} from "lucide-react";
import { AuthRequiredPlaceholder } from "@/components/auth/auth-required-placeholder";
import { authModalLoginUrl, isAuthModalOpenFromParams } from "@/lib/auth/redirect";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (!isAuthModalOpenFromParams(params)) {
      redirect(authModalLoginUrl("/dashboard"));
    }
    return <AuthRequiredPlaceholder message="Inicia sesión para acceder a tu panel" />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const dashboardLinks = [
  { href: "/dashboard/perfil", label: "Mi perfil", icon: User, description: "Edita tu información profesional" },
  { href: "/dashboard/ofertas", label: "Mis ofertas", icon: Briefcase, description: "Gestiona publicaciones y candidaturas" },
  { href: "/dashboard/calendario", label: "Calendario", icon: Calendar, description: "Disponibilidad y reservas" },
  { href: "/mensajes", label: "Mensajes", icon: MessageSquare, description: "Conversaciones activas" },
  { href: "/dashboard/notificaciones", label: "Notificaciones", icon: Bell, description: "Preferencias y alertas" },
  { href: "/dashboard/configuracion", label: "Configuración", icon: Settings, description: "Ajustes de cuenta" },
];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Hola, {profile?.display_name ?? "Usuario"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Panel de control — {profile?.profile_type === "professional" ? "Profesional" : profile?.profile_type === "company" ? "Empresa" : "Particular"}
          </p>
        </div>
        <Link
          href="/publicar"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Publicar
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardLinks.map(({ href, label, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-accent/30"
          >
            <Icon className="h-6 w-6 text-primary" />
            <h2 className="mt-4 font-semibold">{label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
