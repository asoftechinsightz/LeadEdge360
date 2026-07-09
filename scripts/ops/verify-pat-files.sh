#!/usr/bin/env bash
# Verify Production Acceptance Test (PAT) + War Room files exist on VPS.
# If missing, sync from dev machine (see docs/LAUNCH_WAR_ROOM.md).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

MISSING=0
check() {
  if [ -f "$1" ]; then echo "  OK   $1"
  else echo "  MISS $1"; MISSING=1; fi
}

echo "PAT / War Room file check in $ROOT"
echo ""

check "scripts/production-acceptance.mjs"
check "scripts/pat/run.mjs"
check "scripts/pat/lib.mjs"
check "scripts/ops/launch-war-room.mjs"
check "lib/billing/roles.js"

if ! grep -q 'production:acceptance' package.json 2>/dev/null; then
  echo "  MISS package.json scripts (production:acceptance, launch:warroom)"
  MISSING=1
else
  echo "  OK   package.json npm scripts"
fi

echo ""
if [ "$MISSING" -eq 1 ]; then
  echo "FAIL: Sync latest code from dev machine, then re-run."
  echo ""
  echo "From Windows (PowerShell, project root):"
  echo '  $Remote = "root@187.127.179.138"'
  echo '  $Dest = "/opt/asoftech-insightz"'
  echo '  scp package.json ${Remote}:${Dest}/'
  echo '  scp scripts/production-acceptance.mjs ${Remote}:${Dest}/scripts/'
  echo '  scp -r scripts/pat ${Remote}:${Dest}/scripts/'
  echo '  scp scripts/ops/launch-war-room.mjs ${Remote}:${Dest}/scripts/ops/'
  echo ""
  echo "Or full sync:"
  echo '  powershell -File scripts/vps-pilot-rc3-deploy.ps1 -RemotePath /opt/asoftech-insightz -SkipDeploy'
  exit 1
fi

echo "PASS: Run PAT with:"
echo "  export CERT_ADMIN_EMAIL=... CERT_ADMIN_PASSWORD=..."
echo "  export RETEST_API_BASE=http://127.0.0.1:3000/api"
echo "  export PUBLIC_URL=https://app.asoftechinsightz.com"
echo "  export PAT_STAGE=pilot PAT_REQUIRE_BACKUP=1"
echo "  npm run production:acceptance"
echo "  npm run launch:warroom"
