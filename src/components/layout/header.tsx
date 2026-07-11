import Link from "next/link";

const navItems = [
  { href: "/profesionales", label: "Profesionales" },
  { href: "/ofertas", label: "Ofertas" },
  { href: "/servicios", label: "Servicios" },
  { href: "/mensajes", label: "Mensajes" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-lg font-medium tracking-tight text-foreground"
        >
          Portal<span className="text-primary">.</span>Audiovisual
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/auth/login"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-foreground"
          >
            Entrar
          </Link>
          <Link
            href="/auth/registro"
            className="rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-[filter] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-110"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </header>
  );
}
