#!/usr/bin/env bash
# Install Playwright Chromium system libraries on Ubuntu/Debian VPS.
# Run from anywhere: sudo bash /opt/asoftech-insightz/scripts/qa/install-playwright-system-deps.sh
set -euo pipefail

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run as root: sudo bash scripts/qa/install-playwright-system-deps.sh"
  exit 1
fi

echo "==> Playwright system dependencies (Ubuntu/Debian)"

# Broken third-party repos block apt update — disable known offenders first.
shopt -s nullglob
for f in /etc/apt/sources.list.d/trivy.list /etc/apt/sources.list.d/*trivy*; do
  if [[ -f "$f" && ! "$f" =~ \.disabled$ ]]; then
    echo "Disabling broken apt source: $f"
    mv -f "$f" "${f}.disabled"
  fi
done
shopt -u nullglob

export DEBIAN_FRONTEND=noninteractive
echo "==> apt-get update (continues even if some repos fail)"
apt-get update -qq || apt-get update -qq --allow-releaseinfo-change || true

PKGS=(
  libnss3
  libnspr4
  libdbus-1-3
  libatk1.0-0
  libatk-bridge2.0-0
  libatspi2.0-0
  libcups2
  libdrm2
  libxkbcommon0
  libxcomposite1
  libxdamage1
  libxfixes3
  libxrandr2
  libgbm1
  libpango-1.0-0
  libcairo2
  libxshmfence1
  libglib2.0-0
  fonts-liberation
  fonts-noto-color-emoji
)

if apt-cache show libasound2t64 &>/dev/null; then
  PKGS+=(libasound2t64)
elif apt-cache show libasound2 &>/dev/null; then
  PKGS+=(libasound2)
fi

echo "==> Installing: ${PKGS[*]}"
apt-get install -y --no-install-recommends "${PKGS[@]}"

# Confirm libatk is on disk
if ! ldconfig -p 2>/dev/null | grep -q 'libatk-1.0.so.0'; then
  echo "WARNING: libatk-1.0.so.0 not in ldconfig cache — running ldconfig"
  ldconfig
fi

if ! ldconfig -p 2>/dev/null | grep -q 'libatk-1.0.so.0'; then
  echo "ERROR: libatk1.0-0 did not install correctly."
  echo "Try manually: apt-get install -y libatk1.0-0"
  exit 1
fi

echo "==> libatk-1.0.so.0 found"

echo "==> Verifying Chromium binary"
SHELL_BIN=""
while IFS= read -r -d '' f; do
  SHELL_BIN="$f"
  break
done < <(find /root/.cache/ms-playwright -name chrome-headless-shell -type f -print0 2>/dev/null)

if [[ -z "$SHELL_BIN" ]]; then
  while IFS= read -r -d '' f; do
    SHELL_BIN="$f"
    break
  done < <(find /root/.cache/ms-playwright -name chrome -path '*/chrome-linux/*' -type f -print0 2>/dev/null)
fi

if [[ -n "$SHELL_BIN" ]]; then
  MISSING="$(ldd "$SHELL_BIN" 2>/dev/null | grep 'not found' || true)"
  if [[ -n "$MISSING" ]]; then
    echo "WARNING — Chromium still missing libraries:"
    echo "$MISSING"
    echo ""
    echo "Install each missing library, e.g.:"
    echo "  apt-get install -y libatk1.0-0 libatk-bridge2.0-0 libatspi2.0-0"
    exit 1
  fi
  echo "OK — $SHELL_BIN"
else
  echo "Chromium not cached yet. After this script, run as app user:"
  echo "  cd /opt/asoftech-insightz && npm run test:e2e:install"
fi

echo ""
echo "Done. Re-run enterprise E2E:"
echo "  cd /opt/asoftech-insightz"
echo "  E2E_BASE_URL=https://app.asoftechinsightz.com \\"
echo "  CERT_ADMIN_EMAIL=demo@asoftechinsightz.com \\"
echo "  CERT_ADMIN_PASSWORD='...' \\"
echo "  npm run test:e2e:enterprise"
