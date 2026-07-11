#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

if [[ -f .env.deploy ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.deploy
  set +a
fi

: "${NEXT_PUBLIC_SUPABASE_URL:?Define NEXT_PUBLIC_SUPABASE_URL}"
: "${SUPABASE_SERVICE_ROLE_KEY:?Define SUPABASE_SERVICE_ROLE_KEY (del .env del Mac Mini)}"

node scripts/seed-demo-data.mjs
