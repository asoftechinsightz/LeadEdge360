# Deploy latest code to VPS, then build RetailEdge360 release APK.
# Requires: OpenSSH (scp/ssh), SSH key for root@187.127.179.138, Flutter SDK
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/ops/deploy-vps-then-mobile.ps1
#   powershell -ExecutionPolicy Bypass -File scripts/ops/deploy-vps-then-mobile.ps1 -SkipMobile
#   powershell -ExecutionPolicy Bypass -File scripts/ops/deploy-vps-then-mobile.ps1 -SkipDeploy

param(
  [string]$VpsHost = "187.127.179.138",
  [string]$VpsUser = "root",
  [string]$RemotePath = "/opt/asoftech-insightz",
  [string]$ApiBaseUrl = "https://asoftechinsightz.com/api",
  [switch]$SkipDeploy,
  [switch]$SkipMobile,
  [switch]$SkipTests
)

$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$Bundle = Join-Path $Root "asoftech-insightz-deploy.tar.gz"
$Remote = "${VpsUser}@${VpsHost}"

function Test-SshAccess {
  ssh -o BatchMode=yes -o ConnectTimeout=10 $Remote "echo ok" 2>$null
  return $LASTEXITCODE -eq 0
}

if (-not $SkipDeploy) {
  Write-Host "==> Step 1/2: Deploy to VPS ($Remote)" -ForegroundColor Cyan

  if (-not (Test-SshAccess)) {
    Write-Host ""
    Write-Host "SSH key not configured for $Remote." -ForegroundColor Red
    Write-Host "Fix one of:" -ForegroundColor Yellow
    Write-Host "  1. Add your public key: ssh-copy-id $Remote"
    Write-Host "  2. Or use GitHub Actions: push to main (Deploy to VPS workflow)"
    Write-Host ""
    Write-Host "Manual deploy (after fixing SSH):" -ForegroundColor Yellow
    Write-Host "  powershell -ExecutionPolicy Bypass -File scripts/ops/create-deploy-bundle.ps1"
    Write-Host "  scp `"$Bundle`" ${Remote}:/opt/"
    Write-Host "  ssh $Remote 'cd $RemotePath && tar -xzf ../asoftech-insightz-deploy.tar.gz && bash scripts/ops/vps-deploy-website.sh'"
    exit 1
  }

  & (Join-Path $Root "scripts\ops\create-deploy-bundle.ps1")

  Write-Host ">> Uploading bundle..."
  scp $Bundle "${Remote}:/opt/asoftech-insightz-deploy.tar.gz"

  $RemoteScript = @"
set -euo pipefail
cd $RemotePath
tar -xzf ../asoftech-insightz-deploy.tar.gz
bash scripts/ops/vps-deploy-website.sh
curl -fsS http://127.0.0.1:3000/api/health/live | head -c 300 || true
echo ""
"@

  Write-Host ">> Running deploy on VPS..."
  ssh $Remote $RemoteScript
  Write-Host "OK VPS deploy complete." -ForegroundColor Green
} else {
  Write-Host "==> Skipping VPS deploy (-SkipDeploy)" -ForegroundColor Yellow
}

if (-not $SkipMobile) {
  Write-Host ""
  Write-Host "==> Step 2/2: Build release APK (API=$ApiBaseUrl)" -ForegroundColor Cyan
  $buildArgs = @(
    "-ExecutionPolicy", "Bypass",
    "-File", (Join-Path $Root "mobile\scripts\build-apk.ps1"),
    "-ApiBaseUrl", $ApiBaseUrl
  )
  if ($SkipTests) { $buildArgs += "-SkipTests" }
  & powershell @buildArgs
} else {
  Write-Host "==> Skipping mobile build (-SkipMobile)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "All done." -ForegroundColor Green
