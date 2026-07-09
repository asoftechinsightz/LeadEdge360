#!/usr/bin/env bash
# Post-deploy smoke tests — health, readiness, metrics, optional auth.
set -euo pipefail

BASE="${1:-http://127.0.0.1:3000/api}"
BASE="${BASE%/api}"
BASE="${BASE}/api"

echo "Post-deploy smoke: $BASE"

curl -fsS "$BASE/health/live" | grep -q '"ok":true'
echo "  OK health/live"

curl -fsS "$BASE/health/ready" | grep -q '"mongo":"connected"'
echo "  OK health/ready"

curl -fsS "$BASE/" | grep -q '"ok":true'
echo "  OK api root"

if [ -n "${CERT_ADMIN_EMAIL:-}" ] && [ -n "${CERT_ADMIN_PASSWORD:-}" ]; then
  TOKEN=$(curl -fsS -X POST "$BASE/auth/login-password" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$CERT_ADMIN_EMAIL\",\"password\":\"$CERT_ADMIN_PASSWORD\"}" \
    | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.parse(d).accessToken||'')}catch{}})")
  if [ -n "$TOKEN" ]; then
    curl -fsS -H "Authorization: Bearer $TOKEN" "$BASE/leads?limit=1" >/dev/null
    echo "  OK authenticated leads"
  else
    echo "  WARN login failed — check CERT_ADMIN_* env"
  fi
fi

echo "PASS post-deploy smoke"
