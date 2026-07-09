#!/usr/bin/env bash
# Install pilot:provision on VPS when scripts/provision-pilot-org.mjs is already present.
# Usage:
#   cd /opt/asoftech-insightz
#   bash scripts/vps-install-pilot-provision.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROVISION="$ROOT/scripts/provision-pilot-org.mjs"
PKG="$ROOT/package.json"

if [[ ! -f "$PROVISION" ]]; then
  echo "[install] missing $PROVISION"
  echo ""
  echo "Copy from your dev machine (PowerShell):"
  echo "  cd D:\\AsoftechInsightz_Project\\asoftech-insightz"
  echo "  scp scripts/provision-pilot-org.mjs root@leadedge360:/opt/asoftech-insightz/scripts/"
  echo "  scp lib/password.js root@leadedge360:/opt/asoftech-insightz/lib/"
  echo "  ssh root@leadedge360 mkdir -p /opt/asoftech-insightz/lib/agents"
  echo "  scp lib/agents/industry-profiles.js root@leadedge360:/opt/asoftech-insightz/lib/agents/"
  echo "  scp package.json root@leadedge360:/opt/asoftech-insightz/"
  exit 1
fi

node <<'NODE'
const fs = require('fs')
const pkgPath = 'package.json'
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
pkg.scripts = pkg.scripts || {}
if (!pkg.scripts['pilot:provision']) {
  pkg.scripts['pilot:provision'] = 'node scripts/provision-pilot-org.mjs'
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n')
  console.log('[install] added pilot:provision to package.json')
} else {
  console.log('[install] pilot:provision already in package.json')
}
NODE

for dep in lib/password.js lib/agents/industry-profiles.js lib/mongo-connect.js; do
  if [[ ! -f "$ROOT/$dep" ]]; then
    echo "[install] WARNING missing dependency: $dep"
  fi
done

echo ""
echo "[install] verify:"
grep -n 'pilot:provision' package.json || true
ls -la scripts/provision-pilot-org.mjs
echo ""
echo "Run: npm run pilot:provision -- --dry-run"
