#!/usr/bin/env bash
# Install Playwright Firefox + WebKit system libraries (Ubuntu 22.04–26.04).
# Chromium deps: scripts/qa/install-playwright-system-deps.sh
# Usage: sudo bash scripts/qa/install-playwright-all-browsers-deps.sh
set -euo pipefail

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run as root: sudo bash scripts/qa/install-playwright-all-browsers-deps.sh"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "==> Playwright Firefox + WebKit system dependencies"

shopt -s nullglob
for f in /etc/apt/sources.list.d/trivy.list /etc/apt/sources.list.d/*trivy*; do
  if [[ -f "$f" && ! "$f" =~ \.disabled$ ]]; then
    echo "Disabling broken apt source: $f"
    mv -f "$f" "${f}.disabled"
  fi
done
shopt -u nullglob

export DEBIAN_FRONTEND=noninteractive
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

# Ubuntu 24.04+ / 26.04 — aligned with Playwright install-deps (noble).
PKGS=(
  gstreamer1.0-libav
  gstreamer1.0-plugins-bad
  gstreamer1.0-plugins-base
  gstreamer1.0-plugins-good
  libatomic1
  libgraphene-1.0-0
  libgtk-4-1
  libflite1
  libavif16
  libwebpmux3
  libwebp7
  libwebpdemux2
  "$(pick_pkg libevent-2.1-7)"
  libopus0
  libenchant-2-2
  libsecret-1-0
  libhyphen0
  libmanette-0.2-0
  libharfbuzz-icu0
  libharfbuzz0b
  libepoxy0
  libjpeg-turbo8
  libwayland-client0
  libwayland-egl1
  libwayland-server0
  libgstreamer-gl1.0-0
  libgstreamer-plugins-bad1.0-0
  libgstreamer-plugins-base1.0-0
  libgstreamer1.0-0
  libx264-164
  libwoff1
  libgles2
  libgbm1
  libdrm2
  libgdk-pixbuf-2.0-0
  libcairo-gobject2
  libcairo2
  libdbus-1-3
  libfontconfig1
  libfreetype6
  liblcms2-2
  libpango-1.0-0
  libpangocairo-1.0-0
  libpng16-16t64
  libvpx9
  libx11-6
  libxkbcommon0
  libxml2
  libxslt1.1
  libsoup-3.0-0
  "$(pick_pkg libasound2)"
  "$(pick_pkg libatk1.0-0)"
  "$(pick_pkg libatk-bridge2.0-0)"
  "$(pick_pkg libglib2.0-0)"
  # Firefox
  "$(pick_pkg libgtk-3-0)"
  libavcodec60
  libx11-xcb1
  libxcb-shm0
  libxcb1
  libxcomposite1
  libxcursor1
  libxdamage1
  libxext6
  libxfixes3
  libxi6
  libxrandr2
  libxrender1
  fonts-liberation
  fonts-noto-color-emoji
)

# Drop packages not in apt (optional codecs vary by release).
RESOLVED=()
for pkg in "${PKGS[@]}"; do
  if apt-cache show "$pkg" &>/dev/null; then
    RESOLVED+=("$pkg")
  else
    echo "  skip (not in apt): $pkg"
  fi
done

echo "==> Installing ${#RESOLVED[@]} packages..."
apt-get install -y --no-install-recommends "${RESOLVED[@]}"

ldconfig

# Prefer Playwright's own dep checker when CLI is available.
if [[ -f "$ROOT/node_modules/@playwright/test/cli.js" ]]; then
  echo "==> Playwright install-deps (firefox webkit)"
  cd "$ROOT"
  node node_modules/@playwright/test/cli.js install-deps firefox webkit || true
fi

verify_browser() {
  local label="$1"
  local pattern="$2"
  local bin
  bin="$(find /root/.cache/ms-playwright -type f -name "$pattern" 2>/dev/null | head -1)"
  if [[ -z "$bin" ]]; then
    echo "WARN: $label binary not cached — run: cd $ROOT && node node_modules/@playwright/test/cli.js install $label"
    return 0
  fi
  local missing
  missing="$(ldd "$bin" 2>/dev/null | grep 'not found' || true)"
  if [[ -n "$missing" ]]; then
    echo "FAIL: $label still missing libraries ($bin):"
    echo "$missing"
    return 1
  fi
  echo "OK: $label — $bin"
}

FAIL=0
verify_browser firefox firefox || FAIL=1
# WebKit launcher is pw_run.sh in the webkit folder.
WEBKIT_BIN="$(find /root/.cache/ms-playwright -path '*webkit*' -name pw_run.sh -type f 2>/dev/null | head -1)"
if [[ -n "$WEBKIT_BIN" ]]; then
  missing="$(ldd "$WEBKIT_BIN" 2>/dev/null | grep 'not found' || true)"
  if [[ -n "$missing" ]]; then
    echo "FAIL: webkit still missing libraries:"
    echo "$missing"
    FAIL=1
  else
    echo "OK: webkit — $WEBKIT_BIN"
  fi
else
  echo "WARN: webkit not cached — run: node node_modules/@playwright/test/cli.js install webkit"
fi

if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi

echo ""
echo "Done. Re-run browser matrix:"
echo "  cd $ROOT"
echo "  E2E_BASE_URL=https://app.asoftechinsightz.com \\"
echo "  CERT_ADMIN_EMAIL=demo@asoftechinsightz.com \\"
echo "  CERT_ADMIN_PASSWORD='...' \\"
echo "  npm run test:e2e:enterprise:browsers"
