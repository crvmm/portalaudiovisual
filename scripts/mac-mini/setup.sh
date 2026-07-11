#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Portal Audiovisual — Setup Mac Mini (Supabase + Tunnel) ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

"$SCRIPT_DIR/01-install-prerequisites.sh"
echo ""
"$SCRIPT_DIR/02-setup-supabase.sh"
echo ""
"$SCRIPT_DIR/03-apply-migrations.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Último paso manual: abre el tunnel en otra terminal:"
echo "  ./scripts/mac-mini/04-setup-tunnel.sh"
echo ""
echo "Luego, en el Mac de desarrollo, crea .env.deploy y redespliega:"
echo "  ./scripts/mac-mini/05-redeploy-cloudflare.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
