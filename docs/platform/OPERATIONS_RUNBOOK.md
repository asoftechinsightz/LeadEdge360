# LeadEdge360 — Operations Runbook

**Audience:** Platform engineers, DevOps, on-call  
**Last updated:** June 2026  
**Environment:** Next.js + MongoDB + Razorpay + n8n + Emergent LLM

This runbook enables another engineer to deploy, monitor, troubleshoot, and recover the LeadEdge360 platform without prior tribal knowledge.

---

## 1. System Overview

| Component | Location | Purpose |
|-----------|----------|---------|
| Web app | Next.js (`app/`, `components/`) | UI + API routes |
| Database | MongoDB (`MONGO_URL`, `DB_NAME`) | All tenant data |
| Event bus | `lib/events/bus.js` | Platform events + processors |
| Agent runtime | `lib/agents/` | AI workforce queue + execution |
| Payments | Razorpay + `lib/payments/` | Invoices, webhooks |
| Automation | n8n (`lib/integrations/n8n.js`) | External workflows |
| LLM | Emergent (`EMERGENT_LLM_KEY`) | AI scoring + agents |

**Health endpoints:**

- Liveness: `GET /api/health/live`
- Readiness: `GET /api/health/ready` (includes Mongo ping)
- Platform: `GET /api/platform/health`

---

## 2. Environments

| Env | `NEXT_PUBLIC_APP_ENV` | Mock API | Auth bypass |
|-----|----------------------|----------|-------------|
| Development | `development` | `true` (default) | `DEV_AUTH_BYPASS=true` |
| Demo | `demo` | `true` | Allowed |
| UAT/Staging | `uat` | `false` | `DEV_AUTH_BYPASS=false` |
| Production | `production` | `false` | **Must be false** |

Copy `.env.example` → `.env` and configure per environment. Never commit `.env`.

**Production minimum:**

```env
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_USE_MOCK_API=false
REQUIRE_AUTH=true
DEV_AUTH_BYPASS=false
JWT_SECRET=<strong-random-secret>
MONGO_URL=<atlas-or-secured-uri>
RAZORPAY_KEY_SECRET=<live>
RAZORPAY_WEBHOOK_SECRET=<live>
N8N_WEBHOOK_TOKEN=<long-random>
```

---

## 3. Deployment

### 3.1 Pre-deploy Checklist

1. `npm run build` — must succeed
2. `npm run db:indexes` — against target database
3. Verify `.env` for target environment
4. Run certification: `npm run cert:go-live` (against staging first)

### 3.2 Build & Start

```bash
npm ci
npm run build
npm run start
# Default port 3000; use reverse proxy (nginx) for HTTPS
```

### 3.3 VPS Deploy Scripts

Project includes sprint deploy helpers:

```bash
npm run deploy:uat      # UAT environment
npm run deploy:s0       # Sprint 0 production pattern
```

Review `scripts/vps-sprint-deploy.mjs` for server-specific steps.

### 3.4 Post-deploy Verification

```bash
curl -s http://HOST:PORT/api/health/live
curl -s http://HOST:PORT/api/health/ready
```

Login as org admin; verify `/ops/agents` and `/settings` → AI Workforce load.

---

## 4. Rollback

### 4.1 Application Rollback

1. Stop current process (`pm2 stop` / `systemctl stop`)
2. Checkout previous release tag/commit
3. `npm ci && npm run build && npm run start`
4. Verify health endpoints

**Do not** run destructive DB migrations on rollback unless documented.

### 4.2 Database Rollback

- **Atlas:** Restore to point-in-time before bad deploy
- **Self-hosted:** Restore latest `mongodump` archive
- After restore: `npm run db:indexes`

### 4.3 Feature Flags

If a bad agent causes issues, disable per org:

- Settings → AI Workforce → pause agent or set `enabled: false` in `org_ai_settings`
- Or set org monthly budget to `0` to block dispatch

---

## 5. Backup

### 5.1 MongoDB Atlas (Recommended)

- Enable **Cloud Backup** on cluster
- Retention: minimum 7 days (30 days for production)
- Test restore quarterly to staging

### 5.2 Self-hosted

```bash
# Daily cron example
mongodump --uri="$MONGO_URL" --db="$DB_NAME" --gzip \
  --archive=/backups/asoftech-$(date +%Y%m%d).gz
```

Store archives off-server (S3, secondary datacenter).

### 5.3 What to Backup

- Full MongoDB database (all collections)
- `.env` secrets (in secure vault, not git)
- n8n workflow exports (if used)
- SSL certificates

---

## 6. Restore

### 6.1 Database Restore

