# AsoftechInsightz — Autonomous AI Marketing Engine

**Chief AI Engineer architecture** · Integrated with **LeadEdge360** (production)  
**Status:** Phase 1–2 foundation implemented · Phases 3–10 roadmap defined  
**Org:** `asoftechinsightz` · **Products:** LeadEdge360, RetailEdge360

---

## Executive summary

This document defines a **fully autonomous AI Marketing Engine** that operates as a virtual marketing department: content planning, social publishing, lead ingestion, scoring, proposals, follow-ups, meetings, CRM automation, analytics, and CEO briefings.

### Stack alignment (spec vs production)

| Spec (your brief) | Production (LeadEdge360 VPS) | Notes |
|-------------------|------------------------------|-------|
| NestJS | **Next.js 14 App Router** | API routes under `app/api/` |
| PostgreSQL | **MongoDB 7** | Tenant-scoped collections with `orgId` |
| Redis | **Mongo job queue** (Phase 1) | Redis optional for Phase 2 scale |
| N8N | **n8n 1.110** (Docker) | Social + channel integrations |
| OpenAI | **Emergent LLM proxy** (`EMERGENT_LLM_KEY`) | Template fallback when unset |

PostgreSQL/Redis can be added as analytics/queue tiers without replacing MongoDB as CRM SSOT.

---

