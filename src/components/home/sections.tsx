import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  { name: "Fotografía", slug: "fotografia", count: "12 roles" },
  { name: "Vídeo", slug: "video", count: "18 roles" },
  { name: "Producción", slug: "produccion", count: "9 roles" },
  { name: "Edición", slug: "edicion-video", count: "11 roles" },
  { name: "Sonido", slug: "sonido", count: "7 roles" },
  { name: "Motion", slug: "motion-graphics", count: "6 roles" },
];

const profileTypes = [
  {
    index: "01",
    title: "Profesional",
    description:
      "Porfolio, tarifas, disponibilidad y coincidencias con encargos reales.",
    href: "/auth/registro?tipo=professional",
  },
  {
    index: "02",
    title: "Empresa",
    description:
      "Publica rodajes, busca crew y gestiona candidaturas desde un panel.",
    href: "/auth/registro?tipo=company",
  },
  {
    index: "03",
    title: "Particular",
    description:
      "Contrata fotógrafos, videógrafos y editores para proyectos puntuales.",
    href: "/auth/registro?tipo=individual",
  },
];

const features = [
  {
    title: "Coincidencias",
    description:
      "Puntuación por categoría, ubicación, agenda, experiencia y presupuesto.",
  },
  {
    title: "Agenda",
    description:
      "Los autónomos marcan disponibilidad; los clientes la consultan antes de escribir.",
  },
  {
    title: "Alertas",
    description:
      "Solo oportunidades que encajan con tu perfil y preferencias.",
  },
  {
    title: "Servicios",
    description:
      "Paquetes con precio, ejemplos y categoría: de sesión de foto a postproducción.",
  },
];

export function HeroSection() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:py-24">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            00:00:00:00 · sector audiovisual
          </p>
          <h1 className="font-display mt-5 text-balance text-4xl leading-[1.08] font-medium tracking-tight sm:text-5xl lg:text-[3.25rem]">
            El talento que buscas ya está en rodaje. Encuéntralo aquí.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Profesionales, empresas y particulares con perfiles, ofertas y
            servicios pensados para producción, no para LinkedIn genérico.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/profesionales"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-[filter] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-110"
            >
              Explorar talento
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ofertas"
              className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent"
            >
              Ver encargos
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
          {[
            { value: "40+", label: "especialidades" },
            { value: "3", label: "tipos de perfil" },
            { value: "∞", label: "porfolios" },
            { value: "1", label: "plataforma" },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface px-5 py-6">
              <p className="font-display text-3xl font-medium text-primary">
                {stat.value}
              </p>
              <p className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoriesSection() {
  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-medium sm:text-3xl">
              Especialidades
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Categorías de rodaje, no etiquetas de empleo genérico.
            </p>
          </div>
          <Link
            href="/categorias"
            className="hidden shrink-0 text-sm text-primary transition-colors hover:text-foreground sm:inline"
          >
            Ver todas
          </Link>
        </div>

        <div className="mt-8 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map(({ name, slug, count }) => (
            <Link
              key={slug}
              href={`/profesionales?categoria=${slug}`}
              className="group flex min-w-[9.5rem] flex-col justify-between rounded-md border border-border bg-card px-4 py-4 transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/40 hover:bg-accent"
            >
              <span className="font-medium">{name}</span>
              <span className="mt-6 font-mono text-[10px] tracking-wider text-muted-foreground uppercase group-hover:text-primary">
                {count}
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/categorias"
          className="mt-4 inline-block text-sm text-primary sm:hidden"
        >
          Ver todas las categorías
        </Link>
      </div>
    </section>
  );
}

export function ProfileTypesSection() {
  return (
    <section className="border-y border-border bg-surface py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-display text-2xl font-medium sm:text-3xl">
          ¿Quién eres en un rodaje?
        </h2>

        <ul className="mt-10 divide-y divide-border">
          {profileTypes.map(({ index, title, description, href }) => (
            <li key={index}>
              <Link
                href={href}
                className="group flex flex-col gap-4 py-7 transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-5 sm:gap-8">
                  <span className="font-mono text-sm text-primary tabular-nums">
                    {index}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium">{title}</h3>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 pl-10 text-sm text-primary transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 sm:pl-0">
                  Empezar
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-medium sm:text-3xl">
            Hecha para cómo trabaja el sector
          </h2>
          <p className="mt-3 text-muted-foreground">
            Producción, freelance y contratación creativa: las herramientas
            encajan con el flujo real, no con un CRM de oficina.
          </p>
        </div>

        <dl className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {features.map(({ title, description }, i) => (
            <div key={title} className="relative sm:pt-1">
              <dt className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-primary tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-medium">{title}</span>
              </dt>
              <dd className="mt-2 pl-8 text-sm leading-relaxed text-muted-foreground">
                {description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
