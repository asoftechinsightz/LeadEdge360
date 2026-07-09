# Sync RC3 pilot bundle to Hostinger VPS and execute pilot deployment.
# Requires: OpenSSH (ssh/scp), SSH key for root@187.127.179.138
#
# Usage:
#   $env:CERT_ADMIN_EMAIL = "admin@asoftechinsightz.com"
#   $env:CERT_ADMIN_PASSWORD = "your-password"
#   $env:PUBLIC_URL = "https://app.asoftechinsightz.com"
#   powershell -ExecutionPolicy Bypass -File scripts/vps-pilot-rc3-deploy.ps1
#
param(
  [string]$VpsHost = "187.127.179.138",
  [string]$VpsUser = "root",
  [string]$RemotePath = "/opt/asoftech-insightz",
  [string]$Version = "v1.0.0-rc3-pilot"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Archive = Join-Path $env:TEMP "asoftech-pilot-rc3.tar.gz"
$Remote = "${VpsUser}@${VpsHost}"

Write-Host ">> Pilot RC3 deploy to ${Remote}:${RemotePath}"
Write-Host ">> Version: $Version"

if (-not $env:CERT_ADMIN_EMAIL -or -not $env:CERT_ADMIN_PASSWORD) {
  Write-Warning "Set CERT_ADMIN_EMAIL and CERT_ADMIN_PASSWORD for smoke tests"
}

Push-Location $Root
try {
  tar -czf $Archive `
    --exclude=node_modules `
    --exclude=.next `
    --exclude=.git `
    --exclude=mobile/android/app/.cxx `
    --exclude=*.tar.gz `
    .
} finally {
  Pop-Location
}

Write-Host ">> Uploading archive..."
scp $Archive "${Remote}:/tmp/asoftech-pilot-rc3.tar.gz"

$RemoteScript = @"
set -euo pipefail
cd $RemotePath
mkdir -p _incoming
tar -xzf /tmp/asoftech-pilot-rc3.tar.gz -C _incoming
rsync -a --exclude=node_modules --exclude=.next --exclude=.env _incoming/ ./
rm -rf _incoming /tmp/asoftech-pilot-rc3.tar.gz
chmod +x scripts/ops/*.sh scripts/mongo-backup.sh scripts/security/*.sh 2>/dev/null || true
export PILOT_VERSION='$Version'
export PUBLIC_URL='${env:PUBLIC_URL}'
export CERT_ADMIN_EMAIL='${env:CERT_ADMIN_EMAIL}'
export CERT_ADMIN_PASSWORD='${env:CERT_ADMIN_PASSWORD}'
export RETEST_API_BASE='http://127.0.0.1:3000/api'
export SECURITY_CHECK_URL='${env:PUBLIC_URL}'
bash scripts/ops/pilot-production-deploy.sh
"@

Write-Host ">> Executing pilot deployment on VPS..."
ssh $Remote $RemoteScript

Write-Host ""
Write-Host "OK Pilot deployment complete."
Write-Host "Fetch report: scp ${Remote}:${RemotePath}/docs/deployments/PILOT_RC3_DEPLOYMENT_REPORT.md ./docs/deployments/"
