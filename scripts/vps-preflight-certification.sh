#!/usr/bin/env bash
# Verify certification tooling is present before runtime certification.
# Usage: bash scripts/vps-preflight-certification.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(dirname "$SCRIPT_DIR")}"
cd "$APP_DIR"

echo "==> LeadEdge360 certification preflight @ $APP_DIR"
echo ""

MISSING=0

require_file() {
  if [[ -f "$1" ]]; then
    echo "  OK   $1"
  else
    echo "  MISS $1"
    MISSING=1
  fi
}

require_file "lib/mongo-connect.js"
require_file "scripts/mongo-connect-env.mjs"
require_file "scripts/mongo-atlas-check.mjs"
require_file "scripts/mongo-indexes.mjs"
require_file "scripts/runtime-vps-certification.mjs"
require_file "scripts/vps-runtime-certification.sh"

if grep -q '"cert:runtime"' package.json 2>/dev/null; then
  echo "  OK   package.json cert:runtime script"
else
  echo "  MISS package.json cert:runtime script"
  MISSING=1
fi

if grep -q 'mongo-connect' scripts/mongo-atlas-check.mjs 2>/dev/null; then
  echo "  OK   mongo-atlas-check uses mongo-connect"
else
  echo "  MISS mongo-atlas-check not updated (still uses raw MONGO_URL)"
  MISSING=1
fi

echo ""

if [[ $MISSING -ne 0 ]]; then
  echo "FAIL: Certification tooling is out of date on this server."
  echo ""
  echo "Sync these files from your dev machine, then re-run:"
  echo "  lib/mongo-connect.js"
  echo "  scripts/mongo-connect-env.mjs"
  echo "  scripts/mongo-atlas-check.mjs"
  echo "  scripts/mongo-indexes.mjs"
  echo "  scripts/runtime-vps-certification.mjs"
  echo "  scripts/vps-runtime-certification.sh"
  echo "  scripts/go-live-retest.mjs"
  echo "  package.json"
  echo ""
  echo "Example (from Windows dev machine):"
  echo "  scp -r lib/mongo-connect.js scripts/mongo-connect-env.mjs scripts/mongo-atlas-check.mjs \\"
  echo "      scripts/mongo-indexes.mjs scripts/runtime-vps-certification.mjs \\"
  echo "      scripts/vps-runtime-certification.sh scripts/vps-preflight-certification.sh \\"
  echo "      package.json root@leadedge360:/opt/asoftech-insightz/"
  echo ""
  exit 1
fi

echo "==> Mongo connection test (auto host detection)"
eval "$(node scripts/mongo-connect-env.mjs --shell)"
echo "    mode=${MONGO_EXECUTION_MODE:-?}  host=${MONGO_EXPECTED_HOST:-?}  db=${DB_NAME:-?}"

if ! node scripts/mongo-connect-env.mjs --validate; then
  echo ""
  echo "==> Docker credential probe (uses MONGO_USERNAME / MONGO_PASSWORD from .env)"
  set -a
  # shellcheck disable=SC1091
  [[ -f .env ]] && source <(grep -E '^(MONGO_USERNAME|MONGO_PASSWORD)=' .env | sed 's/\r$//')
  set +a
  if [[ -n "${MONGO_USERNAME:-}" && -n "${MONGO_PASSWORD:-}" ]]; then
    if docker exec asoftech-mongo mongosh admin -u "$MONGO_USERNAME" -p "$MONGO_PASSWORD" --quiet --eval "db.runCommand({ping:1}).ok" 2>/dev/null | grep -q 1; then
      echo "    Docker mongosh auth: OK (credentials valid inside container)"
      echo "    Re-sync lib/mongo-connect.js if host scripts still fail — latest build prefers MONGO_USERNAME/MONGO_PASSWORD"
    else
      echo "    Docker mongosh auth: FAILED — update MONGO_USERNAME/MONGO_PASSWORD in .env to match the mongo volume"
    fi
  fi
  exit 1
fi

echo ""
echo "PASS: Preflight complete. Run: bash scripts/vps-runtime-certification.sh"
echo ""
