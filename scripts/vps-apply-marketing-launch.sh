#!/usr/bin/env bash
# Apply marketing launch kit on VPS (after tar xzf marketing-launch-bundle.tar.gz)
# Usage: bash scripts/vps-apply-marketing-launch.sh

set -euo pipefail
cd "$(dirname "$0")/.."
APP_DIR="$(pwd)"

echo ""
echo "[vps-apply-marketing-launch] $APP_DIR"
echo ""

if ! grep -q '"marketing-engine:indexes"' package.json; then
  echo "ERROR: package.json missing marketing-engine scripts. Run tar xzf first."
  exit 1
fi

if ! test -f scripts/marketing-engine-seed-asoftech.mjs; then
  echo "ERROR: scripts/marketing-engine-seed-asoftech.mjs not found. Run tar xzf first."
  exit 1
fi

echo "Step 1/5 — Mongo indexes"
npm run marketing-engine:indexes

echo ""
echo "Step 2/5 — Seed config, LinkedIn posts, nurture emails"
npm run marketing-engine:seed-asoftech

echo ""
echo "Step 3/5 — GROWTH_AUDIT_ORG_ID in .env"
if ! grep -q '^GROWTH_AUDIT_ORG_ID=' .env 2>/dev/null; then
  echo 'GROWTH_AUDIT_ORG_ID=asoftechinsightz' >> .env
  echo "  added GROWTH_AUDIT_ORG_ID=asoftechinsightz"
else
  echo "  already set"
fi

echo ""
echo "Step 4/5 — Docker rebuild (includes /marketing-engine routes)"
docker compose build app --no-cache
docker compose up -d app
echo "  waiting 20s for app..."
sleep 20

echo ""
echo "Step 5/5 — Marketing engine retest"
export CERT_ADMIN_EMAIL="${CERT_ADMIN_EMAIL:-admin@asoftechinsightz.com}"
export CERT_ADMIN_PASSWORD="${CERT_ADMIN_PASSWORD:-Asoftech@2026}"
export RETEST_API_BASE="${RETEST_API_BASE:-http://127.0.0.1:3000/api}"
npm run marketing-engine:retest

echo ""
echo "Step 6/6 — Diagnose org + data"
npm run marketing-engine:diagnose

echo ""
echo "[vps-apply-marketing-launch] DONE"
echo "  → /marketing-engine  (content calendar)"
echo "  → /campaigns         (3 nurture drafts)"
echo "  → /growth-audit      (test lead → CRM)"
echo "  → docs/marketing/MARKETING_ENGINE_VALIDATION_AND_QUEUE.md"
echo "  → docs/marketing/WEEK2_VPS_RUNBOOK.md"
echo "  → docs/sales/REAL_ESTATE_HOT_LEAD_PLAYBOOK.md"
echo "  → docs/platform/META_GEO_LEADS_SETUP.md"
echo ""
echo "If daily pipeline still times out with LLM enabled, patch nginx (do NOT copy full docs/nginx.conf if n8n is separate):"
echo "  sudo cp /etc/nginx/sites-available/asoftech.bak.\\$(date +%F-%H%M) /etc/nginx/sites-available/asoftech  # if needed"
echo "  # Or: sudo cp docs/nginx.conf /etc/nginx/sites-available/asoftech  (main site only, no flows block)"
echo "  sudo nginx -t && sudo systemctl reload nginx"
echo ""
