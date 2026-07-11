import Link from "next/link";

const navItems = [
  { href: "/profesionales", label: "Profesionales" },
  { href: "/ofertas", label: "Ofertas" },
  { href: "/servicios", label: "Servicios" },
  { href: "/mensajes", label: "Mensajes" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/92 backdrop-blur-sm">
      <div className="mx-auto flex h-[3.75rem] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 font-display text-[1.15rem] font-medium tracking-tight text-foreground"
        >
          <span className="rec-dot rec-dot-pulse" aria-hidden="true" />
          Portal<span className="text-stage">.</span>Audiovisual
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3.5 py-2 text-[0.9375rem] text-muted-foreground transition-[color,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="rounded-md px-3.5 py-2 text-[0.9375rem] text-muted-foreground transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-foreground"
          >
            Entrar
          </Link>
          <Link
            href="/auth/registro"
            className="btn-primary-glow rounded-md bg-primary px-4 py-2 text-[0.9375rem] font-medium text-primary-foreground transition-[filter,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-105"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </header>
  );
}
