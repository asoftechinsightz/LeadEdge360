#!/usr/bin/env bash
# Sprint 0 staging deploy — run ON the VPS at /opt/asoftech
# Usage:
#   curl -fsSL ... | bash
#   or: bash scripts/vps-sprint0-staging-deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/asoftech}"
STAGING_PORT="${STAGING_PORT:-3007}"
RETEST_API_BASE="http://127.0.0.1:${STAGING_PORT}/api"
DEV_PID_FILE="/tmp/asoftech-staging-${STAGING_PORT}.pid"
DEV_LOG="/tmp/asoftech-staging-${STAGING_PORT}.log"

cd "$APP_DIR"

echo "==> Sprint 0 staging deploy @ $(date -Iseconds)"
echo "    APP_DIR=$APP_DIR  PORT=$STAGING_PORT"

if [[ -d .git ]]; then
  echo "==> git pull"
  git pull --ff-only origin main || git pull --ff-only || true
fi

echo "==> npm install"
npm install

echo "==> mongo"
docker compose up -d mongo
sleep 3

api_up() {
  curl -fsS "http://127.0.0.1:${STAGING_PORT}/api/" >/dev/null 2>&1
}

if ! api_up; then
  echo "==> Starting dev server on port ${STAGING_PORT} (background)"
  nohup npm run dev -- --hostname 0.0.0.0 --port "${STAGING_PORT}" >"$DEV_LOG" 2>&1 &
  echo $! >"$DEV_PID_FILE"
  echo "    PID=$(cat "$DEV_PID_FILE")  log=$DEV_LOG"
  for i in $(seq 1 45); do
    if api_up; then
      echo "==> Dev server ready"
      break
    fi
    sleep 2
    [[ $i -eq 45 ]] && { echo "FAIL: dev server did not start — check $DEV_LOG"; exit 1; }
  done
else
  echo "==> Dev server already running on ${STAGING_PORT}"
fi

export RETEST_API_BASE
echo "==> deploy:s0h (build + UAT)"
npm run deploy:s0h

echo ""
echo "========================================================================"
echo "  Sprint 0 staging deploy finished"
echo "  UI:    http://$(hostname -I | awk '{print $1}'):${STAGING_PORT}"
echo "  API:   ${RETEST_API_BASE}"
echo "  Login: admin@asoftechinsightz.com / ChangeMe@2025"
echo "========================================================================"
echo ""
echo "Manual UI checks:"
echo "  - Open a lead -> no 'Lead not found'"
echo "  - Settings -> Branding -> save company name"
echo "  - Proposal -> Download PDF -> tenant name on document"
echo ""
echo "Stop background dev server:"
echo "  kill \$(cat $DEV_PID_FILE)"
