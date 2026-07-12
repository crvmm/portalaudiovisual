#!/usr/bin/env bash
set -euo pipefail

# Evita el error 500 "Error sending confirmation email" en signup sin SMTP configurado.
SUPABASE_DIR="${SUPABASE_DIR:-$HOME/supabase-portalaudiovisual}"
ENV_FILE="$SUPABASE_DIR/docker/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ No existe $ENV_FILE"
  echo "   Ejecuta primero: ./scripts/mac-mini/02-setup-supabase.sh"
  exit 1
fi

if grep -q '^ENABLE_EMAIL_AUTOCONFIRM=' "$ENV_FILE"; then
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' 's/^ENABLE_EMAIL_AUTOCONFIRM=.*/ENABLE_EMAIL_AUTOCONFIRM=true/' "$ENV_FILE"
  else
    sed -i 's/^ENABLE_EMAIL_AUTOCONFIRM=.*/ENABLE_EMAIL_AUTOCONFIRM=true/' "$ENV_FILE"
  fi
else
  echo 'ENABLE_EMAIL_AUTOCONFIRM=true' >> "$ENV_FILE"
fi

echo "==> ENABLE_EMAIL_AUTOCONFIRM=true en $ENV_FILE"
echo "==> Reiniciando servicio auth..."

cd "$SUPABASE_DIR/docker"
docker compose up -d auth

echo ""
echo "✅ Listo. Prueba registrarte de nuevo en portalaudiovisual.pages.dev"
