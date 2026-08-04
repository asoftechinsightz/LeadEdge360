#!/usr/bin/env bash
# Production stack validation — run on VPS after deploy or reboot.
set -euo pipefail

FAIL=0
pass() { echo "PASS: $*"; }
fail() { echo "FAIL: $*"; FAIL=1; }

echo "=== LeadEdge360 production validation ==="

# Containers running
for c in asoftech-app asoftech-mongo asoftech-n8n asoftech-edge-nginx; do
  if docker ps --format '{{.Names}}' | grep -qx "$c"; then
    pass "container $c running"
  else
    fail "container $c not running"
  fi
done

# App health env + bind
HOSTNAME=$(docker exec asoftech-app printenv HOSTNAME 2>/dev/null || true)
if [ "$HOSTNAME" = "0.0.0.0" ]; then
  pass "HOSTNAME=0.0.0.0"
else
  fail "HOSTNAME=$HOSTNAME (expected 0.0.0.0)"
fi

if docker exec asoftech-app netstat -tln 2>/dev/null | grep -q '0.0.0.0:3000'; then
  pass "app listens on 0.0.0.0:3000"
else
  fail "app not listening on 0.0.0.0:3000"
fi

# Runtime assets (no hotfix)
for path in /app/config/aeo/business-profile-fields.json /app/public /app/.next/static /app/server.js; do
  if docker exec asoftech-app test -e "$path" 2>/dev/null; then
    pass "runtime asset $path"
  else
    fail "missing runtime asset $path"
  fi
done

# Docker DNS from edge nginx
EDGE_APP=$(docker exec asoftech-edge-nginx wget -qO- http://app:3000/api 2>/dev/null || true)
if echo "$EDGE_APP" | grep -q '"ok":true'; then
  pass "edge nginx -> app:3000/api"
else
  fail "edge nginx -> app:3000/api ($EDGE_APP)"
fi

EDGE_N8N_CODE=$(docker exec asoftech-edge-nginx wget -qS -O /dev/null http://n8n:5678/ 2>&1 | head -1 || true)
if echo "$EDGE_N8N_CODE" | grep -qE '200|401|302'; then
  pass "edge nginx -> n8n:5678 reachable"
else
  fail "edge nginx -> n8n:5678 ($EDGE_N8N_CODE)"
fi

# Loopback inside app
APP_LOCAL=$(docker exec asoftech-app node -e "require('http').get('http://127.0.0.1:3000/api',r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>process.stdout.write(d))}).on('error',e=>{console.error(e);process.exit(1)})" 2>/dev/null || true)
if echo "$APP_LOCAL" | grep -q '"ok":true'; then
  pass "app loopback /api"
else
  fail "app loopback /api"
fi

# Network membership (no manual connect required)
if docker inspect asoftech-app -f '{{json .NetworkSettings.Networks}}' | grep -q asoftech_edge; then
  pass "asoftech-app on asoftech_edge"
else
  fail "asoftech-app not on asoftech_edge"
fi

if docker inspect asoftech-n8n -f '{{json .NetworkSettings.Networks}}' | grep -q asoftech_edge; then
  pass "asoftech-n8n on asoftech_edge"
else
  fail "asoftech-n8n not on asoftech_edge"
fi

echo "=== done ==="
exit $FAIL
