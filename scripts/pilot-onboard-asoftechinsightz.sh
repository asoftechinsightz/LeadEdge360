#!/usr/bin/env bash
# Provision AsoftechInsightz as first tenant + run automated validation (Phases 0–2).
#
# Run ON the VPS from project root:
#   cd /opt/asoftech-insightz
#   source .env
#   export PILOT_ADMIN_PASSWORD='your-secure-password'
#   bash scripts/pilot-onboard-asoftechinsightz.sh
#
# Options:
#   --dry-run              Preview provision only (no DB writes, skip retests)
#   --skip-provision       Run Phase 0 + 2 only (org already exists)
#   --skip-sample          Provision without --seed-sample
#   --align-existing       Migrate UUID org → asoftechinsightz before provision
#   --with-cert-runtime    Also run npm run cert:runtime (slower)
#   --app-port PORT        API port (default: 3000)
#
# Docs: docs/platform/ASOFTECHINSIGHTZ_PILOT_VALIDATION.md
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(dirname "$SCRIPT_DIR")}"
APP_PORT="${APP_PORT:-3000}"

DRY_RUN=0
SKIP_PROVISION=0
SKIP_SAMPLE=0
ALIGN_EXISTING=0
WITH_CERT_RUNTIME=0

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --skip-provision) SKIP_PROVISION=1 ;;
    --skip-sample) SKIP_SAMPLE=1 ;;
    --align-existing) ALIGN_EXISTING=1 ;;
    --with-cert-runtime) WITH_CERT_RUNTIME=1 ;;
    --app-port=*) APP_PORT="${arg#*=}" ;;
    --help|-h)
      sed -n '2,18p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Unknown option: $arg (use --help)" >&2
      exit 1
      ;;
  esac
done

cd "$APP_DIR"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

export RETEST_API_BASE="${RETEST_API_BASE:-http://127.0.0.1:${APP_PORT}/api}"

# AsoftechInsightz defaults (override via env before running)
export PILOT_ORG_NAME="${PILOT_ORG_NAME:-AsoftechInsightz Pvt Ltd}"
export PILOT_ORG_ID="${PILOT_ORG_ID:-asoftechinsightz}"
export PILOT_ADMIN_EMAIL="${PILOT_ADMIN_EMAIL:-admin@asoftechinsightz.com}"
export PILOT_ADMIN_NAME="${PILOT_ADMIN_NAME:-Platform Admin}"
export PILOT_ADMIN_PHONE="${PILOT_ADMIN_PHONE:-+917307911405}"
export PILOT_INDUSTRY="${PILOT_INDUSTRY:-it_services}"
export PILOT_GSTIN="${PILOT_GSTIN:-09AAAAA0000A1Z5}"
export PILOT_PROPOSAL_PREFIX="${PILOT_PROPOSAL_PREFIX:-ASI}"
export PILOT_INVOICE_PREFIX="${PILOT_INVOICE_PREFIX:-ASI-INV}"
export PILOT_PLACE_OF_SUPPLY="${PILOT_PLACE_OF_SUPPLY:-Uttar Pradesh}"
export PILOT_PLAN_CODE="${PILOT_PLAN_CODE:-ENTERPRISE}"

export CERT_ADMIN_EMAIL="${CERT_ADMIN_EMAIL:-$PILOT_ADMIN_EMAIL}"
export CERT_ADMIN_PASSWORD="${CERT_ADMIN_PASSWORD:-${PILOT_ADMIN_PASSWORD:-}}"

PASS=0
FAIL=0
WARN=0

log_ok() { echo "  OK   $*"; PASS=$((PASS + 1)); }
log_warn() { echo "  WARN $*"; WARN=$((WARN + 1)); }
log_fail() { echo "  FAIL $*"; FAIL=$((FAIL + 1)); }

api_health() {
  curl -fsS "${RETEST_API_BASE}/health/live" >/dev/null 2>&1
}

