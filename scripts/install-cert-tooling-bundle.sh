#!/usr/bin/env bash
# Install certification tooling from cert-tooling-bundle.tar.gz
# Usage (on VPS):
#   cd /opt/asoftech-insightz
#   # after uploading cert-tooling-bundle.tar.gz to this directory:
#   bash scripts/install-cert-tooling-bundle.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/asoftech-insightz}"
BUNDLE="${1:-$APP_DIR/cert-tooling-bundle.tar.gz}"

cd "$APP_DIR"

if [[ ! -f "$BUNDLE" ]]; then
  echo "FAIL: Bundle not found: $BUNDLE"
  echo ""
  echo "Upload cert-tooling-bundle.tar.gz from your dev machine:"
  echo "  scp cert-tooling-bundle.tar.gz root@YOUR_VPS_IP:/opt/asoftech-insightz/"
  echo ""
  echo "Or copy these files via Cursor Remote SSH:"
  echo "  lib/mongo-connect.js"
  echo "  scripts/mongo-connect-env.mjs"
  echo "  scripts/mongo-atlas-check.mjs"
  echo "  scripts/mongo-indexes.mjs"
  echo "  scripts/runtime-vps-certification.mjs"
  echo "  scripts/vps-runtime-certification.sh"
  echo "  scripts/vps-preflight-certification.sh"
  echo "  scripts/go-live-retest.mjs"
  echo "  package.json"
  exit 1
fi

echo "==> Extracting $BUNDLE into $APP_DIR"
tar -xzf "$BUNDLE" -C "$APP_DIR"
chmod +x scripts/vps-*.sh 2>/dev/null || true

echo "==> Installed files:"
ls -la lib/mongo-connect.js scripts/mongo-connect-env.mjs scripts/vps-preflight-certification.sh

echo ""
echo "==> Run preflight:"
echo "  bash scripts/vps-preflight-certification.sh"
echo ""
