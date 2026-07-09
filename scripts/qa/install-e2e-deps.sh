#!/usr/bin/env bash
# Install Playwright E2E dev deps on VPS (use npm install — project Docker build uses yarn.lock).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "[e2e-deps] Installing @axe-core/playwright..."
npm install @axe-core/playwright@^4.10.2 --save-dev --no-fund --no-audit

echo "[e2e-deps] Ensuring Playwright browsers..."
node node_modules/@playwright/test/cli.js install chromium

if [[ "${INSTALL_ALL_BROWSERS:-0}" == "1" ]]; then
  echo "[e2e-deps] Installing Firefox + WebKit system libraries (requires root)..."
  if [[ "${EUID:-$(id -u)}" -eq 0 ]]; then
    bash scripts/qa/install-playwright-all-browsers-deps.sh
  else
    sudo bash scripts/qa/install-playwright-all-browsers-deps.sh
  fi
  node node_modules/@playwright/test/cli.js install firefox webkit
fi

echo "[e2e-deps] Done. Run: E2E_BASE_URL=https://app.asoftechinsightz.com npm run test:e2e:enterprise"
