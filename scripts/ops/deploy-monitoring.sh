#!/usr/bin/env bash
# Deploy Prometheus + Grafana + exporters (optional observability stack).
# Usage: bash scripts/ops/deploy-monitoring.sh
# Requires: docker compose, main app stack (docker-compose.yml) already running.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

pick_grafana_port() {
  local port="${GRAFANA_HOST_PORT:-3030}"
  for candidate in "$port" 3031 3032 3040; do
    if ! ss -tln 2>/dev/null | grep -q ":${candidate} " && \
       ! netstat -tln 2>/dev/null | grep -q ":${candidate} "; then
      echo "$candidate"
      return 0
    fi
    echo "[monitoring] port ${candidate} already in use" >&2
  done
  echo "[monitoring] ERROR: no free Grafana host port (tried ${port}, 3031, 3032, 3040)" >&2
  exit 1
}

GRAFANA_HOST_PORT="$(pick_grafana_port)"
export GRAFANA_HOST_PORT
export GRAFANA_URL="http://127.0.0.1:${GRAFANA_HOST_PORT}/api/health"

echo "[monitoring] Grafana host port: ${GRAFANA_HOST_PORT}"
echo "[monitoring] Starting Prometheus, Grafana, node-exporter, cadvisor..."

# Remove failed Grafana container from a prior port conflict (safe if absent).
docker rm -f asoftech-grafana 2>/dev/null || true

docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d \
  prometheus grafana node-exporter cadvisor

echo "[monitoring] Waiting for health endpoints..."
sleep 12

GRAFANA_URL="$GRAFANA_URL" node scripts/ops/verify-monitoring.mjs

echo "[monitoring] Grafana UI: http://127.0.0.1:${GRAFANA_HOST_PORT} (admin / see GRAFANA_ADMIN_PASSWORD in .env)"
echo "[monitoring] Prometheus: http://127.0.0.1:9090"
echo "[monitoring] Add to .env for PAT: GRAFANA_HOST_PORT=${GRAFANA_HOST_PORT}"
echo "[monitoring] Add to .env for PAT: GRAFANA_URL=${GRAFANA_URL}"
