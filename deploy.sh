#!/usr/bin/env bash
# ==============================================================================
#  AsoftechInsightz — one-shot VPS bootstrapper (Ubuntu 22.04 / 24.04)
#  Runs Phases 2–7 of DEPLOYMENT.md non-interactively.
#
#  Usage:
#     curl -fsSL https://raw.githubusercontent.com/<you>/asoftech-insightz/main/deploy.sh -o deploy.sh
#     chmod +x deploy.sh
#     sudo APP_DOMAIN=app.asoftechinsightz.com ROOT_DOMAIN=asoftechinsightz.com \
#          FLOWS_DOMAIN=flows.asoftechinsightz.com ./deploy.sh
#
#  Required env vars:
#     APP_DOMAIN      Public domain for the Next.js app (e.g. app.example.com)
#     ROOT_DOMAIN     Apex domain (e.g. example.com)              [optional]
#     FLOWS_DOMAIN    Domain for n8n (e.g. flows.example.com)     [optional]
#     APP_DIR         Where to clone/extract the app    (default: /opt/asoftech-insightz)
#     REPO_URL        Git repo to clone                  (optional; or use tarball)
#     TARBALL_URL     HTTPS URL to .tar.gz               (optional; alternative to REPO_URL)
#     EMERGENT_LLM_KEY, EMERGENT_PROJECT_ID, EMERGENT_API_KEY,
#     NEXT_PUBLIC_RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
#     N8N_BASICAUTH_USER  (default: admin)
#     N8N_BASICAUTH_PASS  (default: random)
# ==============================================================================
set -euo pipefail

# ----- helpers -----
color() { printf "\033[1;%sm%s\033[0m\n" "$1" "$2"; }
log()   { color 36 "▶ $*"; }
ok()    { color 32 "✓ $*"; }
warn()  { color 33 "⚠ $*"; }
die()   { color 31 "✗ $*"; exit 1; }

[[ $EUID -eq 0 ]] || die "Run as root (use sudo)."
[[ -n "${APP_DOMAIN:-}" ]] || die "APP_DOMAIN env var is required."

APP_DIR="${APP_DIR:-/opt/asoftech-insightz}"
ROOT_DOMAIN="${ROOT_DOMAIN:-}"
FLOWS_DOMAIN="${FLOWS_DOMAIN:-flows.${APP_DOMAIN#*.}}"
N8N_BASICAUTH_USER="${N8N_BASICAUTH_USER:-admin}"
N8N_BASICAUTH_PASS="${N8N_BASICAUTH_PASS:-$(openssl rand -base64 18)}"
N8N_WEBHOOK_TOKEN_GEN="$(openssl rand -hex 32)"
RZP_WEBHOOK_SECRET_GEN="$(openssl rand -hex 24)"

log "Targets: app=$APP_DOMAIN root=${ROOT_DOMAIN:-<none>} flows=$FLOWS_DOMAIN dir=$APP_DIR"
log "Updating apt"
apt-get update -y >/dev/null
apt-get install -y curl ca-certificates gnupg lsb-release ufw rsync apt-transport-https debian-keyring debian-archive-keyring >/dev/null

# ----- Phase 2: Docker + Caddy -----
if ! command -v docker >/dev/null; then
  log "Installing Docker"
  curl -fsSL https://get.docker.com | sh >/dev/null
fi
ok "Docker $(docker -v | awk '{print $3}' | tr -d ,)"

if ! command -v caddy >/dev/null; then
  log "Installing Caddy"
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  apt-get update -y >/dev/null && apt-get install -y caddy >/dev/null
fi
ok "Caddy $(caddy version | awk '{print $1}')"

# Firewall
log "Configuring UFW (22, 80, 443)"
ufw allow OpenSSH >/dev/null
ufw allow 80 >/dev/null
ufw allow 443 >/dev/null
yes | ufw enable >/dev/null || true
ok "Firewall active"

# ----- Phase 3: Get the code -----
mkdir -p "$APP_DIR"
if [[ -d "$APP_DIR/.git" ]]; then
  log "Updating existing repo at $APP_DIR"
  git -C "$APP_DIR" pull --ff-only
elif [[ -n "${REPO_URL:-}" ]]; then
  log "Cloning $REPO_URL"
  git clone "$REPO_URL" "$APP_DIR"
