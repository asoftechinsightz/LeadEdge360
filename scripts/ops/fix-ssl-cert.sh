#!/usr/bin/env bash
# Expand existing Let's Encrypt certs on VPS (do not create separate asoftechinsightz.com cert).
set -euo pipefail
EMAIL="${CERTBOT_EMAIL:-enquiry@asoftechinsightz.com}"

echo "==> Expand suite cert (marketing + app + api)"
certbot certonly --nginx --expand --non-interactive --agree-tos \
  -m "$EMAIL" --cert-name app.asoftechinsightz.com \
  -d asoftechinsightz.com -d www.asoftechinsightz.com \
  -d app.asoftechinsightz.com -d api.asoftechinsightz.com

nginx -t && systemctl reload nginx
echo "Done."
