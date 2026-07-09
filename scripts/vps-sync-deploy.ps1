# Sync local code to VPS and run Sprint 0 staging deploy.
# Requires: OpenSSH client (scp/ssh), SSH key for root@187.127.179.138
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/vps-sync-deploy.ps1
#   powershell -ExecutionPolicy Bypass -File scripts/vps-sync-deploy.ps1 -SkipDeploy

param(
  [string]$VpsHost = "187.127.179.138",
  [string]$VpsUser = "root",
  [string]$RemotePath = "/opt/asoftech",
  [switch]$SkipDeploy
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Archive = Join-Path $env:TEMP "asoftech-insightz-sprint0.tar.gz"

Write-Host ">> Creating archive (excluding node_modules, .next, .git)..."
Push-Location $Root
try {
  if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar -czf $Archive `
      --exclude=node_modules `
      --exclude=.next `
      --exclude=.git `
      --exclude=*.tar.gz `
      .
  } else {
    throw "tar not found. Install Git for Windows or use git push + git pull on VPS."
  }
} finally {
  Pop-Location
}

$Remote = "${VpsUser}@${VpsHost}"
Write-Host ">> Uploading to ${Remote}:${RemotePath} ..."
scp $Archive "${Remote}:/tmp/asoftech-sprint0.tar.gz"

$RemoteScript = @"
set -euo pipefail
cd $RemotePath
mkdir -p _incoming
tar -xzf /tmp/asoftech-sprint0.tar.gz -C _incoming
rsync -a --delete --exclude=node_modules --exclude=.next --exclude=.env _incoming/ ./
rm -rf _incoming /tmp/asoftech-sprint0.tar.gz
npm install
"@

if (-not $SkipDeploy) {
  $RemoteScript += @"

echo '▶ Starting mongo...'
docker compose up -d mongo

echo '▶ Checking if dev server on 3007 is up...'
if ! curl -fsS http://127.0.0.1:3007/api/ >/dev/null 2>&1; then
  echo '⚠ Dev server not running on 3007.'
  echo '  Start in another SSH session:'
  echo '    cd $RemotePath && npm run dev -- --hostname 0.0.0.0 --port 3007'
  echo '  Then run: export RETEST_API_BASE=http://127.0.0.1:3007/api && npm run deploy:s0h'
  exit 0
fi

export RETEST_API_BASE=http://127.0.0.1:3007/api
npm run deploy:s0h
"@
}

Write-Host ">> Running remote sync on VPS..."
ssh $Remote $RemoteScript

Write-Host "OK Done. Staging URL: http://${VpsHost}:3007"