elif [[ -n "${TARBALL_URL:-}" ]]; then
  log "Downloading tarball"
  curl -fsSL "$TARBALL_URL" -o /tmp/asoftech.tar.gz
  tar -xzf /tmp/asoftech.tar.gz -C /tmp
  rsync -a /tmp/asoftech-insightz/ "$APP_DIR/"
else
  warn "Neither REPO_URL nor TARBALL_URL set — expecting $APP_DIR to already contain the code."
  [[ -f "$APP_DIR/package.json" ]] || die "No code found in $APP_DIR. Set REPO_URL or TARBALL_URL."
fi
ok "Code present at $APP_DIR"

cd "$APP_DIR"

# ----- Phase 4: Secrets -----
if [[ ! -f .env ]]; then
  log "Writing .env"
  cat > .env <<EOF
MONGO_URL=mongodb://mongo:27017
DB_NAME=asoftech_saas
NEXT_PUBLIC_BASE_URL=https://${APP_DOMAIN}
NEXT_PUBLIC_APP_URL=https://${APP_DOMAIN}
CORS_ORIGINS=https://${APP_DOMAIN}${ROOT_DOMAIN:+,https://${ROOT_DOMAIN}}
EMERGENT_LLM_KEY=${EMERGENT_LLM_KEY:-}
EMERGENT_PROJECT_ID=${EMERGENT_PROJECT_ID:-}
EMERGENT_API_KEY=${EMERGENT_API_KEY:-}
NEXT_PUBLIC_RAZORPAY_KEY_ID=${NEXT_PUBLIC_RAZORPAY_KEY_ID:-}
RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET:-}
RAZORPAY_WEBHOOK_SECRET=${RAZORPAY_WEBHOOK_SECRET:-$RZP_WEBHOOK_SECRET_GEN}
N8N_WEBHOOK_TOKEN=${N8N_WEBHOOK_TOKEN:-$N8N_WEBHOOK_TOKEN_GEN}
EOF
  chmod 600 .env
  ok ".env created (secrets generated where missing)"
else
  warn ".env already exists — not overwriting"
fi

# ----- Phase 6: Boot the stack -----
log "Building & starting docker compose stack"
docker compose up -d --build
sleep 5
docker compose ps

# ----- Phase 7: Caddy -----
N8N_BCRYPT=$(caddy hash-password --plaintext "$N8N_BASICAUTH_PASS")
log "Writing /etc/caddy/Caddyfile"
cat > /etc/caddy/Caddyfile <<EOF
${ROOT_DOMAIN:+${ROOT_DOMAIN}, }${APP_DOMAIN} {
    encode gzip
    reverse_proxy localhost:3000
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}

${FLOWS_DOMAIN} {
    encode gzip
    basicauth /* {
        ${N8N_BASICAUTH_USER} ${N8N_BCRYPT}
    }
    reverse_proxy localhost:5678
}
EOF
systemctl reload caddy || systemctl restart caddy
ok "Caddy reloaded (auto-HTTPS provisioning in background)"

# ----- Health check -----
sleep 5
log "Waiting for app to become healthy…"
for i in {1..30}; do
  if curl -fsS http://localhost:3000/api/ >/dev/null 2>&1; then
    ok "App healthy at http://localhost:3000"
    break
  fi
  sleep 2
  [[ $i -eq 30 ]] && warn "App not responding after 60s — check: docker compose logs app"
done

# ----- Summary -----
cat <<EOF

========================================================================
  🎉  AsoftechInsightz deployment complete
========================================================================
  App:        https://${APP_DOMAIN}
  Flows:      https://${FLOWS_DOMAIN}
              user: ${N8N_BASICAUTH_USER}
              pass: ${N8N_BASICAUTH_PASS}
  Code:       ${APP_DIR}
  Compose:    docker compose -f ${APP_DIR}/docker-compose.yml ...
  Logs:       docker compose logs -f app
  Health:     curl https://${APP_DOMAIN}/api/

  Webhook token (use this in n8n env):
  N8N_WEBHOOK_TOKEN=$(grep '^N8N_WEBHOOK_TOKEN=' ${APP_DIR}/.env | cut -d= -f2)

  Razorpay webhook secret (use in Razorpay dashboard):
  RAZORPAY_WEBHOOK_SECRET=$(grep '^RAZORPAY_WEBHOOK_SECRET=' ${APP_DIR}/.env | cut -d= -f2)
========================================================================
EOF
