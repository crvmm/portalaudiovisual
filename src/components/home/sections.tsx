import Link from "next/link";
import {
  ArrowRight,
  Aperture,
  Building2,
  Camera,
  Clapperboard,
  Headphones,
  Mic,
  MonitorPlay,
  Scissors,
  User,
  Users,
  Video,
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
      className="hero-panel relative mx-auto aspect-[5/4] w-full max-w-md min-h-[18rem] overflow-hidden rounded-2xl sm:min-h-[20rem] lg:mx-0 lg:max-w-none"
      aria-hidden="true"
    >
      <div className="hero-glow-ring pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-border/80"
        viewBox="0 0 400 320"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="200" cy="160" r="3" className="fill-primary/60" />
        {[80, 130, 200, 270, 320].map((y, i) => (
          <line
            key={i}
            x1="200"
            y1="160"
            x2={i % 2 === 0 ? 60 : 340}
            y2={y}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 6"
            opacity="0.35"
          />
        ))}
      </svg>

      <div className="pointer-events-none absolute inset-6 rounded-xl border border-border/40" />
      <div className="pointer-events-none absolute left-6 top-6 h-4 w-4 border-l-2 border-t-2 border-primary/60" />
      <div className="pointer-events-none absolute right-6 bottom-6 h-4 w-4 border-r-2 border-b-2 border-primary/60" />

      {heroTools.map(({ Icon, label, className, delay }) => (
        <div
          key={label}
          className={`hero-icon-float absolute flex flex-col items-center gap-2 ${className}`}
          style={{ animationDelay: delay }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/80 bg-card/90 text-primary shadow-[0_0_24px_oklch(0.78_0.145_78/0.12)] transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 hover:shadow-[0_0_32px_oklch(0.78_0.145_78/0.22)]">
            <Icon className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground sm:text-[11px]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

const categories: {
  name: string;
  slug: string;
  Icon: LucideIcon;
  className: string;
}[] = [
  {
    name: "Fotografía",
    slug: "fotografia",
    Icon: Camera,
    className: "col-span-2 row-span-2 min-h-[11rem] lg:min-h-0",
  },
  { name: "Vídeo", slug: "video", Icon: Video, className: "" },
  { name: "Producción", slug: "produccion", Icon: Clapperboard, className: "" },
  { name: "Edición", slug: "edicion-video", Icon: Scissors, className: "" },
  { name: "Sonido", slug: "sonido", Icon: Mic, className: "" },
  { name: "Motion", slug: "motion-graphics", Icon: MonitorPlay, className: "" },
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
              className="btn-primary-glow inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-[filter,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-110"
            >
              Explorar talento
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ofertas"
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/40 px-6 py-3 text-sm font-medium backdrop-blur-[2px] transition-[background-color,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/30 hover:bg-accent"
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
            <p className="mt-3 max-w-lg text-muted-foreground">
              Profesiones y disciplinas del audiovisual, no etiquetas genéricas de empleo.
            </p>
          </div>
          <Link
            href="/categorias"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-foreground"
          >
            Ver todas
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:grid-rows-2">
          {categories.map(({ name, slug, Icon, className }) => (
            <Link
              key={slug}
              href={`/profesionales?categoria=${slug}`}
              className={`group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 transition-[border-color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_16px_40px_oklch(0.05_0.01_58/0.35)] ${className}`}
            >
              <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/10 blur-2xl transition-opacity duration-200 group-hover:bg-primary/20" />
              <Icon
                className="h-6 w-6 text-primary/90 transition-transform duration-200 group-hover:scale-110"
                strokeWidth={1.5}
              />
              <p className="mt-8 font-medium sm:mt-10">{name}</p>
              <ArrowRight className="mt-3 h-4 w-4 text-primary opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
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
        <p className="mt-3 max-w-xl text-muted-foreground">
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
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary">
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
          <p className="mt-4 max-w-2xl text-muted-foreground">
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
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
