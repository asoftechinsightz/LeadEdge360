# Frontend V2 — Production Deployment Plan

> Companion to `docs/POST_DEPLOY_CHECKLIST.md` and `docs/nginx.conf`

---

## 1. Prerequisites

| Requirement | Notes |
|-------------|-------|
| Node.js 18+ | Build machine |
| MongoDB | Atlas or self-hosted — app uses `MONGODB_URI` |
| Environment file | `.env.local` / `.env` — **never commit** |
| Reverse proxy | nginx (`docs/nginx.conf`) or Caddy |
| TLS certificate | Let's Encrypt via certbot |

---

## 2. Environment variables (frontend-relevant)

```bash
# API base — same origin in production
NEXT_PUBLIC_API_BASE_URL=https://app.asoftechinsightz.com/api

# Razorpay (subscribe flow)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# CORS (optional — tighten in production)
CORS_ORIGINS=https://app.asoftechinsightz.com

# Mongo + auth (backend — required for build/runtime)
MONGODB_URI=mongodb://...
JWT_SECRET=...
```

---

## 3. Build & run (standalone)

```bash
npm ci
npm run build
npm run start   # or: node .next/standalone/server.js
```

`next.config.js` sets `output: 'standalone'` for Docker/VPS deployment.

**Docker (if using repo compose):**

```bash
docker compose up -d --build
```

---

## 4. nginx / subdomain map

| Host | Purpose |
|------|---------|
| `asoftechinsightz.com` | Marketing (same Next app) |
| `app.asoftechinsightz.com` | Business Suite + APIs |
| `leadedge360.asoftechinsightz.com` | Redirect → `/leadedge360` |
| `retailedge360.asoftechinsightz.com` | Redirect → `/retailedge360` |
| `flows.asoftechinsightz.com` | n8n (basic auth) |

Example redirect block (add inside `server` for product subdomains):

```nginx
server {
    listen 443 ssl http2;
    server_name leadedge360.asoftechinsightz.com;
    return 301 https://app.asoftechinsightz.com/leadedge360$request_uri;
}
```

Repeat for `retailedge360`.

---

## 5. V2 routes to verify post-deploy

### Marketing
`/ ` · `/about` · `/products` · `/solutions` · `/industries` · `/contact` · `/blog` · `/privacy` · `/terms` · `/growth-audit`

### Auth & onboarding
`/signin` · `/splash` · `/product-selection` · `/onboarding`

### Business Suite (AppShell)
`/dashboard` · `/leadedge360` · `/leadedge360/leads` · `/leadedge360/opportunities` · `/retailedge360` · `/proposals` · `/campaigns` · `/revenue` · `/payments` · `/invoices`

### Billing
`/subscribe` · `/pricing`

---

## 6. API smoke (production)

```bash
curl -s https://app.asoftechinsightz.com/api/ | head
curl -s https://app.asoftechinsightz.com/api/agents
curl -s -H "Authorization: Bearer $TOKEN" https://app.asoftechinsightz.com/api/leads
curl -s -H "Authorization: Bearer $TOKEN" https://app.asoftechinsightz.com/api/dashboard/kpis
```

---

## 7. Rollback strategy

1. Keep previous Docker image / `.next` tarball tagged by git SHA
2. `docker compose pull && docker compose up -d` previous tag
3. MongoDB is forward-compatible — no schema migrations in V2

---

## 8. Monitoring

- UptimeRobot on `https://app.asoftechinsightz.com/api/`
- Sentry (optional) for client errors
- nginx access logs for 4xx/5xx spikes on `/api/auth/*`

---

## 9. Security checklist

- [ ] `.env` permissions `chmod 600`
- [ ] `CORS_ORIGINS` set to production domain (not `*`)
- [ ] Default admin password rotated
- [ ] Razorpay live keys only on production
- [ ] nginx HSTS enabled (`docs/nginx.conf`)
- [ ] No secrets in git history

See `docs/POST_DEPLOY_CHECKLIST.md` for full operator runbook.
