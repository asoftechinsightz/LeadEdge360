# Pack marketing launch bundle (Windows)
# Usage: powershell -ExecutionPolicy Bypass -File scripts/pack-marketing-launch.ps1

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Out = Join-Path $Root "marketing-launch-bundle.tar.gz"

Push-Location $Root
try {
  if (Test-Path $Out) { Remove-Item $Out -Force }

  $paths = @(
    "package.json",
    "lib/mongo-connect.js",
    "lib/events/types.js",
    "lib/agents/scheduled-jobs.js",
    "lib/integrations/n8n.js",
    "lib/marketing-engine",
    "app/api/marketing-engine",
    "app/api/growth-audit",
    "app/marketing-engine",
    "app/growth-audit",
    "scripts/marketing-engine-indexes.mjs",
    "scripts/marketing-engine-seed-asoftech.mjs",
    "scripts/marketing-engine-retest.mjs",
    "scripts/marketing-engine-diagnose.mjs",
    "scripts/vps-apply-marketing-launch.sh",
    "scripts/vps-setup-week2-social-autopilot.sh",
    "scripts/bulk-queue-hot-leads.mjs",
    "scripts/vps-queue-hot-leads-standalone.mjs",
    "lib/sales/bulk-hot-workflow.js",
    "app/api/sales/leads/bulk-workflow",
    "components/leadedge360/LeadsManagement.js",
    "docs/sales",
    "public/images/brand/asoftechinsightz-logo.png",
    "docs/marketing",
    "docs/nginx.conf"
  )

  foreach ($p in $paths) {
    if (-not (Test-Path (Join-Path $Root $p))) {
      throw "Missing path: $p"
    }
  }

  & tar czf $Out @paths
  Write-Host ""
  Write-Host "Created: $Out"
  Write-Host ""
  Write-Host "Upload to VPS:"
  Write-Host "  scp marketing-launch-bundle.tar.gz root@leadedge360:/opt/asoftech-insightz/"
  Write-Host ""
  Write-Host "On VPS:"
  Write-Host "  cd /opt/asoftech-insightz"
  Write-Host "  tar xzf marketing-launch-bundle.tar.gz"
  Write-Host "  bash scripts/vps-apply-marketing-launch.sh"
}
finally {
  Pop-Location
}
