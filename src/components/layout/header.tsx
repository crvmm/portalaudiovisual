import Link from "next/link";
import { Film, Search, Briefcase, Users, MessageSquare, Bell } from "lucide-react";

const navItems = [
  { href: "/profesionales", label: "Profesionales", icon: Users },
  { href: "/ofertas", label: "Ofertas", icon: Briefcase },
  { href: "/servicios", label: "Servicios", icon: Search },
  { href: "/mensajes", label: "Mensajes", icon: MessageSquare },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Film className="h-6 w-6 text-primary" />
          <span>Audiovisual Jobs</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/notificaciones"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/auth/registro"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </header>
  );
}
