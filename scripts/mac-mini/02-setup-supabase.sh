#!/usr/bin/env bash
set -euo pipefail

# Directorio donde vive el stack Docker de Supabase (fuera del repo)
SUPABASE_DIR="${SUPABASE_DIR:-$HOME/supabase-portalaudiovisual}"
SUPABASE_REPO="https://github.com/supabase/supabase.git"

echo "==> Setup Supabase self-hosted en: $SUPABASE_DIR"

if ! docker info &>/dev/null; then
  echo "❌ Docker no está corriendo. Ejecuta: open -a Docker"
  exit 1
fi

if [[ ! -d "$SUPABASE_DIR/docker" ]]; then
  echo "Clonando Supabase Docker..."
  mkdir -p "$(dirname "$SUPABASE_DIR")"
  git clone --depth 1 "$SUPABASE_REPO" "$SUPABASE_DIR"
else
  echo "✓ Directorio Supabase ya existe"
fi

cd "$SUPABASE_DIR/docker"

if [[ ! -f .env ]]; then
  echo "Generando .env desde .env.example..."
  cp .env.example .env

  # Generar JWT secret y claves si el script existe
  if [[ -f ./utils/generate-keys.sh ]]; then
    ./utils/generate-keys.sh
  else
    echo ""
    echo "⚠️  Edita $SUPABASE_DIR/docker/.env manualmente si hace falta."
    echo "   Asegúrate de que POSTGRES_PASSWORD, JWT_SECRET, ANON_KEY y SERVICE_ROLE_KEY estén definidos."
  fi
fi

# Sin dominio/SMTP: los registros se confirman solos (desarrollo / demo).
if grep -q '^ENABLE_EMAIL_AUTOCONFIRM=' .env; then
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' 's/^ENABLE_EMAIL_AUTOCONFIRM=.*/ENABLE_EMAIL_AUTOCONFIRM=true/' .env
  else
    sed -i 's/^ENABLE_EMAIL_AUTOCONFIRM=.*/ENABLE_EMAIL_AUTOCONFIRM=true/' .env
  fi
else
  echo 'ENABLE_EMAIL_AUTOCONFIRM=true' >> .env
fi
echo "✓ ENABLE_EMAIL_AUTOCONFIRM=true (registro sin email de confirmación)"

echo "Arrancando contenedores..."
docker compose pull
docker compose up -d

echo "Esperando a que Kong responda..."
sleep 10

ANON_KEY=$(grep "^ANON_KEY=" .env | cut -d= -f2- | tr -d '"' | tr -d "'")
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  "http://localhost:8000/rest/v1/" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" || echo "000")

if [[ "$HTTP_CODE" == "000" ]]; then
  echo "❌ Kong no responde en http://localhost:8000"
  echo "   Revisa: docker compose logs kong"
  exit 1
fi

echo ""
echo "✅ Supabase self-hosted activo en http://localhost:8000"
echo ""
echo "ANON_KEY (guárdala para el frontend):"
grep "^ANON_KEY=" .env
echo ""
echo "Studio (local): http://localhost:8000 (o el puerto configurado en .env)"
echo "Siguiente paso: ./scripts/mac-mini/03-apply-migrations.sh"
