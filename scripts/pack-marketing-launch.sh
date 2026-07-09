#!/usr/bin/env bash
# Pack marketing launch kit for VPS upload.
# Run on dev machine from repo root:
#   bash scripts/pack-marketing-launch.sh
# Then on VPS:
#   scp marketing-launch-bundle.tar.gz root@leadedge360:/opt/asoftech-insightz/
#   cd /opt/asoftech-insightz && tar xzf marketing-launch-bundle.tar.gz && bash scripts/vps-apply-marketing-launch.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/marketing-launch-bundle.tar.gz"

cd "$ROOT"

tar czf "$OUT" \
  package.json \
  lib/mongo-connect.js \
  lib/events/types.js \
  lib/agents/scheduled-jobs.js \
  lib/integrations/n8n.js \
  lib/marketing-engine \
  app/api/marketing-engine \
  app/marketing-engine \
  scripts/marketing-engine-indexes.mjs \
  scripts/marketing-engine-seed-asoftech.mjs \
  scripts/marketing-engine-retest.mjs \
  scripts/vps-apply-marketing-launch.sh \
  docs/marketing

echo ""
echo "Created: $OUT"
echo ""
echo "Upload to VPS:"
echo "  scp marketing-launch-bundle.tar.gz root@leadedge360:/opt/asoftech-insightz/"
echo ""
echo "On VPS:"
echo "  cd /opt/asoftech-insightz"
echo "  tar xzf marketing-launch-bundle.tar.gz"
echo "  bash scripts/vps-apply-marketing-launch.sh"
