#!/usr/bin/env bash
# Pilot Production Deployment — Hostinger VPS (RC3)
# Orchestrates all 10 pilot deployment steps with rollback readiness.
#
# Usage (on VPS as root in /opt/asoftech):
#   export CERT_ADMIN_EMAIL=admin@example.com
#   export CERT_ADMIN_PASSWORD='...'
#   export PUBLIC_URL=https://app.asoftechinsightz.com
#   bash scripts/ops/pilot-production-deploy.sh
#
# From Windows (sync + remote run):
#   powershell -File scripts/vps-pilot-rc3-deploy.ps1
set -euo pipefail

VERSION="${PILOT_VERSION:-v1.0.0-rc3-pilot}"
STAGE="pilot"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
REPORT_DIR="${ROOT}/docs/deployments"
mkdir -p "$REPORT_DIR"

log() { echo "[pilot-rc3] $*"; }
fail() { log "FAIL: $*"; exit 1; }

cd "$ROOT"
export DEPLOY_STAGE="$STAGE"
export HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/api/health/ready}"
export SECURITY_CHECK_URL="${SECURITY_CHECK_URL:-${PUBLIC_URL:-http://127.0.0.1:3000}}"

log "=== Pilot Production Deployment ${VERSION} ==="
log "Root: $ROOT"
log "Public URL: ${PUBLIC_URL:-not set}"

# --- Step 1: Validate production environment ---
log "Step 1/10 — Environment validation"
node scripts/ops/validate-env.mjs --stage pilot || fail "environment validation"
node scripts/ops/verify-uploads.mjs || fail "upload storage validation"

# --- Step 2: Verified MongoDB backup ---
log "Step 2/10 — Pre-deploy MongoDB backup"
bash scripts/ops/backup-schedule.sh daily || fail "backup failed"
LATEST_BACKUP="$(find "${BACKUP_ROOT:-/opt/asoftech/backups}/daily" -name '*.archive.gz' 2>/dev/null | sort | tail -1 || true)"
if [ -z "$LATEST_BACKUP" ] || [ ! -f "$LATEST_BACKUP" ]; then
  LATEST_BACKUP="$(find "${ROOT}/backups" -name '*.archive.gz' 2>/dev/null | sort | tail -1 || true)"
fi
if [ -n "$LATEST_BACKUP" ] && [ -f "$LATEST_BACKUP" ]; then
  BACKUP_SIZE="$(stat -c%s "$LATEST_BACKUP" 2>/dev/null || stat -f%z "$LATEST_BACKUP" 2>/dev/null || echo 0)"
  if [ "$BACKUP_SIZE" -lt 1000 ]; then
    fail "backup file too small: $LATEST_BACKUP"
  fi
  log "Verified backup: $LATEST_BACKUP (${BACKUP_SIZE} bytes)"
  node -e "
    const fs=require('fs');
    const p='${REPORT_DIR}/pilot-backup-verification.json';
    fs.writeFileSync(p, JSON.stringify({
      generatedAt: new Date().toISOString(),
      archive: '${LATEST_BACKUP}',
      sizeBytes: ${BACKUP_SIZE},
      verified: true
    }, null, 2));
  "
else
  fail "no backup archive found after backup-schedule.sh"
fi

# --- Step 3: Migration validation + apply ---
log "Step 3/10 — Migration validation and apply"
node scripts/migration-validate.mjs || fail "migration dry-run validation"
node database/migrations/run.mjs up || fail "migration apply"
node -e "
  const fs=require('fs');
  fs.writeFileSync('${REPORT_DIR}/pilot-migration-report.json', JSON.stringify({
    generatedAt: new Date().toISOString(),
    status: 'applied',
    runner: 'database/migrations/run.mjs up'
  }, null, 2));
"

# --- Step 4: Deploy with auto-rollback ---
log "Step 4/10 — Production deploy (rolling + rollback)"
bash scripts/ops/deploy-production.sh pilot "$VERSION" || fail "deploy rolled back or failed"

# --- Step 5: Monitoring stack ---
log "Step 5/10 — Monitoring stack (Prometheus, Grafana, exporters)"
bash scripts/ops/deploy-monitoring.sh || fail "monitoring verification"

# --- Step 6: Production Acceptance Test ---
log "Step 6/10 — Production Acceptance Test (PAT)"
export RETEST_API_BASE="${RETEST_API_BASE:-http://127.0.0.1:3000/api}"
export PAT_STAGE=pilot
export PAT_REQUIRE_BACKUP=1
npm run production:acceptance || fail "Production Acceptance Test FAILED — do not promote to customers"

# --- Step 7: SSL / security headers ---
log "Step 7/10 — SSL, HSTS, CSP verification"
if [ -n "${PUBLIC_URL:-}" ]; then
  node scripts/ops/verify-ssl.mjs || log "WARN SSL check failed — verify certbot/Caddy manually"
  SECURITY_CHECK_URL="$PUBLIC_URL" node scripts/security/headers-check.mjs || log "WARN headers check — review on HTTPS URL"
else
  node scripts/security/headers-check.mjs || log "WARN local headers check only"
fi

# --- Step 8: Automated backup scheduling ---
log "Step 8/10 — Backup cron + retention"
bash scripts/ops/install-backup-cron.sh || log "WARN cron install skipped — install manually"

# --- Step 9: Publish reports ---
log "Step 9/10 — Publishing deployment reports"
node scripts/ops/publish-pilot-reports.mjs --version "$VERSION" || fail "report publish failed"

# --- Step 10: Version tag ---
log "Step 10/10 — Tag deployment ${VERSION}"
echo "$VERSION" > "${ROOT}/.deploy-version"
echo "$VERSION" > "${REPORT_DIR}/pilot-active-version.txt"
if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
  git tag -f "$VERSION" 2>/dev/null || log "WARN git tag skipped"
fi

log "=== PILOT DEPLOYMENT COMPLETE: ${VERSION} ==="
log "Reports: ${REPORT_DIR}/PILOT_RC3_DEPLOYMENT_REPORT.md"
log "Rollback: bash scripts/ops/deploy-production.sh pilot <previous-version> OR restore from ${LATEST_BACKUP}"