```bash
# Atlas: use UI "Restore" to new cluster or overwrite (maintenance window)
# mongorestore example:
mongorestore --uri="$MONGO_URL" --gzip \
  --archive=/backups/asoftech-YYYYMMDD.gz --drop
```

### 6.2 Post-restore Steps

1. `npm run db:indexes`
2. `GET /api/health/ready` — confirm `mongo: connected`
3. Run DR recovery (Section 8)
4. Spot-check tenant data isolation with `npm run db:tenant-retest`

**Expected RTO:** 1–4 hours depending on backup size and Atlas tier.

---

## 7. Monitoring

### 7.1 Health Checks

| Endpoint | Expected | Alert if |
|----------|----------|----------|
| `/api/health/live` | `status: live` | Non-200 for 2 min |
| `/api/health/ready` | `mongo: connected` | Non-200 or mongo down |
| `/api/platform/health` | Platform OK | Errors in event processors |

### 7.2 Dashboards (In-App)

| URL | Purpose |
|-----|---------|
| `/ops/agents` | Agent queue, SLA, failures |
| `/ops/ai-analytics` | Token usage, cost, workforce metrics |
| `/ops/ai-ops` | AI Operations command center |

### 7.3 Key Metrics to Watch

- `agent_tasks` count by `status` (queued, failed, awaiting_approval)
- `platform_events` insert rate and processor errors
- API p95 latency (reverse proxy / APM)
- MongoDB connections and slow queries
- Razorpay webhook failure rate
- `webhook_deliveries` with `status: failed`

### 7.4 Log Locations

| Source | Location |
|--------|----------|
| Next.js stdout | pm2 logs / systemd journal / Docker logs |
| MongoDB | Atlas monitoring or `/var/log/mongodb/` |
| nginx | `/var/log/nginx/access.log`, `error.log` |
| n8n | n8n server logs (if self-hosted) |

Search logs for: `agent.task.failed`, `platform_event`, `ECONNREFUSED`, `JWT`, `webhook`.

---

## 8. Disaster Recovery

### 8.1 Recovery API

`POST /api/agents/recovery` (requires org admin JWT)

| Action | Body | Use case |
|--------|------|----------|
| Retry failed tasks | `{ "action": "retry_tasks", "limit": 20 }` | After outage |
| Replay webhooks | `{ "action": "replay_webhooks" }` | n8n missed events |
| Rebuild memory | `{ "action": "rebuild_memory", "sinceDays": 30 }` | Memory corruption |
| Rebuild notifications | `{ "action": "rebuild_notifications" }` | Notification gap |
| Full recovery | `{ "action": "recover_outage" }` | Combined procedure |

### 8.2 Event Replay

`POST /api/platform/events/replay`

Replay `platform_events` to rebuild projections (activities, analytics). Use time-bounded `from` / `to` when possible.

### 8.3 Dead-Letter Queue

Failed event processing: `lib/events/dlq.js`. Inspect `event_dlq` collection; replay after fixing root cause.

### 8.4 Recovery Playbook (Outage)

1. Confirm app + Mongo up (`/health/ready`)
2. `POST /agents/recovery` with `recover_outage`
3. `POST /agents/worker/run` with `{ "limit": 50 }`
4. `POST /agents/scheduled/run`
5. Verify activity feed and notifications for pilot org
6. Document incident in audit / ticket system

---

## 9. Incident Response

### 9.1 Severity Levels

| Level | Example | Response |
|-------|---------|----------|
| SEV-1 | Platform down, data leak suspected | Immediate; all hands |
| SEV-2 | Agent queue stalled, payments failing | < 1 hour |
| SEV-3 | Single agent errors, slow dashboards | < 4 hours |
| SEV-4 | Cosmetic / non-critical | Next business day |

### 9.2 Initial Triage

1. Check `/api/health/ready`
2. Check MongoDB Atlas / server status
3. Check recent deploys
4. Review `agent_tasks` where `status: failed`
5. Review `audit_logs` for anomalies

### 9.3 Tenant Data Leak Suspected

1. **Stop** — disable affected API route if needed
2. Capture JWT sample and query logs
3. Run `npm run db:tenant-retest`
4. Notify security lead; preserve audit logs

---

## 10. AI Troubleshooting

### 10.1 Agent Not Running

1. Settings → AI Workforce: agent enabled?
2. `org_ai_settings`: business hours blocking?
3. Monthly budget exceeded? (`agent_token_usage`)
4. Event emitted? Check `platform_events` for trigger type
5. Manually drain queue: `POST /api/agents/worker/run`

