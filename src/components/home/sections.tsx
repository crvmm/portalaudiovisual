import Link from "next/link";
import {
  ArrowRight,
  Aperture,
  Building2,
  Camera,
  Clapperboard,
  Headphones,
  Lightbulb,
  Mic,
  MonitorPlay,
  Palette,
  Radio,
  Scissors,
  Sparkles,
  User,
  Users,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react";

const specialtyTags: { name: string; slug: string; Icon: LucideIcon }[] = [
  { name: "Fotografía", slug: "fotografia", Icon: Camera },
  { name: "Vídeo", slug: "video", Icon: Video },
  { name: "Dirección", slug: "direccion", Icon: Clapperboard },
  { name: "Producción", slug: "produccion", Icon: MonitorPlay },
  { name: "Edición", slug: "edicion-video", Icon: Scissors },
  { name: "Postproducción", slug: "postproduccion", Icon: Headphones },
  { name: "Sonido", slug: "sonido", Icon: Mic },
  { name: "Motion graphics", slug: "motion-graphics", Icon: MonitorPlay },
  { name: "Color", slug: "correccion-color", Icon: Aperture },
  { name: "Animación", slug: "animacion", Icon: Sparkles },
  { name: "Streaming", slug: "streaming", Icon: Radio },
  { name: "Iluminación", slug: "iluminacion", Icon: Lightbulb },
  { name: "Diseño gráfico", slug: "diseno-grafico", Icon: Palette },
  { name: "VFX", slug: "efectos-visuales", Icon: Zap },
];

function SpecialtyTagsPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "viewfinder-frame relative rounded-sm border border-border bg-surface/60 p-6 sm:p-8"
          : "rounded-sm border border-border bg-card p-6 sm:p-8"
      }
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stage">
            Disciplinas
          </p>
          <h2
            className={
              compact
                ? "mt-2 font-display text-2xl font-medium tracking-tight sm:text-3xl"
                : "mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl"
            }
          >
            Especialidades
          </h2>
          <p
            className={
              compact
                ? "mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base"
                : "mt-3 max-w-lg text-base text-muted-foreground sm:text-lg"
            }
          >
            Etiquetas por disciplina: explora por lo que haces, no por cargos genéricos.
          </p>
        </div>
        <Link
          href="/categorias"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-foreground sm:text-base"
        >
          Ver todas
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 sm:mt-8">
        {specialtyTags.map(({ name, slug, Icon }) => (
          <Link
            key={slug}
            href={`/profesionales?categoria=${slug}`}
            className="tag-chip group inline-flex items-center gap-2 px-3.5 py-2 text-[0.9375rem]"
          >
            <Icon
              className="h-3.5 w-3.5 shrink-0 text-stage transition-colors group-hover:text-primary"
              strokeWidth={1.75}
            />
            <span>{name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

const profileTypes: {
  index: string;
  title: string;
  description: string;
  href: string;
  Icon: LucideIcon;
}[] = [
  {
    index: "01",
    title: "Profesional",
    description:
      "Portfolio, tarifas y coincidencias con ofertas de empleo, proyectos y encargos.",
    href: "/?auth=register&tipo=professional",
    Icon: Users,
  },
  {
    index: "02",
    title: "Empresa",
    description:
      "Publica vacantes (indefinido, temporal), proyectos freelance y gestiona candidaturas.",
    href: "/?auth=register&tipo=company",
    Icon: Building2,
  },
  {
    index: "03",
    title: "Particular",
    description:
      "Contrata profesionales para sesiones, eventos o proyectos concretos.",
    href: "/?auth=register&tipo=individual",
    Icon: User,
  },
];

const features = [
  {
    index: "01",
    title: "Coincidencias",
    description:
      "Puntuación por categoría, ubicación, agenda, experiencia y presupuesto.",
  },
  {
    index: "02",
    title: "Agenda",
    description:
      "Quienes trabajan por proyecto marcan disponibilidad; quienes contratan la consultan antes de contactar.",
  },
  {
    index: "03",
    title: "Alertas",
    description:
      "Solo oportunidades que encajan con tu perfil y preferencias.",
  },
  {
    index: "04",
    title: "Servicios",
    description:
      "Paquetes con precio, ejemplos y categoría: de sesión de foto a postproducción.",
  },
];

export function HeroSection() {
  return (
    <section className="hero-spotlight relative overflow-hidden border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:py-28">
        <div className="relative z-10 lg:max-w-xl">
          <p className="mb-6 inline-flex items-center gap-2.5 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <span className="rec-dot rec-dot-pulse" aria-hidden="true" />
            Plataforma sector audiovisual
          </p>
          <h1 className="font-display text-balance text-[2.35rem] leading-[1.02] font-medium tracking-tight sm:text-5xl lg:text-[3.6rem]">
            El sector audiovisual,{" "}
            <span className="text-stage">conectado</span> de verdad
          </h1>
          <p className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Empleo en plantilla, proyectos freelance y servicios a medida. Una
            plataforma para empresas, profesionales y particulares.
          </p>
          <div className="mt-11 flex flex-wrap items-center gap-3">
            <Link
              href="/profesionales"
              className="btn-primary-glow inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground transition-[filter,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-105"
            >
              Explorar talento
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ofertas"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3.5 text-base font-medium transition-[background-color,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-stage/40 hover:bg-accent"
            >
              Ver ofertas
            </Link>
          </div>
        </div>

        <SpecialtyTagsPanel compact />
      </div>
    </section>
  );
}

export function CategoriesSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SpecialtyTagsPanel />
      </div>
    </section>
  );
}

export function ProfileTypesSection() {
  return (
    <section className="border-y border-border bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stage">
          Perfiles
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Tres formas de entrar
        </h2>
        <p className="mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
          Elige el perfil que encaja contigo y empieza en minutos.
        </p>

        <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-border bg-border lg:grid-cols-3">
          {profileTypes.map(({ index, title, description, href, Icon }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col justify-between bg-card p-7 transition-[background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent"
            >
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-mono text-sm text-muted-foreground">{index}</span>
                  <div className="inline-flex rounded-md border border-border bg-surface p-2.5 text-stage transition-colors group-hover:border-primary/30 group-hover:text-primary">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="font-display text-2xl font-medium">{title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-primary">
                Empezar
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stage">
          Funciones
        </p>
        <h2 className="mt-2 font-display max-w-xl text-3xl font-medium tracking-tight sm:text-4xl">
          Herramientas que entienden el sector
        </h2>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Empleo estable, freelance y contratación por proyecto en un mismo
          entorno, pensado para quien trabaja en audiovisual.
        </p>

        <dl className="mt-14 divide-y divide-border border-y border-border">
          {features.map(({ index, title, description }) => (
            <div
              key={title}
              className="grid gap-4 py-8 sm:grid-cols-[4rem_1fr] sm:gap-8"
            >
              <span className="font-mono text-sm font-medium text-stage">{index}</span>
              <div>
                <dt className="font-display text-xl font-medium text-foreground">
                  {title}
                </dt>
                <dd className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">
                  {description}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
