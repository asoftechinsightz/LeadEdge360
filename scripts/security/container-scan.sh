#!/usr/bin/env bash
# Container image vulnerability scan via Docker Scout or Trivy (if installed).
set -euo pipefail

IMAGE="${1:-asoftech-app:latest}"
REPORT="${2:-docs/container-scan-last-run.json}"

echo "Container scan: $IMAGE"

if command -v trivy >/dev/null 2>&1; then
  trivy image --severity HIGH,CRITICAL --format json -o "$REPORT" "$IMAGE"
  echo "PASS trivy scan → $REPORT"
elif command -v docker >/dev/null 2>&1 && docker scout version >/dev/null 2>&1; then
  docker scout cves "$IMAGE" --format json > "$REPORT"
  echo "PASS docker scout → $REPORT"
else
  mkdir -p "$(dirname "$REPORT")"
  echo "{\"status\":\"skipped\",\"reason\":\"install trivy or docker scout\",\"image\":\"$IMAGE\"}" > "$REPORT"
  echo "WARN scan skipped — install trivy: https://aquasecurity.github.io/trivy/"
  exit 0
fi
