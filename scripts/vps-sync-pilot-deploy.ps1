# Sync certification + Docker build sources to VPS
# Usage (from project root on Windows):
#   powershell -ExecutionPolicy Bypass -File scripts/vps-sync-pilot-deploy.ps1
# Env: $env:VPS_HOST = "root@leadedge360"
#      $env:VPS_PATH = "/opt/asoftech-insightz"

$ErrorActionPreference = "Stop"
$Host_ = if ($env:VPS_HOST) { $env:VPS_HOST } else { "root@leadedge360" }
$RemotePath = if ($env:VPS_PATH) { $env:VPS_PATH } else { "/opt/asoftech-insightz" }
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$Files = @(
  "package.json",
  "lib/mongo-connect.js",
  "lib/password.js",
  "lib/billing/plan-map.js",
  "scripts/mongo-connect-env.mjs",
  "scripts/mongo-atlas-check.mjs",
  "scripts/mongo-indexes.mjs",
  "scripts/runtime-vps-certification.mjs",
  "scripts/vps-runtime-certification.sh",
  "scripts/vps-preflight-certification.sh",
  "scripts/pilot-deploy-verify.mjs",
  "scripts/pre-docker-build-check.mjs",
  "scripts/foundation-retest.mjs",
  "scripts/agent-runtime-retest.mjs",
  "scripts/certification-e2e-workflow.mjs",
  "scripts/go-live-retest.mjs",
  "scripts/tenant-isolation-retest.mjs",
  "scripts/set-admin-password.mjs",
  "scripts/provision-pilot-org.mjs",
  "docs/platform/PILOT_PROVISIONING.md",
  "app/api/platform/health/route.js",
  "app/api/platform/events/route.js",
  "app/api/activities/route.js"
)

$Dirs = @(
  "app/api/platform",
  "app/api/activities",
  "lib/events",
  "lib/billing",
  "lib/agents"
)

Write-Host "Syncing pilot deploy bundle to ${Host_}:${RemotePath}"
Write-Host "From: $Root"
Write-Host ""

foreach ($d in $Dirs) {
  $localDir = Join-Path $Root $d
  if (-not (Test-Path $localDir)) { throw "Missing local directory: $localDir" }
  ssh $Host_ "mkdir -p $RemotePath/$d"
  scp -r $localDir "${Host_}:${RemotePath}/$(Split-Path $d -Parent)"
  Write-Host "  -> $d/ (recursive)"
}

foreach ($f in $Files) {
  $local = Join-Path $Root $f
  if (-not (Test-Path $local)) { Write-Host "  SKIP $f (not found locally)"; continue }
  $remoteDir = "$RemotePath/$(Split-Path $f -Parent)"
  ssh $Host_ "mkdir -p $remoteDir"
  scp $local "${Host_}:${RemotePath}/$f"
  Write-Host "  -> $f"
}

Write-Host ""
Write-Host "Done. On VPS run:"
Write-Host "  cd $RemotePath"
Write-Host "  node scripts/pre-docker-build-check.mjs"
Write-Host "  docker compose build app --no-cache"
Write-Host "  docker compose up -d app"
Write-Host "  export CERT_ADMIN_EMAIL=... CERT_ADMIN_PASSWORD=... RETEST_API_BASE=http://127.0.0.1:3000/api"
Write-Host "  npm run pilot:verify"
Write-Host "  npm run pilot:provision -- --dry-run"
Write-Host "  npm run cert:runtime"
