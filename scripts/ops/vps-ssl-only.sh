#!/usr/bin/env bash
# Minimal SSL repair — run on VPS when git pull is unavailable.
#   curl -sL <url> | sudo bash
#   OR: sudo bash scripts/ops/vps-ssl-only.sh
#
# Fixes NET::ERR_CERT_COMMON_NAME_INVALID on asoftechinsightz.com

set -euo pipefail

EMAIL="${CERTBOT_EMAIL:-enquiry@asoftechinsightz.com}"

echo "==> VPS SSL repair (marketing + suite domains)"
echo

if ! command -v certbot >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y certbot python3-certbot-nginx
fi

echo "==> Current certificates"
certbot certificates || true
echo

echo "==> Issue / expand marketing cert (asoftechinsightz.com + www)"
certbot certonly --nginx --expand --non-interactive --agree-tos \
  -m "$EMAIL" --cert-name asoftechinsightz.com \
  -d asoftechinsightz.com -d www.asoftechinsightz.com \
  || certbot certonly --nginx --non-interactive --agree-tos \
  -m "$EMAIL" --cert-name asoftechinsightz.com \
  -d asoftechinsightz.com -d www.asoftechinsightz.com

echo "==> Issue / expand suite cert (app + api)"
certbot certonly --nginx --expand --non-interactive --agree-tos \
  -m "$EMAIL" --cert-name app.asoftechinsightz.com \
  -d app.asoftechinsightz.com -d api.asoftechinsightz.com \
  || certbot certonly --nginx --non-interactive --agree-tos \
  -m "$EMAIL" --cert-name app.asoftechinsightz.com \
  -d app.asoftechinsightz.com -d api.asoftechinsightz.com

# Patch nginx ssl paths if using default site (safe fallback)
ASOFTECH_SITE="/etc/nginx/sites-available/asoftech"
if [[ -f "$ASOFTECH_SITE" ]]; then
  sed -i 's|/etc/letsencrypt/live/app/|/etc/letsencrypt/live/app.asoftechinsightz.com/|g' "$ASOFTECH_SITE" || true
fi

echo "==> Test & reload nginx"
nginx -t
systemctl reload nginx

echo
echo "==> Certificate SANs"
for c in asoftechinsightz.com app.asoftechinsightz.com; do
  if [[ -f "/etc/letsencrypt/live/${c}/fullchain.pem" ]]; then
    echo "--- $c"
    openssl x509 -in "/etc/letsencrypt/live/${c}/fullchain.pem" -noout -ext subjectAltName
  fi
done

echo
echo "==> Smoke test"
curl -sS -o /dev/null -w "asoftechinsightz.com → %{http_code}\n" https://asoftechinsightz.com || true
curl -sS -o /dev/null -w "app.asoftechinsightz.com → %{http_code}\n" https://app.asoftechinsightz.com/api/health/live || true
echo "Done."
