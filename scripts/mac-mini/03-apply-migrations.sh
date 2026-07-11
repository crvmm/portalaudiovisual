#!/usr/bin/env bash
set -euo pipefail

SUPABASE_DIR="${SUPABASE_DIR:-$HOME/supabase-portalaudiovisual}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MIGRATIONS_DIR="$REPO_ROOT/supabase/migrations"
SEED_FILE="$REPO_ROOT/supabase/seed.sql"

echo "==> Aplicando migraciones desde $MIGRATIONS_DIR"

if ! docker info &>/dev/null; then
  echo "❌ Docker no está corriendo"
  exit 1
fi

# Buscar contenedor de Postgres del stack Supabase
DB_CONTAINER=$(docker ps --format "{{.Names}}" | grep -E "supabase.*db|db-.*supabase|_db_" | head -1 || true)

if [[ -z "$DB_CONTAINER" ]]; then
  DB_CONTAINER=$(docker ps --format "{{.Names}}" | grep -E "\-db\-|_db$" | head -1 || true)
fi

if [[ -z "$DB_CONTAINER" ]]; then
  echo "❌ No se encontró el contenedor de Postgres."
  echo "   Contenedores activos:"
  docker ps --format "  {{.Names}}"
  exit 1
fi

echo "Usando contenedor: $DB_CONTAINER"

apply_sql() {
  local file="$1"
  echo "  → $(basename "$file")"
  docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -v ON_ERROR_STOP=1 < "$file"
}

# Migraciones en orden (por timestamp en el nombre)
for migration in $(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort); do
  apply_sql "$migration"
done

if [[ -f "$SEED_FILE" ]]; then
  echo "  → seed.sql"
  docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -v ON_ERROR_STOP=1 < "$SEED_FILE"
fi

echo ""
echo "✅ Migraciones aplicadas."
