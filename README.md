# Portal Audiovisual

Plataforma profesional especializada en el sector audiovisual. Conecta profesionales, empresas y particulares con empleo, proyectos, portfolios, servicios, coincidencias inteligentes, calendario de disponibilidad y mensajería interna.

> **Identificadores:** app `Portal Audiovisual`, paquete npm `portal-audiovisual`, repo [crvmm/portalaudiovisual](https://github.com/crvmm/portalaudiovisual). No confundir con el repo anterior *Audiovisual Jobs*.

## Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend:** Supabase local (PostgreSQL, Auth, Storage, RLS, funciones SQL)
- **Búsqueda:** PostGIS para distancia geográfica, pg_trgm para búsqueda por texto

## Requisitos previos

- [Node.js](https://nodejs.org/) 18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para Supabase local)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (incluido como devDependency)

## Configuración inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar Supabase local

```bash
npm run supabase:start
```

La primera vez descargará las imágenes de Docker. Al terminar, verás las URLs y claves en la terminal.

### 3. Configurar variables de entorno

Copia el ejemplo y pega la `anon key` que muestra `supabase start`:

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
```

### 4. Aplicar migraciones y datos iniciales

Si ya iniciaste Supabase, las migraciones se aplican automáticamente. Para resetear la base de datos con el seed de categorías:

```bash
npm run supabase:reset
```

### 5. Iniciar el frontend

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

```
src/
├── app/                    # Páginas (App Router)
│   ├── auth/               # Login y registro
│   ├── dashboard/          # Panel de control
│   ├── profesionales/      # Buscador de profesionales
│   ├── ofertas/            # Ofertas de empleo y oportunidades
│   ├── servicios/          # Marketplace de servicios
│   └── categorias/         # Categorías audiovisuales
├── components/             # Componentes React
├── lib/supabase/           # Cliente Supabase (browser, server, middleware)
└── types/                  # Tipos TypeScript

supabase/
├── migrations/             # Esquema de base de datos (12 migraciones)
├── seed.sql                # Categorías, idiomas, herramientas y equipos
└── config.toml             # Configuración Supabase local
```

## Modelo de datos

### Tipos de perfil

| Tipo | Tabla | Descripción |
|------|-------|-------------|
| `professional` | `professional_profiles` | Profesionales con portfolio, servicios y calendario |
| `company` | `company_profiles` | Empresas que publican ofertas y buscan talento |
| `individual` | `individual_profiles` | Particulares que contratan servicios |

### Funcionalidades principales

- **Categorías jerárquicas** — Más de 40 especialidades audiovisuales, ampliables por usuarios
- **Servicios de autónomos** — Precios, ejemplos, modalidad y condiciones
- **Calendario de disponibilidad** — Días disponibles, ocupados, parciales y vacaciones
- **Ofertas y oportunidades** — Empleo (indefinido, temporal), freelance, prácticas, colaboraciones y proyectos puntuales
- **Sistema de coincidencias** — Función `compute_job_match()` con puntuación ponderada
- **Candidaturas** — Con portfolio, presupuesto y archivos adjuntos
- **Chat contextual** — Vinculado a ofertas, servicios o proyectos
- **Valoraciones** — Puntuación multidimensional tras completar trabajos
- **Notificaciones** — Preferencias personalizables por categoría, ubicación y presupuesto

### Sistema de coincidencias

La función `compute_job_match(job_id, professional_id)` evalúa:

| Factor | Peso |
|--------|------|
| Categorías | 30% |
| Ubicación / distancia | 20% |
| Disponibilidad en fechas | 20% |
| Experiencia | 10% |
| Presupuesto / tarifa | 10% |
| Modalidad de trabajo | 5% |
| Herramientas | 5% |

Los resultados se almacenan en `job_matches` y se recalculan al publicar o actualizar ofertas.

## Comandos útiles

```bash
npm run dev                  # Frontend en desarrollo
npm run build                # Build de producción
npm run supabase:start       # Iniciar Supabase local
npm run supabase:stop        # Parar Supabase local
npm run supabase:reset       # Resetear DB + seed
npm run supabase:gen-types   # Generar tipos TS desde el esquema
```

## Supabase Studio

Con Supabase local en marcha, accede al panel de administración en:

[http://127.0.0.1:54323](http://127.0.0.1:54323)

## Storage buckets

| Bucket | Público | Uso |
|--------|---------|-----|
| `avatars` | Sí | Fotos de perfil |
| `portfolios` | Sí | Trabajos del portfolio |
| `company-media` | Sí | Galería de empresas |
| `service-media` | Sí | Ejemplos de servicios |
| `documents` | No | CVs y documentos |
| `chat-attachments` | No | Archivos del chat |

## Próximos pasos

1. Configurar Supabase local (`supabase start` + `.env.local`)
2. Crear usuarios de prueba desde `/auth/registro`
3. Completar perfiles profesionales con categorías y disponibilidad
4. Publicar ofertas y verificar el sistema de coincidencias
5. Desplegar frontend (Vercel/Netlify) y conectar Supabase en la nube cuando esté listo

## Funcionalidades implementadas

### Páginas de detalle
- `/profesionales/[id]` — Perfil completo con portfolio, experiencia, tarifas, disponibilidad y servicios
- `/ofertas/[id]` — Detalle de oferta con requisitos, coincidencias y formulario de candidatura
- `/servicios/[id]` — Detalle de servicio con precios, galería y calendario del profesional

### Publicación de ofertas
- `/publicar` — Formulario en 4 pasos (básico → detalles → requisitos → revisar)
- `/dashboard/ofertas` — Gestión de ofertas publicadas
- `/dashboard/ofertas/[id]` — Candidaturas, coincidencias y acciones (aceptar/rechazar)

### Editor de perfil profesional
- `/dashboard/perfil` — Datos, especialidades, tarifas, preferencias de trabajo
- Gestión de portfolio (añadir/eliminar trabajos)
- Subida de avatar a Storage

### Calendario de disponibilidad
- `/dashboard/calendario` — Calendario interactivo (clic para cambiar estado)
- Vista de solo lectura en perfiles y servicios

### Chat en tiempo real
- `/mensajes` — Lista de conversaciones + hilo de chat
- Suscripción Realtime a nuevos mensajes
- Creación automática de conversación desde perfiles/ofertas/servicios
- Adjuntos de archivos

### Notificaciones
- `/dashboard/notificaciones` — Bandeja + preferencias personalizables
- Trigger automático al crear coincidencias ≥60%
- Cola de emails (`email_queue`) + edge function `send-notification-email`
- API `/api/notifications/process-emails` para desarrollo local

## Licencia

Privado — Todos los derechos reservados.

## Despliegue

Ver guía completa: [docs/SETUP-MAC-MINI.md](docs/SETUP-MAC-MINI.md)

### Cloudflare Pages

- **App:** Portal Audiovisual
- **Paquete npm:** `portal-audiovisual`
- **Proyecto:** `portalaudiovisual`
- **Cuenta:** Apps@crvmm.com
- **URL:** https://portalaudiovisual.pages.dev
- **Deploy:** `npm run deploy`
- **Workers (alternativo):** `npm run deploy:workers` → `portalaudiovisual.apps-852.workers.dev`

Variables de entorno en `wrangler.jsonc` (actualizar cuando configures Supabase):

```json
"vars": {
  "NEXT_PUBLIC_SUPABASE_URL": "https://tu-proyecto.supabase.co",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY": "tu-anon-key"
}
```

### GitHub

- **Repositorio:** https://github.com/crvmm/portalaudiovisual
