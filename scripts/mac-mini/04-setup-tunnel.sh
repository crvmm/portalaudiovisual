#!/usr/bin/env bash
set -euo pipefail

echo "==> Cloudflare Tunnel rápido (trycloudflare.com)"
echo ""
echo "Este comando expone http://localhost:8000 a internet."
echo "⚠️  La URL cambia cada vez que reinicias el tunnel."
echo ""
echo "Deja esta terminal ABIERTA mientras uses la plataforma."
echo ""
echo "Comando:"
echo "  cloudflared tunnel --url http://localhost:8000"
echo ""
read -r -p "¿Iniciar el tunnel ahora? [s/N] " answer

if [[ "${answer,,}" == "s" || "${answer,,}" == "y" ]]; then
  echo ""
  echo "Copia la URL https://....trycloudflare.com que aparezca abajo."
  echo "Úsala como NEXT_PUBLIC_SUPABASE_URL al redesplegar Cloudflare."
  echo ""
  exec cloudflared tunnel --url http://localhost:8000
else
  echo ""
  echo "Cuando quieras, ejecuta manualmente:"
  echo "  cloudflared tunnel --url http://localhost:8000"
fi
