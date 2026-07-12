#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ -f .env.deploy ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.deploy
  set +a
fi

: "${NEXT_PUBLIC_SUPABASE_URL:?Define NEXT_PUBLIC_SUPABASE_URL in .env.deploy (tunnel URL)}"
: "${NEXT_PUBLIC_SUPABASE_ANON_KEY:?Define NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.deploy}"

export NEXT_PUBLIC_SUPABASE_URL
export NEXT_PUBLIC_SUPABASE_ANON_KEY

DEPLOY_DIR=".open-next/pages-deploy"

echo "==> Building OpenNext bundle..."
echo "    Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
./node_modules/.bin/opennextjs-cloudflare build

echo "==> Preparing Pages advanced mode bundle..."
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copiar módulos del worker (cloudflare/, middleware/, server-functions/, etc.)
rsync -a \
  --exclude assets \
  --exclude pages-deploy \
  .open-next/ "$DEPLOY_DIR/"

# Estáticos en la raíz del deploy (Pages sirve CDN + worker en advanced mode)
rsync -a .open-next/assets/ "$DEPLOY_DIR/"

# Worker de Pages (advanced mode)
cp .open-next/worker.js "$DEPLOY_DIR/_worker.js"

cat > "$DEPLOY_DIR/_routes.json" <<'EOF'
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/_next/static/*"]
}
EOF

echo "✅ Bundle listo en $DEPLOY_DIR"
