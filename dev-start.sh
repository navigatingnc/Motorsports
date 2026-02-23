#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if command -v pnpm >/dev/null 2>&1; then
  PKG_MANAGER="pnpm"
  BACKEND_CMD=(pnpm --dir "$ROOT_DIR/backend" dev)
  FRONTEND_CMD=(pnpm --dir "$ROOT_DIR/frontend" dev)
elif command -v npm >/dev/null 2>&1; then
  PKG_MANAGER="npm"
  BACKEND_CMD=(npm --prefix "$ROOT_DIR/backend" run dev)
  FRONTEND_CMD=(npm --prefix "$ROOT_DIR/frontend" run dev)
else
  echo "Error: neither pnpm nor npm is installed." >&2
  exit 1
fi

echo "Using package manager: $PKG_MANAGER"
echo "Starting backend and frontend in parallel..."

declare -a PIDS=()

cleanup() {
  echo
  echo "Stopping development servers..."
  for pid in "${PIDS[@]:-}"; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
  done
  wait || true
}

trap cleanup EXIT INT TERM

"${BACKEND_CMD[@]}" &
PIDS+=("$!")

"${FRONTEND_CMD[@]}" &
PIDS+=("$!")

wait -n "${PIDS[@]}"
