#!/usr/bin/env bash
# Deploy marketing website + app rebuild on VPS.
# Run ON the server after syncing code to /opt/asoftech-insightz
set -euo pipefail

ROOT="${ROOT:-/opt/asoftech-insightz}"
cd "$ROOT"

echo "==> Deploy from $ROOT"
git rev-parse --short HEAD 2>/dev/null || echo "(no git)"

echo "==> Docker build app (no cache)"
docker compose build app --no-cache

echo "==> Recreate app container"
docker compose up -d app

echo "==> Connect shared edge network (observability360)"
docker network connect observability360_default asoftech-app 2>/dev/null || echo "Already on observability360_default"

echo "==> Health check"
sleep 8
curl -fsS http://127.0.0.1:3000/api/health/live | head -c 200 || true
echo ""

echo "==> Done. Verify: https://www.asoftechinsightz.com"
