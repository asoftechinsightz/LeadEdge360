#!/usr/bin/env bash
# Restore MongoDB from mongodump archive (use with caution).
set -euo pipefail

ARCHIVE="${1:?Usage: mongo-restore.sh /path/to/backup.archive.gz}"

docker exec -i asoftech-mongo mongorestore \
  --archive \
  --gzip \
  --drop \
  --username="${MONGO_USERNAME}" \
  --password="${MONGO_PASSWORD}" \
  --authenticationDatabase=admin \
  < "$ARCHIVE"

echo "Restore completed from $ARCHIVE"
