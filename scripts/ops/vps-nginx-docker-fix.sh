#!/usr/bin/env bash
# Diagnose and fix TLS when Docker nginx holds :80/:443 (host systemd nginx inactive).
#
# Run on VPS:
#   sudo bash scripts/ops/vps-nginx-docker-fix.sh
#
# Two modes:
#   MODE=docker  (default) — patch Docker asoftech-nginx + reload
#   MODE=host            — stop Docker nginx, start host nginx with docs/nginx.conf

set -euo pipefail

MODE="${MODE:-docker}"
REPO="${REPO:-/opt/asoftech-insightz}"
CERT_LIVE="/etc/letsencrypt/live/app.asoftechinsightz.com"

echo "==> Who owns :80 and :443?"
ss -tlnp | grep -E ':80 |:443 ' || true
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null | head -20 || true
echo

if [[ ! -f "${CERT_LIVE}/fullchain.pem" ]]; then
  echo "ERROR: Missing cert at ${CERT_LIVE}"
  exit 1
fi

fix_host_nginx() {
  echo "==> MODE=host — use systemd nginx"
  docker stop asoftech-nginx 2>/dev/null || true
  cp "${REPO}/docs/nginx.conf" /etc/nginx/sites-available/asoftech
  sed -i 's|/etc/letsencrypt/live/asoftechinsightz.com/|/etc/letsencrypt/live/app.asoftechinsightz.com/|g' /etc/nginx/sites-available/asoftech
  ln -sf /etc/nginx/sites-available/asoftech /etc/nginx/sites-enabled/asoftech
  systemctl daemon-reload
  nginx -t
  systemctl enable nginx
  systemctl restart nginx
  systemctl status nginx --no-pager | head -5
}

fix_docker_nginx() {
  echo "==> MODE=docker — patch asoftech-nginx container"
  if ! docker ps --format '{{.Names}}' | grep -q '^asoftech-nginx$'; then
    echo "asoftech-nginx not running. Start with:"
    echo "  cd ${REPO} && docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d nginx"
    echo "Or switch to host nginx: MODE=host sudo bash $0"
    exit 1
  fi

  # Write minimal working config into container (marketing + app use same cert)
  docker exec asoftech-nginx sh -c 'cat > /etc/nginx/conf.d/default.conf' << 'NGINX_EOF'
upstream asoftech_app {
    server app:3000;
    keepalive 16;
}

server {
    listen 80;
    listen [::]:80;
    server_name asoftechinsightz.com www.asoftechinsightz.com app.asoftechinsightz.com api.asoftechinsightz.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name asoftechinsightz.com www.asoftechinsightz.com;

    ssl_certificate     /etc/letsencrypt/live/app.asoftechinsightz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.asoftechinsightz.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 25M;

    location ~ ^/(dashboard|leadedge360|retailedge360|leads|opportunities|proposals|invoices|revenue|campaigns|analytics|settings|payments|onboarding|ops|subscribe|signin|signup|splash|product-selection|portal)(/|$) {
        return 301 https://app.asoftechinsightz.com$request_uri;
    }

    location / {
        proxy_pass http://asoftech_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name app.asoftechinsightz.com;

    ssl_certificate     /etc/letsencrypt/live/app.asoftechinsightz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.asoftechinsightz.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 25M;

    location / {
        proxy_pass http://asoftech_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name api.asoftechinsightz.com;

    ssl_certificate     /etc/letsencrypt/live/app.asoftechinsightz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.asoftechinsightz.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 25M;

    location / {
        rewrite ^/(.*)$ /api/$1 break;
        proxy_pass http://asoftech_app;
        proxy_set_header Host app.asoftechinsightz.com;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_EOF

  # Ensure container can read host certs (bind-mount if missing)
  if ! docker exec asoftech-nginx test -f /etc/letsencrypt/live/app.asoftechinsightz.com/fullchain.pem 2>/dev/null; then
    echo "==> Mounting host /etc/letsencrypt into container (recreate nginx with volume)"
    cd "${REPO}"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod stop nginx || true
    docker rm asoftech-nginx 2>/dev/null || true
    # Recreate with host letsencrypt bind (one-off docker run pattern documented below)
    echo "Run manually after stopping nginx:"
    echo "  docker run -d --name asoftech-nginx --network asoftech-insightz_backend \\"
    echo "    -p 80:80 -p 443:443 \\"
    echo "    -v /etc/letsencrypt:/etc/letsencrypt:ro \\"
    echo "    -v ${REPO}/infra/nginx/asoftech-production.conf:/etc/nginx/conf.d/default.conf:ro \\"
    echo "    nginx:1.27-alpine"
    exit 1
  fi

  docker exec asoftech-nginx nginx -t
  docker exec asoftech-nginx nginx -s reload
  echo "Docker nginx reloaded."
}

case "$MODE" in
  host) fix_host_nginx ;;
  *) fix_docker_nginx ;;
esac

echo
echo "==> Smoke test"
curl -sS -o /dev/null -w "asoftechinsightz.com → %{http_code}\n" https://asoftechinsightz.com || true
curl -sS -o /dev/null -w "app.asoftechinsightz.com → %{http_code}\n" https://app.asoftechinsightz.com/api/health/live || true
