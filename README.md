# AsoftechInsightz — LeadEdge360 MVP

> **Enterprise RC1 (2026-06-22):** Validation docs in [`docs/RELEASE_CERTIFICATION.md`](docs/RELEASE_CERTIFICATION.md) — **Conditional GO** for pilot; **NO GO** for GA until P1 items closed. Run `node scripts/rc1-validation.mjs`.

A Made-in-India AI SaaS suite. This repository contains the marketing website **and** the LeadEdge360 CRM dashboard with AI Lead Scoring, Territory Routing, WhatsApp Automation, RBAC and analytics.

## 1. Tech Stack

| Layer | Implementation (this repo) | Production-Recommended |
|---|---|---|
| Frontend | Next.js 14 (App Router), Tailwind, shadcn/ui, framer-motion, Recharts | Same |
| Backend  | Next.js Route Handlers (`/app/api/[[...path]]/route.js`) | Same (or split into Node.js + Express) |
| Database | MongoDB (current) | **PostgreSQL** (recommended; schema is trivially portable, see §6) |
| AI scoring | Emergent LLM proxy (OpenAI-compatible, `gpt-4o-mini`) | Same, or self-hosted Llama/Mistral via Ollama |
| Workflows | (Optional) n8n for WhatsApp / Email / Webhooks | n8n in Docker, talks to `/api` |
| Charts | Recharts | Same |
| Container | Dockerfile + docker-compose included below | Kubernetes-ready (uses `output: 'standalone'`) |

## 2. Project Structure

```
/app
├─ app/
│  ├─ page.js                 # Home (hero animation, products, features, CTA)
│  ├─ about/page.js
│  ├─ products/page.js
│  ├─ leadedge360/page.js     # 🔥 CRM dashboard (KPIs, charts, lead capture, AI score)
│  ├─ retailedge360/page.js   # Coming-soon page
│  ├─ pricing/page.js
│  ├─ contact/page.js
│  ├─ blog/page.js
│  ├─ layout.js               # Root layout, fonts, toaster
│  └─ api/[[...path]]/route.js  # All backend endpoints
├─ components/
│  ├─ site/                   # Navbar, Footer, SiteShell
│  │  ├─ ParticleNetwork.jsx   # Hero canvas particle animation
│  │  ├─ WireSphere.jsx        # Rotating 3D wireframe globe
│  │  ├─ CountUp.jsx           # Animated number counter
│  │  └─ Reveal.jsx            # framer-motion fade-up
│  └─ ui/                     # shadcn/ui primitives
├─ lib/
│  ├─ mongo.js                # MongoDB singleton
│  └─ scoring.js              # AI Lead Scoring (LLM + heuristic fallback)
└─ .env
```

## 3. Environment Variables

`.env` (do **not** commit):

```env
MONGO_URL=mongodb://mongo:27017
DB_NAME=asoftech_saas
NEXT_PUBLIC_BASE_URL=https://app.asoftechinsightz.com
CORS_ORIGINS=*
EMERGENT_LLM_KEY=sk-emergent-xxxxxxxxxxxxxxxxxxxxxxxx
```

## 4. Local Development

```bash
yarn install
yarn dev          # http://localhost:3000
```

The first GET to `/api/leads` auto-seeds 8 demo leads (each AI-scored on the fly).

## 5. API Reference

All endpoints are prefixed with `/api`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Health check |
| GET | `/agents` | Static agent directory (7 demo agents) |
| GET | `/leads?territory=&status=&role=&agent=` | List leads (filtered) |
| POST | `/leads` | Create lead → auto-scores via AI → auto-assigns by territory |
| PATCH | `/leads/:id` | Update status (`New\|Contacted\|Qualified\|Proposal\|Won\|Lost`) or `assignedTo` |
| POST | `/leads/:id/rescore` | Re-run AI scoring |
| DELETE | `/leads/:id` | Remove lead |
| GET | `/kpis?role=&agent=` | Dashboard analytics (totals, conversion, byTerritory, bySource, byAgent, byStatus, 14-day trend) |
| POST | `/contact` | Marketing contact form |
| POST | `/seed-reset` | DEV utility — wipe & reseed |

### Sample: create a lead (auto-scored)

```bash
curl -X POST $BASE/api/leads -H 'Content-Type: application/json' -d '{
  "name":"Rahul Verma","phone":"+919812345671",
  "email":"rahul@acme.in","company":"Acme Pharma",
  "message":"Urgent! Need a demo, budget approved.",
  "budget":250000,"whatsapp":true,
  "source":"whatsapp","territory":"Bengaluru"
}'
```

