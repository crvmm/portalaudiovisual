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

const heroTools: {
  Icon: LucideIcon;
  label: string;
  className: string;
  delay: string;
}[] = [
  { Icon: Camera, label: "Foto", className: "left-[7%] top-[8%]", delay: "0s" },
  { Icon: Video, label: "Vídeo", className: "left-[42%] top-[4%]", delay: "0.4s" },
  { Icon: Mic, label: "Sonido", className: "right-[8%] top-[12%]", delay: "0.8s" },
  { Icon: Clapperboard, label: "Producción", className: "left-[5%] top-[46%]", delay: "1.2s" },
  { Icon: Scissors, label: "Edición", className: "left-[40%] top-[40%]", delay: "1.6s" },
  { Icon: MonitorPlay, label: "Motion", className: "right-[6%] top-[44%]", delay: "2s" },
  { Icon: Headphones, label: "Post", className: "bottom-[10%] left-[22%]", delay: "2.4s" },
  { Icon: Aperture, label: "Color", className: "right-[18%] bottom-[8%]", delay: "2.8s" },
];

function HeroToolsVisual() {
  return (
    <div
      className="relative mx-auto aspect-[5/4] w-full max-w-md min-h-[18rem] sm:min-h-[20rem] lg:mx-0 lg:max-w-none"
      aria-hidden="true"
    >
      {heroTools.map(({ Icon, label, className, delay }) => (
        <div
          key={label}
          className={`hero-icon-float absolute flex flex-col items-center gap-2 ${className}`}
          style={{ animationDelay: delay }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/25 bg-card/30 text-primary shadow-[0_8px_32px_oklch(0.78_0.145_78/0.15)] backdrop-blur-[2px] transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 hover:shadow-[0_12px_40px_oklch(0.78_0.145_78/0.25)]">
            <Icon className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

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

const profileTypes: {
  title: string;
  description: string;
  href: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Profesional",
    description:
      "Portfolio, tarifas y coincidencias con ofertas de empleo, proyectos y encargos.",
    href: "/auth/registro?tipo=professional",
    Icon: Users,
  },
  {
    title: "Empresa",
    description:
      "Publica vacantes (indefinido, temporal), proyectos freelance y gestiona candidaturas.",
    href: "/auth/registro?tipo=company",
    Icon: Building2,
  },
  {
    title: "Particular",
    description:
      "Contrata profesionales para sesiones, eventos o proyectos concretos.",
    href: "/auth/registro?tipo=individual",
    Icon: User,
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
    <section className="hero-spotlight relative overflow-hidden border-b border-border/80">
      <div className="mx-auto grid max-w-6xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:py-28">
        <div className="relative z-10">
          <h1 className="font-display text-balance text-[2.35rem] leading-[1.02] font-medium tracking-tight sm:text-5xl lg:text-[3.6rem]">
            El sector audiovisual,{" "}
            <span className="text-primary">conectado de verdad</span>
          </h1>
          <p className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Empleo en plantilla, proyectos freelance y servicios a medida. Una
            plataforma para empresas, profesionales y particulares.
          </p>
          <div className="mt-11 flex flex-wrap items-center gap-3">
            <Link
              href="/profesionales"
              className="btn-primary-glow inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground transition-[filter,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-110"
            >
              Explorar talento
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ofertas"
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/40 px-6 py-3.5 text-base font-medium backdrop-blur-[2px] transition-[background-color,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/30 hover:bg-accent"
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
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Especialidades
            </h2>
            <p className="mt-3 max-w-lg text-base text-muted-foreground sm:text-lg">
              Etiquetas por disciplina: explora por lo que haces, no por cargos genéricos.
            </p>
          </div>
          <Link
            href="/categorias"
            className="inline-flex items-center gap-1.5 text-base font-medium text-primary transition-colors hover:text-foreground"
          >
            Ver todas
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap gap-2.5">
          {specialtyTags.map(({ name, slug, Icon }) => (
            <Link
              key={slug}
              href={`/profesionales?categoria=${slug}`}
              className="group inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-card/40 px-4 py-2.5 text-base transition-[border-color,background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/35 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_20px_oklch(0.78_0.145_78/0.12)]"
            >
              <Icon
                className="h-4 w-4 shrink-0 text-primary/75 transition-colors group-hover:text-primary"
                strokeWidth={1.75}
              />
              <span>{name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProfileTypesSection() {
  return (
    <section className="border-y border-border/80 bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Tres formas de entrar
        </h2>
        <p className="mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
          Elige el perfil que encaja contigo y empieza en minutos.
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {profileTypes.map(({ title, description, href, Icon }) => (
            <Link
              key={title}
              href={href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-7 transition-[border-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_48px_oklch(0.05_0.01_58/0.4)]"
            >
              <div>
                <div className="mb-6 inline-flex rounded-xl border border-border/60 bg-background/60 p-3 text-primary">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-2xl font-medium">{title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-base font-medium text-primary">
                Empezar
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
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
        <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-surface p-8 sm:p-12">
          <h2 className="font-display max-w-xl text-3xl font-medium tracking-tight sm:text-4xl">
            Herramientas que entienden el sector
          </h2>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Empleo estable, freelance y contratación por proyecto en un mismo
            entorno, pensado para quien trabaja en audiovisual.
          </p>

          <dl className="mt-12 grid gap-8 sm:grid-cols-2">
            {features.map(({ title, description }) => (
              <div
                key={title}
                className="border-t border-border/60 pt-6"
              >
                <dt className="font-display text-xl font-medium text-foreground">
                  {title}
                </dt>
                <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