## 1. System architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ADMIN UI (/marketing-engine)                     │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│  API Layer (Next.js)                                                     │
│  /api/marketing-engine/*  ·  /api/agents/*  ·  /api/campaigns/*         │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ Marketing     │         │ Event Platform   │         │ Core AI         │
│ Engine        │────────▶│ platform_events  │────────▶│ 12 Agents       │
│ lib/marketing │         │ agent_tasks      │         │ worker/scheduled│
└───────┬───────┘         └────────┬─────────┘         └─────────────────┘
        │                          │
        ▼                          ▼
┌───────────────┐         ┌─────────────────┐
│ MongoDB       │         │ n8n Webhooks     │
│ marketing_*   │         │ Social APIs      │
│ leads, CRM    │         │ WhatsApp, Email  │
└───────────────┘         └─────────────────┘
```

**Autonomy loop:** Cron → `POST /api/agents/scheduled/run` → marketing publisher/planner → events → n8n → channels → leads → scoring → proposals → follow-ups → CRM.

---

## 2. Database schema (MongoDB)

All collections are **org-scoped** (`orgId`).

### Phase 1 — Content & publishing

| Collection | Purpose | Key fields |
|------------|---------|------------|
| `marketing_content` | Planned posts, blogs, assets text | `type`, `platform`, `body`, `contentHash`, `status`, `weekId` |
| `marketing_calendar` | Schedule slots | `contentId`, `scheduledAt`, `slot`, `platform`, `status` |
| `marketing_assets` | Graphic designer briefs | `brief`, `spec` (1080² / 1920×1080 PNG) |
| `marketing_video_briefs` | Video scripts 30/60/90s | `script`, `durationSec` |
| `marketing_publish_queue` | Dispatch log | `platform`, `hashtags`, `eventId` |
| `marketing_publish_log` | Dedup hashes | `bodyHash` (unique per org) |
| `marketing_engine_config` | Org toggles | `autopilot`, `platforms`, `publishSlots` |
| `marketing_engine_jobs` | Planner run audit | `agentId`, `stats`, `weekId` |

### Phase 2–7 — CRM integration (existing)

| Collection | Role |
|------------|------|
| `leads` | SSOT for all ingested leads |
| `opportunities`, `proposals`, `invoices` | Revenue pipeline |
| `follow_ups` | Cadence + meetings |
| `marketing_followup_state` | Per-lead cadence step |

**Indexes:** `npm run marketing-engine:indexes`

---

## 3. API design

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/marketing-engine/planner/run` | Agent 1 — weekly content batch |
| POST | `/api/marketing-engine/publisher/run` | Agent 4 — publish due posts |
| POST | `/api/marketing-engine/worker/run` | Full worker (`job`: planner/publisher/followup/all) |
| GET | `/api/marketing-engine/content` | List content |
| GET | `/api/marketing-engine/calendar` | Marketing calendar |
| GET | `/api/marketing-engine/analytics` | Dashboard metrics |
| GET/PATCH | `/api/marketing-engine/config` | Org configuration |
| POST | `/api/marketing-engine/leads/ingest` | Phase 2 lead normalization |
| GET | `/api/marketing-engine/agents` | Marketing agent registry |
| POST | `/api/agents/scheduled/run` | Cron (includes marketing jobs) |

**Auth:** JWT via `guardCrmRequest` / `guardPlatformRequest`. Cron: `Authorization: Bearer $AGENT_CRON_SECRET`.

---

## 4. Queue design

### Phase 1 (implemented)

- **Mongo-backed** job records in `marketing_engine_jobs`
- **Calendar-driven** publish queue (`marketing_calendar` where `scheduledAt <= now`)
- **Event bus** for async side effects (`platform_events` → processors → `agent_tasks`)

### Phase 2 (recommended)

- **Redis + BullMQ** for high-volume lead ingest (30-min poll)
- Dead-letter: existing `dead_letter_events`

---

## 5. AI agent architecture

### Marketing Engine agents (`lib/marketing-engine/agents.js`)

| Agent | Phase | Schedule |
|-------|-------|----------|
| marketing-planner-ai | 1 | Sunday |
| graphic-designer-ai | 1 | After planner |
| video-creator-ai | 1 | After planner |
| social-publisher-ai | 1 | Hourly |
| lead-ingest-ai | 2 | 30 min |
| lead-scoring-ai | 3 | On `lead.created` (delegates to lead-qualification-ai) |
| proposal-automation-ai | 4 | Score > 80 |
| followup-engine-ai | 5 | Daily |
| meeting-scheduler-ai-ext | 6 | Intent detection |
| crm-automation-ai | 7 | Event-driven |
| marketing-analyst-ai | 8 | Hourly |
| ceo-assistant-ai | 9 | 8 AM IST |
| autonomous-sales-ai | 10 | Always-on |

### Core 12 agents (existing)

`marketing-ai`, `lead-qualification-ai`, `proposal-ai`, `sales-ai`, `ceo-ai` — integrated via event subscriptions.

**Anti-hallucination rule:** LLM calls use template fallback; prompts forbid invented testimonials/metrics.

---

## 6. Folder structure

```
lib/marketing-engine/
  constants.js          # Quotas, platforms, brand
  llm.js                # Emergent OpenAI helper
  content-planner.js    # Agent 1
  graphic-brief.js        # Agent 2
  video-brief.js          # Agent 3
  publisher.js            # Agent 4
  lead-ingest.js          # Phase 2
  follow-up-engine.js     # Phase 5
  analytics.js            # Phase 8
  config.js               # Org settings
  worker.js               # Orchestrator
  agents.js               # Agent registry

app/api/marketing-engine/ # REST APIs
app/marketing-engine/     # Admin UI
n8n/workflows/            # Importable workflows
scripts/marketing-engine-*.mjs
docs/platform/AI_MARKETING_ENGINE.md
```

---

## 7. N8N workflows

1. Import `n8n/workflows/marketing-social-publish.json`
2. Connect platform nodes (LinkedIn, Meta, Instagram, X, YouTube, GBP)
3. Set `.env`:

```bash
N8N_ENABLED=true
N8N_WEBHOOK_URL=http://n8n:5678/webhook/marketing-social-publish
N8N_WEBHOOK_SECRET=your-secret
```

4. Enable events in `org_webhook_config` (or use updated defaults including `marketing.content.publish`)

**Inbound lead webhooks (existing):** `/api/webhooks/facebook`, `/google`, `/whatsapp`

---

## 8. Docker deployment

```bash
cd /opt/asoftech-insightz
source .env

npm run marketing-engine:indexes
docker compose build app --no-cache
docker compose up -d app n8n

# Cron (crontab)
0 * * * * curl -s -X POST http://127.0.0.1:3000/api/agents/scheduled/run -H "Authorization: Bearer $AGENT_CRON_SECRET" -d '{"orgId":"asoftechinsightz"}'
```

**Optional Redis** (Phase 2 scale): add `redis:7` service to `docker-compose.yml` for BullMQ.

---

## 9. CI/CD

| Step | Command |
|------|---------|
| Lint/build | `npm run build` |
| Agent retest | `npm run db:agent-runtime-retest` |
| Marketing retest | `npm run marketing-engine:retest` |
| Indexes | `npm run marketing-engine:indexes` |

GitHub Actions: extend existing certification workflow with `marketing-engine:retest`.

---

## 10. Monitoring & observability

| Signal | Source |
|--------|--------|
| Workflow runs | `marketing_engine_jobs`, `agent_tasks` |
| API health | `/api/health/ready` |
| Event failures | `/ops/events`, `dead_letter_events` |
| n8n delivery | `webhook_deliveries` |
| AI cost | `agent_token_usage` |
| Publish dedup | `marketing_publish_log` |

---

## 11. Security

- **RBAC:** `guardCrmRequest` / `guardPlatformRequest`
- **Audit:** `platform_events`, `audit_logs`, `campaign_activities`
- **API auth:** JWT + cron secret
- **Rate limiting:** Cloudflare + existing production guards
- **DPDP:** `consent_log`, marketing opt-in on forms
- **Encryption:** TLS (NGINX/Cloudflare), Mongo auth

---

## 12. Admin UI

**Route:** `/marketing-engine`

Features:
- Run Weekly Planner / Publish Due Posts
- KPI cards (leads, hot leads, content, revenue)
- Agent list + upcoming calendar

**Planned:** Approval queue, workflow builder, AI cost dashboard (Phases 8–10).

---

## 13. Implementation roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| **1** | Social autopilot (planner, graphics, video briefs, publisher) | **Implemented** |
| **2** | Lead ingest API + webhooks | **Implemented** (API); n8n connectors per channel |
| **3** | BANT scoring | **Exists** via `lead-qualification-ai` + `aiScore` |
| **4** | Auto-proposal score>80 | Roadmap — wire `proposal-ai` on `lead.qualified` |
| **5** | Follow-up cadence 1/3/7/15/30 | **Implemented** |
| **6** | Google Calendar/Meet | Roadmap — n8n + `meeting-scheduler-ai` |
| **7** | CRM automation | **Partial** — events + existing agents |
| **8** | Analytics dashboard | **Implemented** (API + UI KPIs) |
| **9** | CEO 8 AM briefing | Roadmap — `ceo-ai` + scheduled job |
| **10** | Autonomous sales agent | Roadmap — WhatsApp + LLM guardrails |

---

## 14. VPS quick start (asoftechinsightz)

```bash
cd /opt/asoftech-insightz
source .env

export CERT_ADMIN_EMAIL=admin@asoftechinsightz.com
export CERT_ADMIN_PASSWORD='Asoftech@2026'

npm run marketing-engine:indexes
docker compose build app --no-cache && docker compose up -d app

npm run marketing-engine:retest
```

Enable autopilot:

```bash
curl -X PATCH http://127.0.0.1:3000/api/marketing-engine/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true}'
```

---

## 15. Tests

| Script | Purpose |
|--------|---------|
| `npm run marketing-engine:retest` | API integration (planner, ingest, publisher) |
| `npm run db:agent-runtime-retest` | Core 12-agent runtime |
| `scripts/marketing-engine-indexes.mjs` | Index creation |

Unit tests for `contentHash`, lead normalization: embedded in retest + future Jest suite.

---

## Related docs

- [Pilot Validation](./ASOFTECHINSIGHTZ_PILOT_VALIDATION.md)
- [Agent Runtime](./AGENT_RUNTIME.md)
- [Event Platform](./EVENT_PLATFORM.md)
- [Operations Runbook](./OPERATIONS_RUNBOOK.md)
