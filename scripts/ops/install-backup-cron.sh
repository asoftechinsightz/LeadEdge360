#!/usr/bin/env bash
# Install daily/weekly/monthly backup cron on VPS.
# Retention: daily 7d, weekly 4w, monthly 12m (see backup-schedule.sh)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CRON_FILE="/etc/cron.d/asoftech-backup"
LOG_DIR="/var/log/asoftech"
mkdir -p "$LOG_DIR"

CRON_CONTENT="# Asoftech MongoDB + uploads backup — RC3 pilot
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# Daily at 02:00 IST (20:30 UTC previous day — adjust as needed)
30 20 * * * root cd ${ROOT} && bash scripts/ops/backup-schedule.sh daily >> ${LOG_DIR}/backup-daily.log 2>&1

# Weekly Sunday 03:00 IST
30 21 * * 0 root cd ${ROOT} && bash scripts/ops/backup-schedule.sh weekly >> ${LOG_DIR}/backup-weekly.log 2>&1

# Monthly 1st 04:00 IST
30 22 1 * * root cd ${ROOT} && bash scripts/ops/backup-schedule.sh monthly >> ${LOG_DIR}/backup-monthly.log 2>&1
"

if [ "$(id -u)" -ne 0 ]; then
  echo "WARN: run as root to install ${CRON_FILE}"
  echo "$CRON_CONTENT"
  exit 0
fi

echo "$CRON_CONTENT" > "$CRON_FILE"
chmod 644 "$CRON_FILE"
echo "Installed ${CRON_FILE}"
echo "Retention: daily 7d | weekly 4w | monthly 12m"
crontab -l 2>/dev/null | grep -q asoftech-backup || true

node -e "
const fs=require('fs');
const p='${ROOT}/docs/deployments/pilot-backup-cron.json';
fs.writeFileSync(p, JSON.stringify({
  generatedAt: new Date().toISOString(),
  cronFile: '${CRON_FILE}',
  retention: { daily: '7 days', weekly: '4 weeks', monthly: '12 months' },
  status: 'installed'
}, null, 2));
console.log('Wrote', p);
"
