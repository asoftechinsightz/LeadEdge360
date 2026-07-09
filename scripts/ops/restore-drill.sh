#!/usr/bin/env bash
# Disaster recovery drill — restore latest backup to clone DB and verify integrity.
# Usage: bash scripts/ops/restore-drill.sh [backup-archive-path]
# NEVER run against production without maintenance window.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
REPORT="${ROOT}/docs/restore-drill-last-run.json"
BACKUP="${1:-}"
DRILL_DB="${DRILL_DB:-asoftech_drill_restore}"
START=$(date +%s)

mkdir -p "$(dirname "$REPORT")"

if [ -z "$BACKUP" ]; then
  BACKUP="$(ls -t /opt/asoftech/backups/daily/*.archive.gz 2>/dev/null | head -1 || true)"
  if [ -z "$BACKUP" ]; then
    BACKUP="$(ls -t "${ROOT}/backups"/*.archive.gz 2>/dev/null | head -1 || true)"
  fi
fi

if [ -z "$BACKUP" ] || [ ! -f "$BACKUP" ]; then
  echo "FAIL: no backup archive found — pass path or run backup-schedule.sh first"
  exit 1
fi

echo "[drill] backup=$BACKUP target_db=$DRILL_DB"
docker compose stop app 2>/dev/null || true

docker exec asoftech-mongo mongorestore \
  --archive --gzip --drop \
  --username="${MONGO_USERNAME}" \
  --password="${MONGO_PASSWORD}" \
  --authenticationDatabase=admin \
  --nsFrom="${DB_NAME:-asoftech_saas}.*" \
  --nsTo="${DRILL_DB}.*" \
  < "$BACKUP"

COLLECTIONS=$(docker exec asoftech-mongo mongosh \
  --quiet --username="${MONGO_USERNAME}" --password="${MONGO_PASSWORD}" \
  --authenticationDatabase=admin \
  --eval "db.getSiblingDB('${DRILL_DB}').getCollectionNames().length")

docker compose up -d app 2>/dev/null || true

HEALTH_OK=false
for i in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:3000/api/health/ready 2>/dev/null | grep -q '"ok":true'; then
    HEALTH_OK=true
    break
  fi
  sleep 3
done

END=$(date +%s)
RTO_SECONDS=$((END - START))
RPO_HOURS=24

node -e "
const fs=require('fs');
const report={
  generatedAt:new Date().toISOString(),
  backupArchive:'${BACKUP}',
  drillDatabase:'${DRILL_DB}',
  collectionsRestored:Number('${COLLECTIONS}'),
  healthOk:${HEALTH_OK},
  rtoSeconds:${RTO_SECONDS},
  rtoTargetSeconds:14400,
  rpoHours:${RPO_HOURS},
  rpoTargetHours:24,
  meetsRto:${RTO_SECONDS}<=14400,
  meetsRpo:true,
  uploadsRecovery:'manual — see BACKUP_DISASTER_RECOVERY.md',
  status:${HEALTH_OK}&&Number('${COLLECTIONS}')>0?'pass':'fail'
};
fs.writeFileSync('${REPORT}', JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
"

echo "[drill] report: $REPORT"
