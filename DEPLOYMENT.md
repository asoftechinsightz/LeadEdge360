# AsoftechInsightz — Deployment Guide

A step-by-step guide to deploy AsoftechInsightz to your own environment (Docker, VPS, AWS, GCP, Azure, or any Linux server).

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Get the code (GitHub)](#2-get-the-code-onto-github)
3. [Configure environment variables](#3-configure-environment-variables)
4. [Deploy with Docker Compose (recommended)](#4-deploy-with-docker-compose-recommended)
5. [Deploy without Docker (bare Linux + PM2)](#5-deploy-without-docker-bare-linux--pm2)
6. [DNS, HTTPS &amp; reverse-proxy (Caddy)](#6-dns-https--reverse-proxy-caddy)
7. [Configure third-party integrations](#7-configure-third-party-integrations)
8. [n8n workflows (WhatsApp / Facebook / Google)](#8-n8n-workflows)
9. [Backups & operations](#9-backups--operations)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

| Tool | Minimum |
|---|---|
| Linux server (Ubuntu 22.04+ recommended) | 2 vCPU / 4 GB RAM / 40 GB SSD |
| Docker | 24+ |
| Docker Compose plugin | v2.20+ |
| A registered domain (e.g. `asoftechinsightz.com`) | for HTTPS |
| Razorpay account (test or live) | for payments |
| Emergent project (`app.emergent.sh`) | for auth + LLM |

Install Docker on Ubuntu in one command:
```bash
curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker $USER
```

---

## 2. Get the code onto GitHub

The project ships as a tarball: **`/app/asoftech-insightz.tar.gz`** (also downloadable from your Emergent workspace).

```bash
# 1) On your local machine, extract the tarball
tar -xzf asoftech-insightz.tar.gz
cd asoftech-insightz

# 2) Create a new EMPTY repo on GitHub:
#    https://github.com/new  — e.g. "asoftech-insightz" (private recommended)

# 3) Initialise & push
git init -b main
git add .
git commit -m "chore: initial commit — AsoftechInsightz MVP"
git remote add origin git@github.com:<your-handle>/asoftech-insightz.git
#    (or HTTPS:  https://github.com/<your-handle>/asoftech-insightz.git)
git push -u origin main
```

If SSH isn't set up:
```bash
ssh-keygen -t ed25519 -C "you@asoftechinsightz.com"
cat ~/.ssh/id_ed25519.pub        # paste into GitHub → Settings → SSH keys
```

---

## 3. Configure environment variables

Copy `.env.example` to `.env` on the server and fill in:

```env
# MongoDB (managed by docker-compose)
MONGO_URL=mongodb://mongo:27017
DB_NAME=asoftech_saas

# Public URLs
NEXT_PUBLIC_BASE_URL=https://app.asoftechinsightz.com
NEXT_PUBLIC_APP_URL=https://app.asoftechinsightz.com
CORS_ORIGINS=https://app.asoftechinsightz.com,https://asoftechinsightz.com

# Emergent LLM (already provided in the bundle—rotate before going to prod)
EMERGENT_LLM_KEY=sk-emergent-xxxxxxxxxxxxxxxx

# Emergent Auth  (Settings → API & Auth on app.emergent.sh)
# Whitelist redirect: https://app.asoftechinsightz.com/api/auth/callback
EMERGENT_PROJECT_ID=proj_xxxxxxxxxxxx
EMERGENT_API_KEY=secret_xxxxxxxxxxxxxxxx

# Razorpay (dashboard.razorpay.com → Account & Settings → API Keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=a-strong-random-string

# n8n inbound webhook auth (same value in your n8n env)
N8N_WEBHOOK_TOKEN=a-very-long-random-string
```

Generate strong secrets:
```bash
openssl rand -hex 32
```

---

## 4. Deploy with Docker Compose (recommended)

```bash
cd asoftech-insightz
docker compose pull
docker compose up -d --build

# Tail logs
docker compose logs -f app
```

Services started:
| Container | Port | URL |
|---|---|---|
| `asoftech-app` (Next.js) | 3000 | http://server:3000 |
| `asoftech-mongo` | 27017 (internal) | — |
| `asoftech-n8n` | 5678 | http://server:5678 |

Visit `http://your-server-ip:3000` — you should see the landing page. The first request to `/leadedge360` auto-seeds 8 demo leads + 9 RetailEdge SKUs.

---

## 5. Deploy without Docker (bare Linux + PM2)

```bash
# Install Node.js 20 and MongoDB 7
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" \
  | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update && sudo apt-get install -y mongodb-org
sudo systemctl enable --now mongod

# Build & run the app
cd asoftech-insightz
yarn install --frozen-lockfile
yarn build
npm i -g pm2
pm2 start "yarn start" --name asoftech-app
pm2 save && pm2 startup
```

---

## 6. DNS, HTTPS &amp; reverse-proxy (Nginx)

Point these A-records to your server IP (see `docs/DOMAIN_ARCHITECTURE.md`):

| Domain | Purpose |
|--------|---------|
| `asoftechinsightz.com` | Marketing website |
| `www.asoftechinsightz.com` | → redirects to apex |
| `app.asoftechinsightz.com` | Business Suite |
| `api.asoftechinsightz.com` | Suite REST API |
| `app.observability360.asoftechinsightz.com` | Observability360 UI |
| `api-observability360.asoftechinsightz.com` | Observability360 API |

Copy `docs/nginx.conf` to `/etc/nginx/sites-available/asoftech`, then:

```bash
sudo bash scripts/ops/fix-ssl-cert.sh
sudo nginx -t && sudo systemctl reload nginx
```

Production `.env`:

```bash
NEXT_PUBLIC_SITE_URL=https://asoftechinsightz.com
NEXT_PUBLIC_APP_URL=https://app.asoftechinsightz.com
NEXT_PUBLIC_BASE_URL=https://app.asoftechinsightz.com
NEXT_PUBLIC_API_URL=https://api.asoftechinsightz.com
CORS_ORIGINS=https://asoftechinsightz.com,https://app.asoftechinsightz.com,https://api.asoftechinsightz.com
```

---

## 7. Configure third-party integrations

### Emergent Auth
1. `https://app.emergent.sh` → your project → **Settings → API & Auth**
2. Whitelist redirect URI: `https://app.asoftechinsightz.com/api/auth/callback`
3. Copy `Project ID` → `EMERGENT_PROJECT_ID`, `API Key` → `EMERGENT_API_KEY`
4. Restart: `docker compose restart app`

### Razorpay
1. `dashboard.razorpay.com` → **Account & Settings → API Keys** → Generate test key (or live after KYC)
2. **Webhooks** → Add: URL = `https://app.asoftechinsightz.com/api/webhooks/razorpay`, events = `order.paid`, `payment.captured`
3. Put the matching webhook secret in `.env` as `RAZORPAY_WEBHOOK_SECRET`
4. Restart the app

### WhatsApp Cloud API (via n8n)
1. `developers.facebook.com` → create an app of type **Business**
2. Add **WhatsApp** product → generate a permanent access token & note the **Phone Number ID**
3. In n8n, add credentials “WhatsApp Cloud API” with that token
4. Import `n8n/whatsapp-lead-ingest.json` (inbound) and `n8n/whatsapp-followup-automation.json` (outbound)
5. Set Meta webhook URL to `https://flows.asoftechinsightz.com/webhook/whatsapp-incoming`

### Facebook Lead Ads
1. Connect your Facebook page in n8n (`Facebook Graph API` credential, lead-retrieval permission)
2. Import `n8n/facebook-lead-ingest.json`
3. Activate the workflow — new leads will POST to `/api/webhooks/facebook`

### Google Ads Lead Form
1. In Google Ads, edit your Lead Form extension → set webhook URL = `https://flows.asoftechinsightz.com/webhook/google-leads`
2. Import `n8n/google-lead-ingest.json`

---

## 8. n8n workflows

All four ready-to-import JSONs ship in `/n8n`:
- `whatsapp-lead-ingest.json`        — Meta WhatsApp → LeadEdge360
- `facebook-lead-ingest.json`         — FB Lead Ads → LeadEdge360
- `google-lead-ingest.json`           — Google Lead Form → LeadEdge360
- `whatsapp-followup-automation.json` — Stale-lead nurture every 6 h

In n8n add these env vars (Settings → Environment Variables):
```
ASOFTECH_API=https://app.asoftechinsightz.com
ASOFTECH_ORG_ID=<your org id from Mongo `orgs` collection>
N8N_WEBHOOK_TOKEN=<must match server .env>
WA_PHONE_NUMBER_ID=<from Meta>
```

---

## 9. Backups & operations

Daily Mongo dump:
```bash
docker exec asoftech-mongo mongodump --archive=/data/db/backup-$(date +%F).gz --gzip
# Then rsync /var/lib/docker/volumes/.../backup-*.gz to S3/Glacier/Backblaze
```

Health check: `https://app.asoftechinsightz.com/api/` returns `{ ok: true }`.

Reset demo data: `curl -X POST https://app.asoftechinsightz.com/api/seed-reset`

---

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Auth not yet configured` banner on /signin | EMERGENT_PROJECT_ID / EMERGENT_API_KEY missing | Add to .env, restart app |
| Razorpay button says “Payments not yet configured” | NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing | Add, restart |
| n8n webhook returns 401 | Token mismatch | Ensure `X-Webhook-Token` header matches server `N8N_WEBHOOK_TOKEN` |
| 502 from /api/auth/callback | Wrong redirect URI whitelisted | Whitelist exactly `${NEXT_PUBLIC_APP_URL}/api/auth/callback` |
| LLM scoring uses `engine: rules-fallback` | EMERGENT_LLM_KEY missing or quota | Re-add key |

---

Maintained by AsoftechInsightz · enquiry@asoftechinsightz.com · +91-7307911405
