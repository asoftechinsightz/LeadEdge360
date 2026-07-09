#!/usr/bin/env bash
# Apply AsoftechInsightz routes on observability360-nginx-1 (shared edge :80/:443)
# Run on VPS: sudo bash scripts/ops/vps-apply-asoftech-edge.sh
set -euo pipefail

OBS_CONF=/opt/observability360/infra/nginx/observability360.conf
CERT_HOST_DIR=/opt/observability360/infra/nginx/certs
LE=/etc/letsencrypt/live/app.asoftechinsightz.com

echo "==> 1. Connect asoftech-app to observability360 Docker network"
NET=$(docker inspect observability360-nginx-1 --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{"\n"}}{{end}}' | head -1)
echo "    Network: ${NET}"
docker network connect "${NET}" asoftech-app 2>/dev/null || true

echo "==> 2. Test asoftech-app from nginx container"
if ! docker exec observability360-nginx-1 wget -qO- --timeout=5 http://asoftech-app:3000/api/health/live; then
  echo "ERROR: nginx cannot reach asoftech-app:3000 on network ${NET}"
  echo "       Ensure asoftech-app container is running: docker ps | grep asoftech-app"
  exit 1
fi
echo

echo "==> 3. Copy Business Suite TLS cert into observability nginx certs volume"
if [[ ! -f "${LE}/fullchain.pem" ]]; then
  echo "ERROR: Missing ${LE}/fullchain.pem — run: sudo certbot certificates"
  exit 1
fi
cp -L "${LE}/fullchain.pem" "${CERT_HOST_DIR}/asoftech-fullchain.pem"
cp -L "${LE}/privkey.pem" "${CERT_HOST_DIR}/asoftech-privkey.pem"
chmod 644 "${CERT_HOST_DIR}/asoftech-fullchain.pem"
chmod 600 "${CERT_HOST_DIR}/asoftech-privkey.pem"
echo "    Installed ${CERT_HOST_DIR}/asoftech-*.pem"
echo

echo "==> 4. Append Asoftech server blocks (skip if already present)"
if grep -q 'upstream asoftech_nextjs' "${OBS_CONF}"; then
  echo "    Already configured in ${OBS_CONF}"
else
  cat >> "${OBS_CONF}" << 'NGINX_EOF'

# --- AsoftechInsightz (marketing + Business Suite) — added by vps-apply-asoftech-edge.sh ---
upstream asoftech_nextjs {
    server asoftech-app:3000;
    keepalive 8;
}

server {
    listen 80;
    server_name asoftechinsightz.com www.asoftechinsightz.com app.asoftechinsightz.com api.asoftechinsightz.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    http2 on;
    server_name asoftechinsightz.com www.asoftechinsightz.com;

    ssl_certificate     /etc/nginx/certs/asoftech-fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/asoftech-privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    client_max_body_size 25m;

    location ~ ^/(dashboard|leadedge360|retailedge360|leads|opportunities|proposals|invoices|revenue|campaigns|analytics|settings|payments|onboarding|ops|subscribe|signin|signup|splash|product-selection|portal)(/|$) {
        return 301 https://app.asoftechinsightz.com$request_uri;
    }

    location / {
        proxy_pass http://asoftech_nextjs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}

server {
    listen 443 ssl;
    http2 on;
    server_name app.asoftechinsightz.com;

    ssl_certificate     /etc/nginx/certs/asoftech-fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/asoftech-privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    client_max_body_size 25m;

    location / {
        proxy_pass http://asoftech_nextjs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}

server {
    listen 443 ssl;
    http2 on;
    server_name api.asoftechinsightz.com;

    ssl_certificate     /etc/nginx/certs/asoftech-fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/asoftech-privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    client_max_body_size 25m;

    location / {
        rewrite ^/(.*)$ /api/$1 break;
        proxy_pass http://asoftech_nextjs;
        proxy_http_version 1.1;
        proxy_set_header Host app.asoftechinsightz.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
NGINX_EOF
  echo "    Appended to ${OBS_CONF}"
fi
echo

echo "==> 5. Reload observability360 nginx"
docker exec observability360-nginx-1 nginx -t
docker exec observability360-nginx-1 nginx -s reload
echo

echo "==> 6. Smoke tests"
curl -sS -o /dev/null -w "https://asoftechinsightz.com → %{http_code}\n" https://asoftechinsightz.com || true
curl -sS -o /dev/null -w "https://app.asoftechinsightz.com → %{http_code}\n" https://app.asoftechinsightz.com/api/health/live || true
echo "Done."
