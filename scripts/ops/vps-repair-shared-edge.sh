#!/usr/bin/env bash
# Repair shared edge nginx when Observability360 or Asoftech routes break.
# Run on VPS: sudo bash scripts/ops/vps-repair-shared-edge.sh
set -euo pipefail

OBS_CONF=/opt/observability360/infra/nginx/observability360.conf
CERT_DIR=/opt/observability360/infra/nginx/certs
REPO_CONF=/opt/asoftech-insightz/infra/nginx/observability360-shared-edge.conf
BACKUP="${OBS_CONF}.bak.$(date +%Y%m%d%H%M%S)"

echo "==> Backup ${OBS_CONF}"
cp -a "${OBS_CONF}" "${BACKUP}"

echo "==> Ensure certs"
cp -L /etc/letsencrypt/live/app.asoftechinsightz.com/fullchain.pem "${CERT_DIR}/asoftech-fullchain.pem"
cp -L /etc/letsencrypt/live/app.asoftechinsightz.com/privkey.pem "${CERT_DIR}/asoftech-privkey.pem"
cp -L /etc/letsencrypt/live/observability360.asoftechinsightz.com/fullchain.pem "${CERT_DIR}/fullchain.pem"
cp -L /etc/letsencrypt/live/observability360.asoftechinsightz.com/privkey.pem "${CERT_DIR}/privkey.pem"

echo "==> Install merged nginx config"
if [[ -f "${REPO_CONF}" ]]; then
  cp "${REPO_CONF}" "${OBS_CONF}"
else
  echo "WARN: ${REPO_CONF} missing — copy infra/nginx/observability360-shared-edge.conf to VPS first"
  exit 1
fi

echo "==> Connect asoftech-app to observability network"
NET=$(docker inspect observability360-nginx-1 --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{"\n"}}{{end}}' | head -1)
docker network connect "${NET}" asoftech-app 2>/dev/null || true

echo "==> Upstream health from nginx container"
docker exec observability360-nginx-1 wget -qO- --timeout=5 http://web:3000/ >/dev/null && echo "  OK  obs360 web" || echo "  FAIL obs360 web"
docker exec observability360-nginx-1 wget -qO- --timeout=5 http://api-gateway:4000/health >/dev/null 2>&1 && echo "  OK  obs360 api" || echo "  WARN obs360 api (check /health path)"
docker exec observability360-nginx-1 wget -qO- --timeout=5 http://asoftech-app:3000/api/health/live && echo "  OK  asoftech-app"

echo "==> Reload nginx"
docker exec observability360-nginx-1 nginx -t
docker exec observability360-nginx-1 nginx -s reload

echo "==> Smoke tests"
curl -sS -o /dev/null -w "observability360 → %{http_code}\n" https://observability360.asoftechinsightz.com || true
curl -sS -o /dev/null -w "asoftechinsightz  → %{http_code}\n" https://asoftechinsightz.com || true
curl -sS -o /dev/null -w "app suite        → %{http_code}\n" https://app.asoftechinsightz.com/api/health/live || true
echo "Backup: ${BACKUP}"
