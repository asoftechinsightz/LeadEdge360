#!/usr/bin/env bash
# Final runtime certification — run ON the VPS from the project root or scripts/
# Usage:
#   bash scripts/vps-runtime-certification.sh
#   # or from scripts/:
#   bash vps-runtime-certification.sh
#
# Env overrides:
#   APP_DIR=/opt/asoftech-insightz
#   APP_PORT=3000          # production docker (default if :3000 responds)
#   STAGING_PORT=3007      # staging dev server fallback
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(dirname "$SCRIPT_DIR")}"
STAGING_PORT="${STAGING_PORT:-3007}"
APP_PORT="${APP_PORT:-3000}"
DEV_PID_FILE="/tmp/asoftech-staging-${STAGING_PORT}.pid"
DEV_LOG="/tmp/asoftech-staging-${STAGING_PORT}.log"

cd "$APP_DIR"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  LeadEdge360 — VPS Runtime Certification             ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "APP_DIR=$APP_DIR"
echo "Started: $(date -Iseconds)"
echo ""

api_up() {
  curl -fsS "http://127.0.0.1:${1}/api/health/live" >/dev/null 2>&1
}

# Prefer production Docker app on :3000; fall back to staging dev on :3007
ACTIVE_PORT=""
if api_up "$APP_PORT"; then
  ACTIVE_PORT="$APP_PORT"
  echo "==> Using production API on port ${APP_PORT}"
elif api_up "$STAGING_PORT"; then
  ACTIVE_PORT="$STAGING_PORT"
  echo "==> Using staging API on port ${STAGING_PORT}"
fi

RETEST_API_BASE="http://127.0.0.1:${ACTIVE_PORT:-$STAGING_PORT}/api"

echo "==> Phase 1: Certification tooling preflight"
if [[ -f scripts/vps-preflight-certification.sh ]]; then
  bash scripts/vps-preflight-certification.sh || exit 1
else
  echo "    WARN: vps-preflight-certification.sh missing — sync latest scripts from dev machine"
  if [[ ! -f lib/mongo-connect.js ]]; then
    echo "FAIL: lib/mongo-connect.js missing. Run scripts/vps-sync-certification.ps1 from dev machine."
    exit 1
  fi
fi

echo "==> Phase 1: Docker services"
if [[ -f docker-compose.yml ]]; then
  docker compose up -d mongo n8n
  if docker compose config --services 2>/dev/null | grep -qx app; then
    docker compose up -d app 2>/dev/null || true
  fi
  sleep 4
else
  echo "    WARN: docker-compose.yml not found — assuming containers already running"
  docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' || true
fi

# Host-side npm scripts: resolve Mongo host automatically (mongo in Docker, 127.0.0.1 on host)
echo "==> Phase 1: Mongo connection (auto-detect execution mode)"
eval "$(node scripts/mongo-connect-env.mjs --shell)"
echo "    DB_NAME=${DB_NAME}  mode=${MONGO_EXECUTION_MODE:-?}  host=${MONGO_EXPECTED_HOST:-?}"

echo "==> Phase 1: Database check"
npm run db:check

echo "==> Phase 1: Indexes"
npm run db:indexes || {
  echo "    WARN: db:indexes reported conflicts — continuing if indexes already exist"
}

if [[ -z "${CERT_ADMIN_PASSWORD:-}" && -z "${RETEST_PASSWORD:-}" ]]; then
  echo ""
  echo "    NOTE: Production Docker requires real admin credentials."
  echo "          export CERT_ADMIN_EMAIL=admin@asoftechinsightz.com"
  echo "          export CERT_ADMIN_PASSWORD='<your-production-password>'"
  echo ""
fi

if [[ -z "$ACTIVE_PORT" ]]; then
  echo "==> No API on ${APP_PORT} or ${STAGING_PORT} — starting dev server on ${STAGING_PORT}"
  nohup npm run dev -- --hostname 0.0.0.0 --port "${STAGING_PORT}" >"$DEV_LOG" 2>&1 &
  echo $! >"$DEV_PID_FILE"
  ACTIVE_PORT="$STAGING_PORT"
  RETEST_API_BASE="http://127.0.0.1:${STAGING_PORT}/api"
  for i in $(seq 1 60); do
    if api_up "$STAGING_PORT"; then
      echo "==> API ready on ${STAGING_PORT}"
      break
    fi
    sleep 2
    [[ $i -eq 60 ]] && { echo "FAIL: API did not start — see $DEV_LOG"; exit 1; }
  done
else
  echo "==> API already running on port ${ACTIVE_PORT}"
fi

echo "==> Phase 1: Health (${RETEST_API_BASE})"
curl -fsS "${RETEST_API_BASE}/health/live" | head -c 200; echo ""
curl -fsS "${RETEST_API_BASE}/health/ready" | head -c 200; echo ""

export RETEST_API_BASE
export SKIP_BUILD=1

echo ""
echo "==> Phase 2–3: Full runtime certification"
node scripts/runtime-vps-certification.mjs
EXIT=$?

echo ""
echo "========================================================================"
echo "  Certification finished — exit code $EXIT"
echo "  API:    ${RETEST_API_BASE}"
echo "  Report: docs/platform/RUNTIME_CERTIFICATION_REPORT.md"
echo "  JSON:   docs/platform/runtime-certification-last-run.json"
echo "========================================================================"

exit $EXIT
