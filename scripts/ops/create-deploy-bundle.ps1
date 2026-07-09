# Create deploy tarball for VPS sync (run on Windows dev machine)
$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$Out = Join-Path $Root "asoftech-insightz-deploy.tar.gz"

Write-Host "Creating bundle from $Root"

if (Get-Command tar -ErrorAction SilentlyContinue) {
  Push-Location $Root
  tar --exclude=node_modules --exclude=.next --exclude=.git --exclude=mobile/build --exclude=asoftech-insightz-deploy.tar.gz -czf $Out .
  Pop-Location
  Write-Host "Created: $Out"
  Write-Host ""
  Write-Host "Upload to VPS (from PowerShell with SSH access):"
  Write-Host "  scp `"$Out`" root@187.127.179.138:/opt/"
  Write-Host ""
  Write-Host "On VPS:"
  Write-Host "  cd /opt/asoftech-insightz"
  Write-Host "  tar -xzf ../asoftech-insightz-deploy.tar.gz"
  Write-Host "  bash scripts/ops/vps-deploy-website.sh"
} else {
  Write-Error "tar not found. Use Git sync or WSL tar."
}
