# Shared edge nginx — observability360-nginx serves ALL public domains

On VPS `leadedge360`, **`observability360-nginx-1`** owns ports **80** and **443** (not host nginx, not `asoftech-nginx`).

That is why:
- Editing `/etc/nginx/sites-available/asoftech` had no effect
- `systemctl reload nginx` said **service not active**
- `asoftechinsightz.com` showed the **observability360** certificate error

## Domain routing target

| Host | Upstream |
|------|----------|
| `asoftechinsightz.com`, `www` | `asoftech-app` → host `:3000` |
| `app.asoftechinsightz.com` | `asoftech-app` → host `:3000` |
| `api.asoftechinsightz.com` | `asoftech-app` → host `:3000` `/api/*` |
| `observability360.asoftechinsightz.com` | observability360 stack |
| `api.observability360.asoftechinsightz.com` | api-gateway `:4000` |

TLS cert for marketing + suite: **`/etc/letsencrypt/live/app.asoftechinsightz.com/`** (already includes apex + www).

---

## Step 1 — Inspect current edge nginx (VPS)

```bash
docker exec observability360-nginx-1 ls /etc/nginx/conf.d/
docker exec observability360-nginx-1 cat /etc/nginx/conf.d/default.conf
docker inspect observability360-nginx-1 --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{"\n"}}{{end}}'
```

Find the Observability360 compose directory:

```bash
find /opt -maxdepth 3 -name 'docker-compose*.yml' 2>/dev/null | xargs grep -l 'observability360-nginx' 2>/dev/null
```

---

## Step 2 — Test reachability to Business Suite from nginx container

`asoftech-app` publishes `127.0.0.1:3000` on the **host**. From another container use the host gateway:

```bash
# Try common Docker bridge gateways
for ip in 172.17.0.1 172.18.0.1 172.19.0.1 187.127.179.138; do
  echo -n "$ip: "
  docker exec observability360-nginx-1 wget -qO- --timeout=2 "http://${ip}:3000/api/health/live" 2>/dev/null || echo FAIL
done
```

Use whichever IP returns JSON — set as `$asoftech_upstream` below (usually `172.18.0.1` or `172.17.0.1`).

---

## Step 3 — Add Asoftech server blocks

Copy `infra/nginx/asoftech-edge.conf` from this repo into the Observability360 nginx `conf.d/` folder, then set the upstream IP from Step 2.

Or paste into `/opt/observability360/nginx/conf.d/asoftech.conf` (path may vary):

```nginx
# Replace 172.18.0.1 with the IP that worked in Step 2
upstream asoftech_nextjs {
    server 172.18.0.1:3000;
    keepalive 8;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name asoftechinsightz.com www.asoftechinsightz.com;

    ssl_certificate     /etc/letsencrypt/live/app.asoftechinsightz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.asoftechinsightz.com/privkey.pem;

    location ~ ^/(dashboard|leadedge360|retailedge360|leads|opportunities|proposals|invoices|revenue|campaigns|analytics|settings|payments|onboarding|ops|subscribe|signin|signup|splash|product-selection|portal)(/|$) {
        return 301 https://app.asoftechinsightz.com$request_uri;
    }

    location / {
        proxy_pass http://asoftech_nextjs;
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

    location / {
        proxy_pass http://asoftech_nextjs;
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

    location / {
        rewrite ^/(.*)$ /api/$1 break;
        proxy_pass http://asoftech_nextjs;
        proxy_set_header Host app.asoftechinsightz.com;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Mount host Let's Encrypt** in Observability360 `docker-compose.yml` nginx service if not already:

```yaml
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
  - ./nginx/conf.d:/etc/nginx/conf.d:ro
```

Reload:

```bash
docker exec observability360-nginx-1 nginx -t
docker exec observability360-nginx-1 nginx -s reload
```

---

## Step 4 — Do NOT start `asoftech-nginx`

Ports 80/443 are already used. Business Suite edge TLS is handled by **observability360-nginx-1**.

```bash
docker stop asoftech-nginx 2>/dev/null; docker rm asoftech-nginx 2>/dev/null
```

---

## Step 5 — Expand cert for `api` (optional)

Stop edge nginx briefly:

```bash
docker stop observability360-nginx-1

sudo certbot certonly --standalone --non-interactive --agree-tos \
  -m enquiry@asoftechinsightz.com \
  --cert-name app.asoftechinsightz.com --expand \
  -d asoftechinsightz.com -d www.asoftechinsightz.com \
  -d app.asoftechinsightz.com -d api.asoftechinsightz.com

docker start observability360-nginx-1
```

---

## Verify

```bash
curl -sI https://asoftechinsightz.com | head -5
curl -sI https://app.asoftechinsightz.com/api/health/live | head -5
openssl s_client -connect asoftechinsightz.com:443 -servername asoftechinsightz.com </dev/null 2>/dev/null | openssl x509 -noout -subject -ext subjectAltName
```

Expected SANs include `asoftechinsightz.com` and `app.asoftechinsightz.com`.
