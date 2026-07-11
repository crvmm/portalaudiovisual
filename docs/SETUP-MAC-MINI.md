# Supabase self-hosted (Mac Mini) + Cloudflare Workers

Guía adaptada a **Portal Audiovisual**. Este proyecto usa **Next.js** (no Vite) y se despliega en **Cloudflare Workers** (no Pages).

## Nombres de este proyecto

| Variable | Valor |
|----------|-------|
| Repo GitHub | [crvmm/portalaudiovisual](https://github.com/crvmm/portalaudiovisual) |
| Worker Cloudflare | `portalaudiovisual` |
| URL web | https://portalaudiovisual.pages.dev |
| Cuenta Cloudflare | apps@crvmm.com |
| Account ID | `852e6fbe0ecd3f7d68a85f820f49bf10` |
| Stack Supabase (Mini) | `~/supabase-portalaudiovisual` |

## Variables de entorno (Next.js)

Este proyecto usa el prefijo **`NEXT_PUBLIC_`** (no `VITE_`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-URL.trycloudflare.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

| Archivo | Uso | ¿Subir a git? |
|---------|-----|---------------|
| `.env.local` | Desarrollo local (`supabase start` o tunnel) | No |
| `.env.deploy` | Redesplegar Workers con URL del Mini | No |
| `.env.example` | Plantilla | Sí |

---

## PARTE A — Mac de desarrollo (Cursor)

### A1. Requisitos

```bash
node -v          # v18+
gh auth switch --user crvmm
gh auth status
wrangler whoami  # cuenta apps@crvmm.com
```

### A2. Desarrollo local (opcional, sin Mini)

```bash
npm install
npm run supabase:start    # requiere Docker en ESTE Mac
cp .env.example .env.local
# Pegar anon key de `supabase start`
npm run dev
```

### A3. Redesplegar Workers con backend del Mini

Cuando el Mac Mini tenga Supabase + tunnel activos:

```bash
cp .env.deploy.example .env.deploy
# Editar con URL trycloudflare + ANON_KEY del Mini

chmod +x scripts/mac-mini/05-redeploy-cloudflare.sh
./scripts/mac-mini/05-redeploy-cloudflare.sh
```

O manualmente:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.trycloudflare.com \
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... \
npm run deploy
```

---

## PARTE B — Mac Mini (solo Terminal)

### B1. Clonar

```bash
git clone https://github.com/crvmm/portalaudiovisual.git
cd portalaudiovisual
chmod +x scripts/mac-mini/*.sh
```

### B2. Prerequisitos

```bash
./scripts/mac-mini/01-install-prerequisites.sh
open -a Docker
# Esperar 1-2 min, luego:
docker info
```

### B3. Levantar Supabase

```bash
./scripts/mac-mini/02-setup-supabase.sh
```

Comprobar:

```bash
curl -I http://localhost:8000
# HTTP 401/200 = Kong responde

grep "^ANON_KEY=" ~/supabase-portalaudiovisual/docker/.env
```

### B4. Migraciones

```bash
./scripts/mac-mini/03-apply-migrations.sh
```

Aplica las 13 migraciones en `supabase/migrations/` + `seed.sql` (categorías, idiomas, herramientas).

### B5. Tunnel Cloudflare

**Terminal 1** (dejar abierta):

```bash
./scripts/mac-mini/04-setup-tunnel.sh
# o directamente:
cloudflared tunnel --url http://localhost:8000
```

Copia la URL: `https://algo-random.trycloudflare.com`

### B6. Probar API desde internet

```bash
ANON_KEY=$(grep "^ANON_KEY=" ~/supabase-portalaudiovisual/docker/.env | cut -d= -f2- | tr -d '"')
curl "https://TU-URL.trycloudflare.com/rest/v1/categories?select=name" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY"
```

Debería devolver JSON con las categorías del seed.

---

## PARTE C — Conectar frontend ↔ backend

En el **Mac de desarrollo**:

1. Crea `.env.deploy` con la URL del tunnel y el `ANON_KEY`
2. Ejecuta `./scripts/mac-mini/05-redeploy-cloudflare.sh`
3. Abre https://portalaudiovisual.pages.dev
4. Prueba registro en `/auth/registro`

---

## PARTE D — Qué debe estar encendido (Mac Mini)

| Proceso | Comando |
|---------|---------|
| Docker Desktop | Abierto |
| Supabase | `cd ~/supabase-portalaudiovisual/docker && docker compose up -d` |
| Tunnel | `cloudflared tunnel --url http://localhost:8000` |
| Mac | Sin suspensión |

### Tras reiniciar el Mini

```bash
open -a Docker
sleep 60
cd ~/supabase-portalaudiovisual/docker && docker compose up -d
cloudflared tunnel --url http://localhost:8000
# → NUEVA URL trycloudflare → actualizar .env.deploy y redesplegar
```

---

## PARTE E — Prompt corto para el agente

```
El Mac Mini ya tiene:
- Supabase en localhost:8000 (~/supabase-portalaudiovisual)
- Migraciones aplicadas
- Tunnel: https://XXXX.trycloudflare.com
- ANON_KEY: eyJ...

Redespliega portalaudiovisual en Cloudflare Workers (cuenta crvmm)
con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.
Confirma registro/login en https://portalaudiovisual.pages.dev
```

---

## Checklist

- [ ] Repo en github.com/crvmm/portalaudiovisual
- [ ] `supabase/migrations/` (13 archivos) + seed
- [ ] `scripts/mac-mini/` en el repo
- [ ] Mac Mini: Docker corriendo
- [ ] Mac Mini: Supabase en localhost:8000
- [ ] Mac Mini: migraciones aplicadas
- [ ] Mac Mini: cloudflared activo
- [ ] `.env.deploy` con URL + anon key correctas
- [ ] `npm run deploy` / script 05 ejecutado
- [ ] Registro/login probado en la web

---

## Limitaciones

- **trycloudflare.com** es temporal — la URL cambia al reiniciar el tunnel. Para producción: tunnel nombrado en Cloudflare Zero Trust.
- **`.env` / `.env.deploy` / `.env.local`** nunca a git.
- **Cursor no hace falta en el Mini** — solo Terminal (+ SSH si quieres).
- **RLS**: tablas con políticas `authenticated` no devuelven datos con rol `anon`; normal si la app exige login.
- **PostGIS**: la migración 001 requiere extensión `postgis`. Si falla en self-hosted, instala la imagen Postgres con PostGIS o ajusta la migración.

## Diferencias vs plantilla Vite/Pages

| Plantilla original | Este proyecto |
|--------------------|---------------|
| `VITE_SUPABASE_*` | `NEXT_PUBLIC_SUPABASE_*` |
| Cloudflare Pages (estático) | Cloudflare Pages advanced mode (OpenNext + `_worker.js`) |
| `wrangler pages deploy dist` | `npm run deploy` |
| `audiovisual-jobs.pages.dev` | `portalaudiovisual.pages.dev` |
