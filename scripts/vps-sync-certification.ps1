# Sync certification tooling to VPS (run from project root on Windows)
# Usage: powershell -ExecutionPolicy Bypass -File scripts/vps-sync-certification.ps1
# Env: $env:VPS_HOST = "root@leadedge360"
#      $env:VPS_PATH = "/opt/asoftech-insightz"

$ErrorActionPreference = "Stop"
$Host_ = if ($env:VPS_HOST) { $env:VPS_HOST } else { "root@leadedge360" }
$RemotePath = if ($env:VPS_PATH) { $env:VPS_PATH } else { "/opt/asoftech-insightz" }
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

$Files = @(
  "lib/mongo-connect.js",
  "scripts/mongo-connect-env.mjs",
  "scripts/mongo-atlas-check.mjs",
  "scripts/mongo-indexes.mjs",
  "scripts/runtime-vps-certification.mjs",
  "scripts/vps-runtime-certification.sh",
  "scripts/vps-preflight-certification.sh",
  "scripts/go-live-retest.mjs",
  "scripts/foundation-retest.mjs",
  "scripts/agent-runtime-retest.mjs",
  "scripts/certification-e2e-workflow.mjs",
  "scripts/tenant-isolation-retest.mjs",
  "scripts/pilot-deploy-verify.mjs",
  "scripts/pre-docker-build-check.mjs",
  "scripts/set-admin-password.mjs",
  "package.json"
)

Write-Host "Syncing certification tooling to ${Host_}:${RemotePath}"
Write-Host "From: $Root"
Write-Host ""

foreach ($f in $Files) {
  $local = Join-Path $Root $f
  if (-not (Test-Path $local)) { throw "Missing local file: $local" }
  $remoteDir = "$RemotePath/$(Split-Path $f -Parent)"
  ssh $Host_ "mkdir -p $remoteDir"
  scp $local "${Host_}:${RemotePath}/$f"
  Write-Host "  -> $f"
}

Write-Host ""
Write-Host "Done. On VPS run:"
Write-Host "  cd $RemotePath"
Write-Host "  chmod +x scripts/vps-*.sh"
Write-Host "  bash scripts/vps-preflight-certification.sh"
Write-Host "  bash scripts/vps-runtime-certification.sh"
