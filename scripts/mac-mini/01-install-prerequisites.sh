#!/usr/bin/env bash
set -euo pipefail

echo "==> Instalando prerequisitos para Supabase self-hosted (Mac Mini)"

if ! command -v brew &>/dev/null; then
  echo "Homebrew no encontrado. Instálalo desde https://brew.sh"
  exit 1
fi

if ! command -v docker &>/dev/null; then
  echo "Instalando Docker Desktop..."
  brew install --cask docker
  echo ""
  echo "Abre Docker Desktop y espera a que arranque:"
  echo "  open -a Docker"
  echo "  docker info   # debe responder sin error"
else
  echo "✓ Docker ya instalado"
fi

if ! command -v cloudflared &>/dev/null; then
  echo "Instalando cloudflared..."
  brew install cloudflared
else
  echo "✓ cloudflared ya instalado"
fi

if ! command -v psql &>/dev/null; then
  echo "Instalando libpq (cliente psql)..."
  brew install libpq
  echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc 2>/dev/null || true
else
  echo "✓ psql ya instalado"
fi

echo ""
echo "✅ Prerequisitos listos."
echo "   Siguiente paso: ./scripts/mac-mini/02-setup-supabase.sh"