sync_admin_password() {
  echo ""
  echo "==> Sync admin password"
  if ADMIN_EMAIL="$PILOT_ADMIN_EMAIL" ADMIN_PASSWORD="$PILOT_ADMIN_PASSWORD" npm run db:set-password; then
    log_ok "db:set-password $PILOT_ADMIN_EMAIL"
  else
    log_fail "db:set-password $PILOT_ADMIN_EMAIL"
    return 1
  fi
}

detect_org_mismatch() {
  node --input-type=module -e "
import { MongoClient } from 'mongodb';
import { loadEnvForScripts, getMongoConnectConfig } from './lib/mongo-connect.js';
loadEnvForScripts();
const email = process.env.PILOT_ADMIN_EMAIL;
const want = process.env.PILOT_ORG_ID;
const { mongoUrl, dbName } = getMongoConnectConfig();
const client = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 10000 });
await client.connect();
const user = await client.db(dbName).collection('users').findOne({ email });
await client.close();
if (user && user.orgId !== want) {
  console.log(user.orgId);
  process.exit(2);
}
" 2>/dev/null || true
}

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  AsoftechInsightz — First-Tenant Pilot Onboard (Phases 0–2)  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "APP_DIR=$APP_DIR"
echo "API=$RETEST_API_BASE"
echo "ORG=$PILOT_ORG_ID  ADMIN=$PILOT_ADMIN_EMAIL"
echo "Started: $(date -Iseconds 2>/dev/null || date)"
echo ""

# ── Phase 0: Platform prep ───────────────────────────────────────────────────
echo "==> Phase 0: Platform prep"

if [[ -f docker-compose.yml ]]; then
  if docker compose ps --status running 2>/dev/null | grep -q '\bapp\b'; then
    log_ok "docker compose: app container running"
  else
    log_warn "docker compose: app not running — try: docker compose up -d app"
  fi
else
  log_warn "docker-compose.yml not found"
fi

if api_health; then
  log_ok "API health/live on port ${APP_PORT}"
else
  log_fail "API not reachable at ${RETEST_API_BASE}/health/live"
fi

READY_JSON="$(curl -fsS "${RETEST_API_BASE}/health/ready" 2>/dev/null || echo '{}')"
if echo "$READY_JSON" | grep -q '"mongo"[[:space:]]*:[[:space:]]*"connected"'; then
  log_ok "Mongo connected (health/ready)"
elif echo "$READY_JSON" | grep -q 'connected'; then
  log_ok "health/ready responded"
else
  log_warn "health/ready: $READY_JSON"
fi

if [[ "${DEV_AUTH_BYPASS:-}" == "false" ]]; then
  log_ok "DEV_AUTH_BYPASS=false"
else
  log_warn "DEV_AUTH_BYPASS=${DEV_AUTH_BYPASS:-unset} — set false for production pilot"
fi

if [[ "${NEXT_PUBLIC_APP_ENV:-}" == "production" ]]; then
  log_ok "NEXT_PUBLIC_APP_ENV=production"
else
  log_warn "NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV:-unset}"
fi

if [[ -z "${PILOT_ADMIN_PASSWORD:-}" ]]; then
  log_fail "PILOT_ADMIN_PASSWORD unset — export before running (or use --skip-provision if org exists)"
  echo ""
  echo "Example:"
  echo "  export PILOT_ADMIN_PASSWORD='Asoftech@2026'"
  echo "  export CERT_ADMIN_PASSWORD=\"\$PILOT_ADMIN_PASSWORD\""
  exit 1
fi

