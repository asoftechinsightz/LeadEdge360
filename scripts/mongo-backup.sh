#!/usr/bin/env bash
# MongoDB backup script for production VPS (docker-compose mongo service).
# Writes archive to the HOST filesystem via mongodump stdout (container has no backup mount).
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/asoftech/backups/mongo}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
ARCHIVE="${BACKUP_DIR}/asoftech_${TIMESTAMP}.archive.gz"
DB_NAME="${DB_NAME:-asoftech_saas}"

mkdir -p "$BACKUP_DIR"

if [ -z "${MONGO_USERNAME:-}" ] || [ -z "${MONGO_PASSWORD:-}" ]; then
  echo "[mongo-backup] ERROR: MONGO_USERNAME and MONGO_PASSWORD must be set (source .env first)" >&2
  exit 1
fi

echo "[mongo-backup] dumping ${DB_NAME} → ${ARCHIVE}"

docker exec asoftech-mongo mongodump \
  --archive=- \
  --gzip \
  --username="${MONGO_USERNAME}" \
  --password="${MONGO_PASSWORD}" \
  --authenticationDatabase=admin \
  --db="${DB_NAME}" \
  > "$ARCHIVE"

if [ ! -s "$ARCHIVE" ]; then
  echo "[mongo-backup] ERROR: backup file missing or empty: ${ARCHIVE}" >&2
  rm -f "$ARCHIVE"
  exit 1
fi

find "$BACKUP_DIR" -name '*.archive.gz' -mtime +"$RETENTION_DAYS" -delete
echo "[mongo-backup] OK — $(stat -c%s "$ARCHIVE" 2>/dev/null || stat -f%z "$ARCHIVE") bytes → ${ARCHIVE}"
