import Link from "next/link";
import { Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <Film className="h-5 w-5 text-primary" />
              Audiovisual Jobs
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              La plataforma profesional especializada en el sector audiovisual.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Explorar</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/profesionales" className="hover:text-foreground">Profesionales</Link></li>
              <li><Link href="/ofertas" className="hover:text-foreground">Ofertas y encargos</Link></li>
              <li><Link href="/servicios" className="hover:text-foreground">Servicios</Link></li>
              <li><Link href="/empresas" className="hover:text-foreground">Empresas</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium">Para profesionales</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/auth/registro?tipo=professional" className="hover:text-foreground">Crear perfil</Link></li>
              <li><Link href="/ofertas" className="hover:text-foreground">Buscar oportunidades</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Panel de control</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium">Para clientes</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/auth/registro?tipo=company" className="hover:text-foreground">Registrar empresa</Link></li>
              <li><Link href="/auth/registro?tipo=individual" className="hover:text-foreground">Soy particular</Link></li>
              <li><Link href="/publicar" className="hover:text-foreground">Publicar encargo</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Audiovisual Jobs. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
