#!/usr/bin/env bash
# Scheduled MongoDB backup with tiered retention (daily/weekly/monthly).
# Usage: bash scripts/ops/backup-schedule.sh [daily|weekly|monthly|all]
# Cron example: 0 2 * * * /opt/asoftech/scripts/ops/backup-schedule.sh daily
set -euo pipefail

TIER="${1:-daily}"
BACKUP_ROOT="${BACKUP_ROOT:-/opt/asoftech/backups}"
DAILY_DIR="${BACKUP_ROOT}/daily"
WEEKLY_DIR="${BACKUP_ROOT}/weekly"
MONTHLY_DIR="${BACKUP_ROOT}/monthly"
UPLOADS_DIR="${BACKUP_ROOT}/uploads"
CONFIG_DIR="${BACKUP_ROOT}/config"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$DAILY_DIR" "$WEEKLY_DIR" "$MONTHLY_DIR" "$UPLOADS_DIR" "$CONFIG_DIR"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

# Prefer tiered backup root on VPS; fall back to repo backups/ when /opt path absent.
if [ ! -d "${BACKUP_ROOT:-/opt/asoftech/backups}" ]; then
  mkdir -p "${BACKUP_ROOT:-/opt/asoftech/backups}"
fi
if [ ! -w "${BACKUP_ROOT:-/opt/asoftech/backups}" ] && [ -d "${ROOT}/backups" ]; then
  BACKUP_ROOT="${ROOT}/backups"
  export BACKUP_ROOT
  DAILY_DIR="${BACKUP_ROOT}/daily"
  WEEKLY_DIR="${BACKUP_ROOT}/weekly"
  MONTHLY_DIR="${BACKUP_ROOT}/monthly"
  UPLOADS_DIR="${BACKUP_ROOT}/uploads"
  CONFIG_DIR="${BACKUP_ROOT}/config"
  mkdir -p "$DAILY_DIR" "$WEEKLY_DIR" "$MONTHLY_DIR" "$UPLOADS_DIR" "$CONFIG_DIR"
fi

run_mongo_backup() {
  local dest="$1"
  export BACKUP_DIR="$dest"
  export RETENTION_DAYS=7
  bash scripts/mongo-backup.sh
  echo "$TIMESTAMP" > "${dest}/.last-success"
}

echo "[backup] tier=$TIER timestamp=$TIMESTAMP"

case "$TIER" in
  daily|all)
    run_mongo_backup "$DAILY_DIR"
    find "$DAILY_DIR" -name '*.archive.gz' -mtime +7 -delete
    ;;
esac

case "$TIER" in
  weekly|all)
    if [ "$(date +%u)" = "7" ] || [ "$TIER" = "all" ]; then
      run_mongo_backup "$WEEKLY_DIR"
      find "$WEEKLY_DIR" -name '*.archive.gz' -mtime +28 -delete
    fi
    ;;
esac

case "$TIER" in
  monthly|all)
    if [ "$(date +%d)" = "01" ] || [ "$TIER" = "all" ]; then
      run_mongo_backup "$MONTHLY_DIR"
      find "$MONTHLY_DIR" -name '*.archive.gz' -mtime +365 -delete
    fi
    ;;
esac

if [ -d public/uploads ]; then
  tar -czf "${UPLOADS_DIR}/uploads_${TIMESTAMP}.tar.gz" public/uploads/
  find "$UPLOADS_DIR" -name 'uploads_*.tar.gz' -mtime +7 -delete
  echo "  uploads archived"
fi

if [ -f .env ]; then
  cp .env "${CONFIG_DIR}/env_${TIMESTAMP}.redacted"
  sed -i 's/=.*/=REDACTED/g' "${CONFIG_DIR}/env_${TIMESTAMP}.redacted" 2>/dev/null || \
    sed 's/=.*/=REDACTED/g' .env > "${CONFIG_DIR}/env_${TIMESTAMP}.redacted"
fi

if [ -f docker-compose.yml ]; then
  cp docker-compose.yml "${CONFIG_DIR}/compose_${TIMESTAMP}.yml"
fi

export LAST_BACKUP_TIMESTAMP="$(date +%s)000"
echo "[backup] complete — set LAST_BACKUP_TIMESTAMP=$LAST_BACKUP_TIMESTAMP in .env for metrics"
