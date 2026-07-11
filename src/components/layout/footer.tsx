import Link from "next/link";

const links = [
  { href: "/profesionales", label: "Profesionales" },
  { href: "/ofertas", label: "Ofertas" },
  { href: "/servicios", label: "Servicios" },
  { href: "/categorias", label: "Categorías" },
  { href: "/publicar", label: "Publicar oferta" },
  { href: "/auth/registro", label: "Registro" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stage/40 to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-3xl font-medium leading-none tracking-tight sm:text-4xl">
              Portal<span className="text-stage">.</span>Audiovisual
            </p>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
              Talento, empleo, proyectos y servicios audiovisuales en un solo lugar.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-3">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-base text-muted-foreground transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-primary"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-14 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Portal Audiovisual
        </p>
      </div>
    </footer>
  );
}
