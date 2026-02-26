#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required but not installed." >&2
  exit 1
fi

PKG_MANAGER=""

if command -v pnpm >/dev/null 2>&1; then
  PKG_MANAGER="pnpm"
elif command -v corepack >/dev/null 2>&1; then
  echo "pnpm not found. Bootstrapping pnpm via corepack..."
  corepack enable
  corepack prepare pnpm@10.13.1 --activate
  if command -v pnpm >/dev/null 2>&1; then
    PKG_MANAGER="pnpm"
  fi
fi

if [[ -z "$PKG_MANAGER" ]]; then
  if command -v npm >/dev/null 2>&1; then
    PKG_MANAGER="npm"
  else
    echo "Error: no supported package manager found (pnpm/npm)." >&2
    exit 1
  fi
fi

echo "Using package manager: $PKG_MANAGER"

if [[ "$PKG_MANAGER" == "pnpm" ]]; then
  pnpm --dir "$ROOT_DIR/backend" install
  pnpm --dir "$ROOT_DIR/frontend" install
  pnpm --dir "$ROOT_DIR/backend" prisma:generate
else
  npm --prefix "$ROOT_DIR/backend" install
  npm --prefix "$ROOT_DIR/frontend" install
  npm --prefix "$ROOT_DIR/backend" run prisma:generate
fi

echo "✅ Setup complete. Start both apps with: ./dev-start.sh"
