# Sync marketing launch kit to VPS and run seed
# Usage (from project root on Windows):
#   powershell -ExecutionPolicy Bypass -File scripts/vps-sync-marketing-launch.ps1
# Env:
#   $env:VPS_HOST = "root@187.127.179.138"
#   $env:VPS_PATH = "/opt/asoftech-insightz"
#   $env:RUN_SEED = "1"   # set to run seed after sync (default: 1)

$ErrorActionPreference = "Stop"
$Host_ = if ($env:VPS_HOST) { $env:VPS_HOST } else { "root@leadedge360" }
$RemotePath = if ($env:VPS_PATH) { $env:VPS_PATH } else { "/opt/asoftech-insightz" }
$RunSeed = if ($null -eq $env:RUN_SEED) { "1" } else { $env:RUN_SEED }
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$Files = @(
  "package.json",
  "lib/mongo-connect.js",
  "lib/events/types.js",
  "lib/agents/scheduled-jobs.js",
  "lib/integrations/n8n.js",
  "scripts/marketing-engine-indexes.mjs",
  "scripts/marketing-engine-seed-asoftech.mjs",
  "scripts/marketing-engine-retest.mjs",
  "scripts/vps-apply-marketing-launch.sh"
)

$Dirs = @(
  "lib/marketing-engine",
  "app/api/marketing-engine",
  "app/marketing-engine",
  "docs/marketing"
)

Write-Host "Syncing marketing launch kit to ${Host_}:${RemotePath}"
Write-Host ""

foreach ($d in $Dirs) {
  $localDir = Join-Path $Root $d
  if (-not (Test-Path $localDir)) { Write-Host "  SKIP $d (not found)"; continue }
  $parent = Split-Path $d -Parent
  if ($parent) { ssh $Host_ "mkdir -p $RemotePath/$parent" }
  scp -r $localDir "${Host_}:${RemotePath}/$parent"
  Write-Host "  -> $d/"
}

foreach ($f in $Files) {
  $local = Join-Path $Root $f
  if (-not (Test-Path $local)) { Write-Host "  SKIP $f"; continue }
  $remoteDir = "$RemotePath/$(Split-Path $f -Parent)"
  ssh $Host_ "mkdir -p $remoteDir"
  scp $local "${Host_}:${RemotePath}/$f"
  Write-Host "  -> $f"
}

Write-Host ""
if ($RunSeed -eq "1") {
  Write-Host "Running apply script on VPS..."
  ssh $Host_ "cd $RemotePath && bash scripts/vps-apply-marketing-launch.sh"
} else {
  Write-Host "Sync only. On VPS run:"
  Write-Host "  cd $RemotePath"
  Write-Host "  npm run marketing-engine:indexes"
  Write-Host "  npm run marketing-engine:seed-asoftech"
  Write-Host "  echo 'GROWTH_AUDIT_ORG_ID=asoftechinsightz' >> .env  # if not set"
  Write-Host "  docker compose build app --no-cache && docker compose up -d app"
  Write-Host "  npm run marketing-engine:retest"
}

Write-Host ""
Write-Host "Done. Open https://your-domain/marketing-engine and /campaigns"
