import Link from "next/link";
import {
  Camera,
  Video,
  Clapperboard,
  Users,
  Building2,
  User,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const categories = [
  { name: "Fotografía", slug: "fotografia", icon: Camera },
  { name: "Vídeo", slug: "video", icon: Video },
  { name: "Producción", slug: "produccion", icon: Clapperboard },
  { name: "Edición", slug: "edicion-video", icon: Sparkles },
];

const profileTypes = [
  {
    type: "professional",
    title: "Soy profesional",
    description: "Muestra tu porfolio, ofrece servicios y encuentra oportunidades relevantes.",
    icon: Users,
    href: "/auth/registro?tipo=professional",
  },
  {
    type: "company",
    title: "Soy empresa",
    description: "Publica ofertas, busca talento y contrata autónomos especializados.",
    icon: Building2,
    href: "/auth/registro?tipo=company",
  },
  {
    type: "individual",
    title: "Soy particular",
    description: "Encuentra fotógrafos, videógrafos y creativos para tus proyectos.",
    icon: User,
    href: "/auth/registro?tipo=individual",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-primary">
            Sector audiovisual
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Conecta con el talento audiovisual que necesitas
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            La plataforma especializada para profesionales, empresas y particulares.
            Porfolios, servicios, ofertas y coincidencias inteligentes adaptadas al sector.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/profesionales"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Buscar profesionales
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/registro"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CategoriesSection() {
  return (
    <section className="border-y border-border bg-card py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-2xl font-semibold">Categorías especializadas</h2>
        <p className="mt-2 text-muted-foreground">
          Más de 40 especialidades audiovisuales, no categorías genéricas.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ name, slug, icon: Icon }) => (
            <Link
              key={slug}
              href={`/profesionales?categoria=${slug}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-background p-5 transition-colors hover:border-primary/50 hover:bg-accent/50"
            >
              <div className="rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/20">
                <Icon className="h-6 w-6" />
              </div>
              <span className="font-medium">{name}</span>
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/categorias" className="text-sm text-primary hover:underline">
            Ver todas las categorías →
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ProfileTypesSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">¿Cómo quieres usar la plataforma?</h2>
          <p className="mt-3 text-muted-foreground">
            Tres tipos de perfil adaptados a cada necesidad
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {profileTypes.map(({ title, description, icon: Icon, href }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Empezar
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  const features = [
    {
      title: "Sistema de coincidencias",
      description:
        "Compatibilidad calculada por categorías, ubicación, disponibilidad, experiencia y presupuesto.",
    },
    {
      title: "Calendario de disponibilidad",
      description:
        "Los autónomos gestionan su agenda. Los clientes consultan antes de contactar.",
    },
    {
      title: "Notificaciones personalizadas",
      description:
        "Solo recibes oportunidades relevantes según tus preferencias y especialidades.",
    },
    {
      title: "Marketplace de servicios",
      description:
        "Sesiones de foto, edición, motion graphics y más, con precios y ejemplos de trabajo.",
    },
  ];

  return (
    <section className="border-t border-border bg-card py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-2xl font-semibold sm:text-3xl">
          Diseñada para el sector audiovisual
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          No es un portal de empleo genérico. Cada función está pensada para las
          particularidades de producción, freelance y contratación creativa.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {features.map(({ title, description }) => (
            <div key={title} className="rounded-xl border border-border bg-background p-6">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