# ── Org alignment (UUID bootstrap → pilot slug) ───────────────────────────────
if [[ "$SKIP_PROVISION" -eq 0 ]]; then
  MISMATCH_ORG="$(detect_org_mismatch || true)"
  if [[ -n "$MISMATCH_ORG" ]]; then
    echo ""
    echo "==> Org mismatch detected"
    echo "    admin $PILOT_ADMIN_EMAIL belongs to: $MISMATCH_ORG"
    echo "    target PILOT_ORG_ID: $PILOT_ORG_ID"
    if [[ "$ALIGN_EXISTING" -eq 1 ]]; then
      if [[ "$DRY_RUN" -eq 1 ]]; then
        npm run pilot:align-org -- --from-email --dry-run
      else
        npm run pilot:align-org -- --from-email || exit 1
        log_ok "pilot:align-org --from-email"
      fi
    else
      log_fail "email org mismatch — re-run with --align-existing"
      echo ""
      echo "  npm run pilot:align-org -- --from-email --dry-run"
      echo "  bash scripts/pilot-onboard-asoftechinsightz.sh --align-existing"
      exit 1
    fi
  fi
fi

sync_admin_password || true

echo ""
echo "==> Phase 0: pilot:verify (pre-provision)"
if npm run pilot:verify; then
  log_ok "pilot:verify (pre)"
else
  log_fail "pilot:verify (pre)"
fi

# ── Phase 1: Provision org ───────────────────────────────────────────────────
if [[ "$SKIP_PROVISION" -eq 1 ]]; then
  echo ""
  echo "==> Phase 1: skipped (--skip-provision)"
else
  echo ""
  echo "==> Phase 1: Provision org ($PILOT_ORG_ID)"

  echo "    Dry-run..."
  if npm run pilot:provision -- --dry-run; then
    log_ok "pilot:provision --dry-run"
  else
    log_fail "pilot:provision --dry-run"
    exit 1
  fi

  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo ""
    echo "DRY-RUN complete — no database writes. Re-run without --dry-run to provision."
    exit 0
  fi

  echo "    Provisioning..."
  if npm run pilot:provision; then
    log_ok "pilot:provision"
  else
    log_fail "pilot:provision"
    exit 1
  fi

  if [[ "$SKIP_SAMPLE" -eq 0 ]]; then
    echo "    Seeding sample data..."
    if npm run pilot:provision -- --seed-sample; then
      log_ok "pilot:provision --seed-sample"
    else
      log_fail "pilot:provision --seed-sample"
      exit 1
    fi
  fi
fi

sync_admin_password || true

# ── Phase 2: Automated retests ───────────────────────────────────────────────
echo ""
echo "==> Phase 2: Automated API smoke"

run_step() {
  local label="$1"
  shift
  echo ""
  echo "    $label"
  if "$@"; then
    log_ok "$label"
    return 0
  else
    log_fail "$label"
    return 1
  fi
}

PHASE2_FAIL=0
run_step "pilot:verify (post)" npm run pilot:verify || PHASE2_FAIL=1
run_step "db:foundation-retest" npm run db:foundation-retest || PHASE2_FAIL=1
run_step "db:tenant-retest" npm run db:tenant-retest || PHASE2_FAIL=1
run_step "db:agent-runtime-retest" npm run db:agent-runtime-retest || PHASE2_FAIL=1

if [[ "$WITH_CERT_RUNTIME" -eq 1 ]]; then
  run_step "cert:runtime" npm run cert:runtime || PHASE2_FAIL=1
else
  log_warn "cert:runtime skipped (use --with-cert-runtime for full certification)"
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "========================================================================"
echo "  Phase 0–2 summary"
echo "  OK: $PASS   WARN: $WARN   FAIL: $FAIL"
echo "  Org:     $PILOT_ORG_ID"
echo "  Login:   $PILOT_ADMIN_EMAIL"
echo "  API:     $RETEST_API_BASE"
echo ""
echo "  Manual checklist: docs/platform/ASOFTECHINSIGHTZ_PILOT_VALIDATION.md"
echo "    Phase 3 — marketing, CRM, growth, AI"
echo "    Phase 4 — dogfood Lead → Invoice scenario"
echo "========================================================================"

if [[ "$FAIL" -gt 0 || "$PHASE2_FAIL" -ne 0 ]]; then
  echo "RESULT: NO-GO — fix failures above before external pilots."
  exit 1
fi

echo "RESULT: GO for manual Phases 3–4."
exit 0
