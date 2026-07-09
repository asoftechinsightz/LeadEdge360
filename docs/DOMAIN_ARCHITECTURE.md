# Domain architecture — AsoftechInsightz platform

**Last updated:** July 2026

## Canonical domain map

| Domain | Surface | Stack | Notes |
|--------|---------|-------|-------|
| **asoftechinsightz.com** | Marketing website | Next.js `:3000` | Public site, legal pages, product landings, lead capture |
| **www.asoftechinsightz.com** | Redirect | nginx | 301 → `asoftechinsightz.com` |
| **app.asoftechinsightz.com** | Business Suite | Next.js `:3000` | LeadEdge360, RetailEdge360, CRM, billing, auth |
| **api.asoftechinsightz.com** | Business Suite API | Next.js `/api/*` | Mobile app, integrations, webhooks |
| **app.observability360.asoftechinsightz.com** | Observability360 UI | Trinetra360 `:4000` | Separate product (early access) |
| **api-observability360.asoftechinsightz.com** | Observability360 API | Gateway `:4000` | OTLP, metrics, logs, traces |

## Environment variables (production)

```bash
# Marketing canonical URL (SEO, sitemap, OG tags)
NEXT_PUBLIC_SITE_URL=https://asoftechinsightz.com

# Business Suite UI (auth redirects, QR links, emails)
NEXT_PUBLIC_APP_URL=https://app.asoftechinsightz.com
NEXT_PUBLIC_BASE_URL=https://app.asoftechinsightz.com

# API base for mobile / external clients
NEXT_PUBLIC_API_URL=https://api.asoftechinsightz.com

# Observability360 (when deployed)
NEXT_PUBLIC_OBSERVABILITY_APP_URL=https://app.observability360.asoftechinsightz.com
NEXT_PUBLIC_OBSERVABILITY_API_URL=https://api-observability360.asoftechinsightz.com

# CORS
CORS_ORIGINS=https://asoftechinsightz.com,https://www.asoftechinsightz.com,https://app.asoftechinsightz.com,https://api.asoftechinsightz.com
```

## Request routing

```
Visitor → asoftechinsightz.com/products     → Marketing (stays)
Visitor → asoftechinsightz.com/leadedge360  → 301 → app.asoftechinsightz.com/leadedge360
Visitor → asoftechinsightz.com/signin       → 301 → app.asoftechinsightz.com/signin
Visitor → app.asoftechinsightz.com/         → 301 → app.asoftechinsightz.com/dashboard
Visitor → app.asoftechinsightz.com/privacy  → 301 → asoftechinsightz.com/privacy
Mobile  → api.asoftechinsightz.com/leads     → Next.js /api/leads
```

Implemented in:
- `lib/domains.js` — constants and path helpers
- `middleware.js` — host-based redirects
- `docs/nginx.conf` — TLS termination and upstream proxy

## DNS (all A-records → VPS IP)

```
asoftechinsightz.com
www.asoftechinsightz.com
app.asoftechinsightz.com
api.asoftechinsightz.com
app.observability360.asoftechinsightz.com
api-observability360.asoftechinsightz.com
```

## SSL certificates (Let's Encrypt)

Three certificate groups:

1. `asoftechinsightz.com` — apex + www
2. `app.asoftechinsightz.com` — app + api
3. `observability360.asoftechinsightz.com` — observability app + api

```bash
sudo bash scripts/ops/fix-ssl-cert.sh
```

## Marketing vs suite in code

| Concern | Marketing (`asoftechinsightz.com`) | Suite (`app.asoftechinsightz.com`) |
|---------|-------------------------------------|-------------------------------------|
| Theme | GIX marketing / glass | Suite dark theme |
| Shell | `SiteShell` + Navbar + Footer | `AppShell` sidebar |
| Auth | Redirect to app subdomain | `/signin`, `/signup` |
| API | `/api/marketing/*` on same host | Full `/api/*` |

## Related files

- `docs/nginx.conf` — production nginx vhost
- `lib/marketing-routes.js` — marketing path list
- `docs/SOURCE_OF_TRUTH.md` — platform source of truth
- `src/design-tokens/tokens.json` — product subdomain tokens
