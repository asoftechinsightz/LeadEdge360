#!/usr/bin/env bash
# Week 2 — n8n env vars + hourly cron for social autopilot
# Usage: bash scripts/vps-setup-week2-social-autopilot.sh

set -euo pipefail
cd "$(dirname "$0")/.."
APP_DIR="$(pwd)"
ENV_FILE="$APP_DIR/.env"
LOG_FILE="/var/log/leadedge-cron.log"

echo ""
echo "[week2-social-autopilot] $APP_DIR"
echo ""

# ── 1. Ensure n8n is up ──
if docker compose ps n8n 2>/dev/null | grep -q "Up"; then
  echo "✓ n8n container running"
else
  echo "Starting n8n..."
  docker compose up -d n8n
  sleep 5
fi

# ── 2. Env vars ──
touch "$ENV_FILE"

gen_secret() {
  openssl rand -hex 24 2>/dev/null || head -c 24 /dev/urandom | xxd -p
}

set_env() {
  local key="$1"
  local val="$2"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    echo "  $key already set"
  else
    echo "${key}=${val}" >> "$ENV_FILE"
    echo "  added $key"
  fi
}

set_env "N8N_ENABLED" "true"

if ! grep -q '^N8N_WEBHOOK_URL=' "$ENV_FILE" 2>/dev/null; then
  set_env "N8N_WEBHOOK_URL" "http://n8n:5678/webhook/marketing-social-publish"
fi

if ! grep -q '^N8N_WEBHOOK_SECRET=' "$ENV_FILE" 2>/dev/null; then
  set_env "N8N_WEBHOOK_SECRET" "$(gen_secret)"
fi

if ! grep -q '^AGENT_CRON_SECRET=' "$ENV_FILE" 2>/dev/null; then
  set_env "AGENT_CRON_SECRET" "$(gen_secret)"
fi

CRON_SECRET=$(grep '^AGENT_CRON_SECRET=' "$ENV_FILE" | cut -d= -f2-)

# ── 3. Rebuild app ──
echo ""
echo "Rebuilding app container..."
docker compose up -d app
echo "  waiting 15s..."
sleep 15

# ── 4. Install crontab entry ──
CRON_LINE="0 * * * * curl -s -X POST http://127.0.0.1:3000/api/agents/scheduled/run -H \"Authorization: Bearer ${CRON_SECRET}\" -H \"Content-Type: application/json\" >> ${LOG_FILE} 2>&1"

if crontab -l 2>/dev/null | grep -q 'api/agents/scheduled/run'; then
  echo "✓ Cron entry already exists"
else
  (crontab -l 2>/dev/null || true; echo "$CRON_LINE") | crontab -
  echo "✓ Cron entry installed (hourly)"
fi

touch "$LOG_FILE" 2>/dev/null || true

# ── 5. Smoke test ──
echo ""
echo "Cron smoke test..."
HTTP=$(curl -s -o /tmp/week2-cron-test.json -w '%{http_code}' \
  -X POST http://127.0.0.1:3000/api/agents/scheduled/run \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  -H "Content-Type: application/json") || HTTP="000"

if [ "$HTTP" = "200" ]; then
  echo "✓ Scheduled run OK (HTTP 200)"
  jq '{mode, orgCount}' /tmp/week2-cron-test.json 2>/dev/null || cat /tmp/week2-cron-test.json
else
  echo "⚠ Scheduled run returned HTTP $HTTP — check app logs"
fi

echo ""
echo "[week2-social-autopilot] DONE"
echo ""
echo "Manual steps still required:"
echo "  1. Import n8n/workflows/marketing-social-publish.json in n8n UI"
echo "  2. Connect LinkedIn OAuth2 credential"
echo "  3. Activate workflow"
echo "  4. Test: /marketing-engine → Publish Due Posts"
echo ""
echo "Full guide: docs/marketing/WEEK2_VPS_RUNBOOK.md"
echo ""
echo "Hot leads queue (if npm run sales:queue-hot-leads missing — deploy bundle first):"
echo "  node scripts/vps-queue-hot-leads-standalone.mjs --dry-run"
echo "  node scripts/vps-queue-hot-leads-standalone.mjs"
echo ""
