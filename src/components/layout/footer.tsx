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
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-xl font-medium">
            Portal<span className="text-primary">.</span>Audiovisual
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Talento, empleo, proyectos y servicios audiovisuales en un solo lugar.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-muted-foreground transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border py-5">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Portal Audiovisual
        </p>
      </div>
    </footer>
  );
}
