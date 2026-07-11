#!/usr/bin/env bash
set -euo pipefail

# Ejecutar desde el Mac de desarrollo (NO el Mini), con wrangler autenticado en crvmm.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

if [[ -f .env.deploy ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.deploy
  set +a
fi

: "${NEXT_PUBLIC_SUPABASE_URL:?Define NEXT_PUBLIC_SUPABASE_URL (URL del tunnel trycloudflare)}"
: "${NEXT_PUBLIC_SUPABASE_ANON_KEY:?Define NEXT_PUBLIC_SUPABASE_ANON_KEY}"

echo "==> Redesplegando portalaudiovisual en Cloudflare Workers"
echo "    Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"

cp wrangler.jsonc wrangler.jsonc.bak

node -e "
const fs = require('fs');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let text = fs.readFileSync('wrangler.jsonc', 'utf8');
text = text.replace(/\"NEXT_PUBLIC_SUPABASE_URL\": \"[^\"]*\"/, '\"NEXT_PUBLIC_SUPABASE_URL\": ' + JSON.stringify(url));
text = text.replace(/\"NEXT_PUBLIC_SUPABASE_ANON_KEY\": \"[^\"]*\"/, '\"NEXT_PUBLIC_SUPABASE_ANON_KEY\": ' + JSON.stringify(key));
fs.writeFileSync('wrangler.jsonc', text);
"

export NEXT_PUBLIC_SUPABASE_URL
export NEXT_PUBLIC_SUPABASE_ANON_KEY
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-852e6fbe0ecd3f7d68a85f820f49bf10}"

npm run deploy

echo ""
echo "✅ Deploy completado: https://portalaudiovisual.apps-852.workers.dev"
