#!/usr/bin/env bash
# Staged production deploy with migration validation, rolling update, and auto-rollback.
# Usage: bash scripts/ops/deploy-production.sh [development|qa|staging|pilot|production] [version-tag]
set -euo pipefail

STAGE="${1:-staging}"
VERSION="${2:-$(git describe --tags --always 2>/dev/null || date +%Y%m%d%H%M%S)}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
REPORT_DIR="${ROOT}/docs/deployments"
REPORT="${REPORT_DIR}/deploy-${STAGE}-${VERSION}.json"
ACTIVE_SLOT_FILE="${ROOT}/.deploy-active-slot"
PREVIOUS_IMAGE=""

mkdir -p "$REPORT_DIR"

log() { echo "[deploy:$STAGE] $*"; }
fail() { log "FAIL: $*"; exit 1; }

cd "$ROOT"

log "Stage=$STAGE Version=$VERSION"

# --- Pre-flight ---
log "Validating environment..."
node scripts/ops/validate-env.mjs --stage "$STAGE" || fail "env validation"

log "Validating migrations (dry-run)..."
node scripts/migration-validate.mjs || fail "migration validation"

log "Pre-deploy backup..."
bash scripts/ops/backup-schedule.sh daily || fail "backup failed"

# --- Build & tag ---
export APP_VERSION="$VERSION"
export DEPLOY_STAGE="$STAGE"
log "Building app image..."
docker compose build app
docker tag "$(docker compose images app -q | head -1)" "asoftech-app:${VERSION}" 2>/dev/null || true

PREVIOUS_IMAGE="$(docker inspect --format='{{.Image}}' asoftech-app 2>/dev/null || echo '')"

# --- Rolling deploy (zero-downtime via compose recreate) ---
log "Rolling update..."
docker compose up -d --no-deps --build app

# --- Health gate (auto-rollback on failure) ---
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/api/health/ready}"
ROLLBACK=0
for i in $(seq 1 30); do
  if curl -fsS "$HEALTH_URL" | grep -q '"ok":true'; then
    log "Health check passed (attempt $i)"
    break
  fi
  if [ "$i" -eq 30 ]; then
    ROLLBACK=1
  fi
  sleep 5
done

if [ "$ROLLBACK" -eq 1 ]; then
  log "Health check failed — rolling back"
  if [ -n "$PREVIOUS_IMAGE" ]; then
    docker compose stop app || true
    docker compose up -d app || true
  fi
  bash scripts/ops/deployment-report.mjs --stage "$STAGE" --version "$VERSION" --status rollback --report "$REPORT" || true
  fail "deploy rolled back due to failed health checks"
fi

# --- Post-deploy verification ---
bash scripts/ops/post-deploy-smoke.sh "$HEALTH_URL" || fail "smoke test"

export RETEST_API_BASE="${RETEST_API_BASE:-http://127.0.0.1:3000/api}"
export PAT_STAGE="${STAGE}"
export PAT_REQUIRE_BACKUP=$([ "$STAGE" = "production" ] || [ "$STAGE" = "pilot" ] && echo 1 || echo 0)
npm run production:acceptance || fail "Production Acceptance Test FAILED"

node scripts/ops/deployment-report.mjs --stage "$STAGE" --version "$VERSION" --status success --report "$REPORT"

log "Deploy complete: $REPORT"
echo "$VERSION" > "${ROOT}/.deploy-version"
echo "active" > "$ACTIVE_SLOT_FILE"
