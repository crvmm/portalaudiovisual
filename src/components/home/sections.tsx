import Link from "next/link";
import {
  ArrowRight,
  Aperture,
  Camera,
  Clapperboard,
  Headphones,
  Mic,
  MonitorPlay,
  Scissors,
  Video,
  type LucideIcon,
} from "lucide-react";

const heroTools: {
  Icon: LucideIcon;
  label: string;
  className: string;
  iconClassName?: string;
}[] = [
  {
    Icon: Camera,
    label: "Fotografía",
    className: "left-[4%] top-[6%] sm:left-[8%] sm:top-[10%]",
  },
  {
    Icon: Video,
    label: "Vídeo",
    className: "left-[38%] top-[2%] sm:left-[40%] sm:top-[4%]",
    iconClassName: "h-6 w-6",
  },
  {
    Icon: Mic,
    label: "Sonido",
    className: "right-[4%] top-[14%] sm:right-[10%] sm:top-[16%]",
  },
  {
    Icon: Clapperboard,
    label: "Producción",
    className: "left-[2%] top-[44%] sm:left-[6%] sm:top-[46%]",
  },
  {
    Icon: Scissors,
    label: "Edición",
    className: "left-[36%] top-[38%] sm:left-[38%] sm:top-[40%]",
  },
  {
    Icon: MonitorPlay,
    label: "Motion",
    className: "right-[2%] top-[42%] sm:right-[8%] sm:top-[44%]",
  },
  {
    Icon: Headphones,
    label: "Post",
    className: "bottom-[10%] left-[18%] sm:bottom-[12%] sm:left-[22%]",
  },
  {
    Icon: Aperture,
    label: "Color",
    className: "right-[16%] bottom-[6%] sm:right-[20%] sm:bottom-[8%]",
    iconClassName: "h-6 w-6",
  },
];

function HeroToolsVisual() {
  return (
    <div
      className="relative mx-auto aspect-[5/4] w-full max-w-md min-h-[17rem] rounded-lg border border-border bg-surface sm:min-h-[19rem] lg:mx-0 lg:max-w-none"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-5 rounded-sm border border-dashed border-border/70" />
      <div className="pointer-events-none absolute left-5 top-5 h-3 w-3 border-l border-t border-primary/50" />
      <div className="pointer-events-none absolute right-5 bottom-5 h-3 w-3 border-r border-b border-primary/50" />

      {heroTools.map(({ Icon, label, className, iconClassName }) => (
        <div
          key={label}
          className={`absolute flex flex-col items-center gap-1.5 ${className}`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card text-primary shadow-[0_1px_0_oklch(0.28_0.016_58)] sm:h-12 sm:w-12">
            <Icon className={iconClassName ?? "h-5 w-5"} strokeWidth={1.5} />
          </div>
          <span className="max-w-[4.5rem] text-center text-[10px] leading-tight text-muted-foreground sm:max-w-none sm:text-[11px]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

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
      "Portfolio, tarifas y coincidencias con ofertas de empleo, proyectos y encargos.",
    href: "/auth/registro?tipo=professional",
  },
  {
    index: "02",
    title: "Empresa",
    description:
      "Publica vacantes (indefinido, temporal), proyectos freelance y gestiona candidaturas.",
    href: "/auth/registro?tipo=company",
  },
  {
    index: "03",
    title: "Particular",
    description:
      "Contrata profesionales para sesiones, eventos o proyectos concretos.",
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
      "Quienes trabajan por proyecto marcan disponibilidad; quienes contratan la consultan antes de contactar.",
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
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
        <div>
          <h1 className="font-display text-balance text-4xl leading-[1.08] font-medium tracking-tight sm:text-5xl lg:text-[3.25rem]">
            Empleo, proyectos y talento audiovisual en un solo sitio.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Para empresas que contratan en plantilla o por proyecto, profesionales
            que buscan oportunidades y particulares que necesitan un servicio concreto.
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
              Ver ofertas
            </Link>
          </div>
        </div>

        <HeroToolsVisual />
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
              Especialidades profesionales del audiovisual, no categorías genéricas de empleo.
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
          ¿Cómo quieres usar la plataforma?
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
            Empleo estable, freelance y contratación por proyecto: herramientas
            pensadas para el sector audiovisual, no para un portal genérico.
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
