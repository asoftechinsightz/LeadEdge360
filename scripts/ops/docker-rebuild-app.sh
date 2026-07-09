#!/usr/bin/env bash
# Rebuild app container after syncing source to VPS.
# Refreshes yarn.lock if needed, then builds and restarts asoftech-app.
set -euo pipefail
cd "$(dirname "$0")/../.."

echo "==> yarn install (refresh lockfile if needed)"
yarn install

echo "==> docker compose build + up app"
docker compose up -d --no-deps --build app

echo "==> health check"
sleep 5
curl -fsS http://127.0.0.1:3000/api/health/ready | head -c 200
echo ""
echo "Done. Run: npm run production:acceptance"
