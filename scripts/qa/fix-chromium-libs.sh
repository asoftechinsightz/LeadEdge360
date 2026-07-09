#!/usr/bin/env bash
# Diagnose + install missing Chromium shared libraries (Ubuntu 22.04–26.04).
# Usage: sudo bash scripts/qa/fix-chromium-libs.sh
set -euo pipefail

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run as root: sudo bash scripts/qa/fix-chromium-libs.sh"
  exit 1
fi

echo "==> Disable broken apt repos (Trivy etc.)"
shopt -s nullglob
for f in /etc/apt/sources.list.d/trivy.list /etc/apt/sources.list.d/*trivy*; do
  [[ -f "$f" && ! "$f" =~ \.disabled$ ]] && mv -f "$f" "${f}.disabled" && echo "  disabled $f"
done
shopt -u nullglob

export DEBIAN_FRONTEND=noninteractive
echo "==> apt-get update"
apt-get update -qq || apt-get update -qq --allow-releaseinfo-change || apt-get update || true

pick_pkg() {
  local base="$1"
  if apt-cache show "${base}t64" &>/dev/null; then
    echo "${base}t64"
  elif apt-cache show "$base" &>/dev/null; then
    echo "$base"
  else
    echo "$base"
  fi
}

# Ubuntu 26.04 (resolute) uses t64 variants for many libraries.
PKGS=(
  "$(pick_pkg libatk1.0-0)"
  "$(pick_pkg libatk-bridge2.0-0)"
  "$(pick_pkg libatspi2.0-0)"
  libxdamage1
  "$(pick_pkg libasound2)"
  libxcomposite1 libxfixes3 libxrandr2
  libgbm1 libdrm2 libcups2 libnss3 libnspr4 libdbus-1-3
  libxkbcommon0 libpango-1.0-0 libcairo2 libxshmfence1
  libglib2.0-0 fonts-liberation fonts-noto-color-emoji
)

echo "==> Installing:"
printf '  %s\n' "${PKGS[@]}"
apt-get install -y --no-install-recommends "${PKGS[@]}"

ldconfig

SHELL_BIN="$(find /root/.cache/ms-playwright -name chrome-headless-shell -type f 2>/dev/null | head -1)"
if [[ -z "$SHELL_BIN" ]]; then
  echo "Chromium not cached. Run: cd /opt/asoftech-insightz && npm run test:e2e:install"
  exit 0
fi

echo "==> ldd check: $SHELL_BIN"
REMAIN="$(ldd "$SHELL_BIN" 2>/dev/null | grep 'not found' || true)"
if [[ -n "$REMAIN" ]]; then
  echo "STILL MISSING:"
  echo "$REMAIN"
  exit 1
fi

echo "OK — Chromium shared libraries satisfied"
echo "Next: cd /opt/asoftech-insightz && npm run test:e2e:enterprise"