Response (HTTP 201):
```json
{
  "lead": {
    "id": "a8b1…",
    "score": 95, "label": "Hot",
    "reasons": ["strong buy intent keywords", "budget > 2L", "WhatsApp opt-in"],
    "engine": "llm",
    "assignedTo": "Priya Iyer", "status": "New", ...
  }
}
```

## 6. Migrating to PostgreSQL (optional, production)

The data model is intentionally flat. Use this DDL:

```sql
CREATE TABLE agents (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  territory   TEXT NOT NULL
);

CREATE TABLE leads (
  id              UUID PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT,
  phone           TEXT NOT NULL,
  company         TEXT,
  message         TEXT,
  source          TEXT NOT NULL,
  territory       TEXT NOT NULL,
  budget          NUMERIC DEFAULT 0,
  whatsapp        BOOLEAN DEFAULT FALSE,
  score           INT,
  label           TEXT,
  reasons         JSONB,
  engine          TEXT,
  status          TEXT NOT NULL DEFAULT 'New',
  assigned_to     TEXT,
  assigned_agent_id TEXT REFERENCES agents(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX leads_by_territory ON leads(territory);
CREATE INDEX leads_by_status    ON leads(status);
CREATE INDEX leads_by_assigned  ON leads(assigned_to);

CREATE TABLE contact_requests (
  id        UUID PRIMARY KEY,
  name      TEXT, email TEXT, company TEXT, message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Swap `lib/mongo.js` with a `pg` Pool, replace the 4 `db.collection(...)` calls in `route.js` with equivalent SQL. Estimated effort: ~45 minutes.

## 7. n8n Automation (WhatsApp + Lead routing)

Run n8n alongside the app via docker-compose (see §8). Suggested workflows:

1. **WhatsApp follow-up**
   - Trigger: Webhook `POST /webhook/whatsapp-follow` (called by app when a lead status becomes `Qualified`).
   - Action: WhatsApp Cloud API node → send template message — personalised with `{{name}}`, `{{assignedTo}}`.
2. **Facebook Lead Ads ingest**
   - Trigger: Facebook Lead Ads node.
   - Action: HTTP `POST $BASE/api/leads` with `source: "facebook"`.
3. **Google Lead Form ingest**
   - Trigger: Webhook from Google.
   - Action: HTTP `POST $BASE/api/leads` with `source: "google"`.
4. **Stale-lead nurture** — cron every 24h → query `/api/leads?status=New` → send WhatsApp + email if `createdAt > 48h`.

## 8. Docker Deployment

### `Dockerfile` (already supports `output: 'standalone'`)

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### `docker-compose.yml`

```yaml
version: "3.9"
services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [mongo]
    restart: always

  mongo:
    image: mongo:7
    volumes: [mongo-data:/data/db]
    restart: always

  # Optional: Postgres if you migrated per §6
  # postgres:
  #   image: postgres:16
  #   environment:
  #     POSTGRES_DB: asoftech_saas
  #     POSTGRES_USER: asoftech
  #     POSTGRES_PASSWORD: changeme
  #   volumes: [pg-data:/var/lib/postgresql/data]

  n8n:
    image: n8nio/n8n:latest
    ports: ["5678:5678"]
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=changeme
      - WEBHOOK_URL=https://flows.asoftechinsightz.com
    volumes: [n8n-data:/home/node/.n8n]
    restart: always

volumes:
  mongo-data: {}
  # pg-data: {}
  n8n-data: {}
```

Bring it up:
```bash
docker compose up -d --build
# App  → http://localhost:3000
# n8n  → http://localhost:5678
```

## 9. Production Checklist

- [ ] Set strong `EMERGENT_LLM_KEY`, rotate quarterly
- [ ] Configure HTTPS / TLS termination (Caddy / Cloudflare / nginx)
- [ ] Add authentication — the MVP has a role switcher; swap with Clerk / NextAuth / Emergent Auth for prod
- [ ] Mongo replica set or managed Postgres (RDS/Neon/Supabase)
- [ ] Daily backups
- [ ] Configure WhatsApp Cloud API in n8n (Meta Business)
- [ ] Connect Facebook & Google Lead Ads via n8n
- [ ] Monitoring — Sentry (errors), Plausible / GA4 (web)

## 10. Roadmap

- [ ] Multi-tenant org separation (per-org Mongo namespace / Postgres `org_id` column)
- [ ] Real RBAC with NextAuth + Postgres `roles` table
- [ ] Email + SMS providers (SendGrid / MSG91)
- [ ] RetailEdge360 module — expiry / shelf-life AI
- [ ] Native AI Copilot chat across both products (LLM + tool calling)
- [ ] Mobile app for field agents (Expo / React Native)

---

© AsoftechInsightz Pvt. Ltd. · enquiry@asoftechinsightz.com · +91-7307911405 · Noida, India