### 10.2 Task Stuck in `awaiting_approval`

1. Ops → Agents → find task
2. Approve/reject via approval UI or API
3. Check `org_approval_rules` for org overrides

### 10.3 Task Failed

1. Read `agent_tasks.error` field
2. Check Emergent LLM key and rate limits
3. Retry: `POST /api/agents/recovery` `{ "action": "retry_tasks" }`

### 10.4 Wrong Agent Output

1. Review `agent_memory` for stale context
2. Rebuild memory from events (recovery API)
3. Adjust industry profile or org AI settings

---

## 11. Queue Management

### 11.1 Agent Worker

```http
POST /api/agents/worker/run
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{ "limit": 10 }
```

**Production cron (every 1 minute):**

```bash
curl -X POST -H "Authorization: Bearer $CRON_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit":20}' \
  https://app.example.com/api/agents/worker/run
```

Protect with service account JWT or `AGENT_CRON_SECRET` header if configured.

### 11.2 Scheduled Jobs

```http
POST /api/agents/scheduled/run
```

Scans for `meeting.scheduled` and `customer.renewal_due` events. Run every 15 minutes.

### 11.3 Queue Depth

```javascript
// Mongo shell / Compass
db.agent_tasks.aggregate([
  { $match: { status: "queued" } },
  { $group: { _id: "$orgId", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

Alert if any org has > 100 queued tasks for > 30 minutes.

---

## 12. Cron Jobs Summary

| Job | Schedule | Endpoint / Command |
|-----|----------|-------------------|
| Agent worker | `* * * * *` | `POST /api/agents/worker/run` |
| Scheduled agent events | `*/15 * * * *` | `POST /api/agents/scheduled/run` |
| MongoDB backup | `0 2 * * *` | `mongodump` or Atlas automatic |
| Health probe | `*/1 * * * *` | `GET /api/health/ready` |
| Certification (staging) | Weekly | `npm run cert:go-live` |

---

## 13. n8n Integration

### 13.1 Configuration

- Global: `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_TOKEN`
- Per-org: `org_webhook_config` collection

Events are published from `lib/events/bus.js` via `publishWebhookEvent`.

### 13.2 Troubleshooting

1. Check `webhook_deliveries` for `status: failed`
2. Verify n8n workflow is active and URL matches
3. Replay: `POST /api/agents/recovery` `{ "action": "replay_webhooks" }`
4. Validate `N8N_WEBHOOK_TOKEN` on inbound n8n → LeadEdge360 callbacks

### 13.3 Inbound from n8n

Secure inbound routes with `N8N_WEBHOOK_TOKEN` header validation (see integration module).

---

## 14. Database Maintenance

```bash
npm run db:check      # Connectivity test
npm run db:bootstrap  # Initial seed (non-prod)
npm run db:indexes    # All indexes — run after restore or schema change
```

**Index script:** `scripts/mongo-indexes.mjs` — includes `platform_events`, `agent_tasks`, `agent_memory`, `scheduled_event_log`, etc.

---

## 15. Certification & Retest Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Full certification | `npm run cert:go-live` | All suites |
| Static only | `$env:SKIP_RUNTIME=1; npm run cert:go-live` | No DB required |
| Go-live retest | `node scripts/go-live-retest.mjs` | Security, perf, lifecycle |
| Agent runtime | `npm run db:agent-runtime-retest` | AI workforce |
| Tenant isolation | `npm run db:tenant-retest` | Cross-tenant |
| E2E workflow | `npm run cert:e2e` | Lead → payment journey |

Set `RETEST_API_BASE=http://127.0.0.1:3000/api` (or staging URL).

---

## 16. Contacts & Escalation

| Role | Responsibility |
|------|----------------|
| Platform on-call | Uptime, deploys, DR |
| AI/runtime owner | Agent failures, LLM issues |
| Security | Tenant isolation, secrets rotation |
| Customer success | Pilot onboarding (see PILOT_READINESS.md) |

---

## 17. Quick Reference Commands

```powershell
# Windows — full certification (PowerShell)
$env:RETEST_API_BASE = "http://127.0.0.1:3000/api"
npm run db:indexes
npm run dev
# In second terminal:
npm run cert:go-live

# Static certification only (no MongoDB)
$env:SKIP_RUNTIME = "1"
npm run cert:go-live
```

```bash
# Linux — production health
curl -sf https://app.example.com/api/health/ready | jq .
```

---

*See also: [GO_LIVE_CERTIFICATION_REPORT.md](./GO_LIVE_CERTIFICATION_REPORT.md), [PILOT_READINESS.md](./PILOT_READINESS.md)*
