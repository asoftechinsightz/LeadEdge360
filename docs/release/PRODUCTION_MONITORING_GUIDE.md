# LeadEdge360 — Production Monitoring Guide

**Release:** R1.1 Foundation GA  
**Audience:** Infrastructure · DevOps · SRE  
**Last updated:** 3 August 2026  
**Implementation status:** Documentation only — no dashboard implementation in this release  

---

## 1. Purpose

Define **what to monitor**, **recommended signals**, **thresholds**, and **dashboard layouts** for a controlled LeadEdge360 pilot. Adapt to your existing stack (Datadog, Grafana, CloudWatch, UptimeRobot, etc.).

---

## 2. Monitoring principles

1. **Flags OFF baseline first** — establish metrics before enabling Sprint 1 flags.
2. **Tenant-scoped where possible** — pilot org ID in filters.
3. **Alert on symptoms** (5xx rate, health fail) before deep dives.
4. **Audit collection** — `audit_logs` in Mongo for flag-related actions.

---

## 3. Dashboard 1 — Deployment status

| Panel | Source | Query / check | Alert |
|-------|--------|---------------|-------|
| Last deploy time | GitHub Actions / deploy log | Workflow `Deploy to VPS` conclusion | Failed workflow |
| Container running | Docker / VPS | `docker compose ps` app state `running` | Not running > 2 min |
| Image tag / commit | VPS git | `git rev-parse HEAD` at `/opt/asoftech` | — |
| Smoke health | Synthetic | `GET /api/` every 1 min | 2 consecutive failures |
| Compose services | Docker | `app`, `mongo`, `n8n` up | Any service down |

**Synthetic check:**

```bash
curl -fsS "https://<PUBLIC_URL>/api/" | jq -e '.ok == true'
```

Expected: `ok: true`, `name: "AsoftechInsightz API"`, `time` ISO timestamp.

---

## 4. Dashboard 2 — API health

| Panel | Signal | Collection method | Warning | Critical |
|-------|--------|-------------------|---------|----------|
| Request rate | req/s | Reverse proxy / APM | — | — |
| Error rate 5xx | % of requests | Access logs / APM | > 1% | > 5% |
| Latency p50 / p95 | ms | APM | p95 > 2s | p95 > 5s |
| Health endpoint | `GET /api/` | Synthetic | Fail 1x | Fail 3x |
| Auth errors 401 | count/min | Log pattern | Spike 3x baseline | Spike 10x |
| Auth errors 403 | count/min | Log pattern | Spike 3x baseline | Spike 10x |

**Key routes (pilot):**

| Route | Why |
|-------|-----|
| `GET /api/leads` | CRM core |
| `POST /api/leads` | Create + entitlement 402 when E-004 ON |
| `GET /api/kpis` | Dashboard |
| `PATCH /api/users/me` | AEO profile when E-003 ON |
| `GET /api/followups` | Bridge when E-002 ON |
| `POST /api/billing/*` | Payments |

---

## 5. Dashboard 3 — Mongo health

| Panel | Signal | Method | Warning | Critical |
|-------|--------|--------|---------|----------|
| Mongo up | Ping | `mongosh --eval "db.adminCommand('ping')"` from ops host | — | Fail |
| Connections | current / available | `serverStatus` | > 80% pool | > 95% |
| Opcounters | insert/query/update | `serverStatus` | — | Sudden drop |
| Replication lag | seconds | If replica set | > 10s | > 60s |
| Disk usage | % on `mongo-data` volume | Host metrics | > 75% | > 90% |
| Backup last success | timestamp | Backup job log | > 25h | > 48h |

**Compose volume:** `mongo-data` → `/data/db` in `asoftech-mongo` container.

---

## 6. Dashboard 4 — Memory & CPU

| Panel | Service | Warning | Critical |
|-------|---------|---------|----------|
| CPU % | `asoftech-app` | > 70% sustained 15m | > 90% |
| Memory % | `asoftech-app` | > 75% | > 90% |
| CPU % | `asoftech-mongo` | > 70% | > 90% |
| Memory % | `asoftech-mongo` | > 80% | > 95% |
| Node heap | App logs / APM | `NODE_OPTIONS` if needed | OOM restart loop |

**Note:** Next.js standalone typically runs single Node process; scale vertically for pilot.

---

## 7. Dashboard 5 — Errors

| Panel | Source | Pattern |
|-------|--------|---------|
| Application errors | Container logs | `Error`, `ECONNREFUSED`, `MongoServerSelectionError` |
| Unhandled API errors | App logs | 500 responses with stack |
| Razorpay failures | App logs + Razorpay dashboard | verify/signature errors |
| LLM failures | App logs | Emergent API errors |
| n8n workflow failures | n8n UI / logs | Failed executions |

**Log aggregation (recommended fields):**

- `timestamp`, `level`, `route`, `status`, `orgId` (if logged), `userId`, `message`

---

## 8. Dashboard 6 — Bridge usage (E-002)

**Active when:** `WEB_JWT_BRIDGE=true`

| Panel | Signal | How to measure |
|-------|--------|----------------|
| Bridge route hits | Count | Log lines for bridged roots: `followups`, `admin`, `wa` |
| Cookie vs JWT ratio | % | Compare `Authorization: Bearer` vs cookie session |
| Bridge 404 rate | count | Requests to bridged paths when flag OFF (misconfig) |
| Bridge 403 rate | count | Agent admin denial |
| Cross-tenant denials | count | JWT isolation (should be ~0 successful leaks) |

**Audit:** no dedicated bridge audit event — infer from access logs and 403/404 rates.

---

## 9. Dashboard 7 — Plan limit usage (E-004)

**Active when:** `ENFORCE_PLAN_LIMITS=true`

| Panel | Signal | Source |
|-------|--------|--------|
| 402 rate | `POST /api/leads`, products, webhooks | Access logs |
| 402 by org | Top orgs hitting cap | Log `orgId` + status 402 |
| 403 retail blocked | Starter retail attempts | Status 403 + route |
| Grandfather hits | Org in `GRANDFATHER_ORG_IDS` | Config audit |
| Subscription activations | count/day | `audit_logs` action `subscription.activated` |

**Mongo query (ops read-only):**

```javascript
db.audit_logs.find({ action: 'subscription.activated' }).sort({ createdAt: -1 }).limit(50)
```

---

## 10. Dashboard 8 — AEO profile migration (E-003)

**Active when:** `AEO_SERVER_PROFILE=true`

| Panel | Signal | Source |
|-------|--------|--------|
| Profile PATCH rate | `PATCH /api/users/me` | Access logs |
| Profile update audit | count | `audit_logs` action `aeo.profile.updated` |
| PATCH errors | 4xx/5xx on users/me | Access logs |
| Session merge events | one-time client hydrate | Support tickets / CS notes |
| AEO compute latency | p95 | APM on leadedge360 page loads |

**Mongo query:**

```javascript
db.audit_logs.find({ action: 'aeo.profile.updated' }).sort({ createdAt: -1 }).limit(50)
```

**Migration watch:** users with `preferences.aeoProfile` populated but empty server fields — CS spot-check first 10 pilot users after flag ON.

---

## 11. Alert routing

| Priority | Channels | Examples |
|----------|----------|----------|
| P1 | Pager + phone | Health fail, Mongo down, deploy fail |
| P2 | Slack `#leadedge-ops` | 5xx spike, 402 spike after flag ON |
| P3 | Email daily digest | n8n failures, LLM errors |

---

## 12. Runbook links

| Scenario | Document |
|----------|----------|
| Rollback flags | [PRODUCTION_ROLLBACK_GUIDE.md](./PRODUCTION_ROLLBACK_GUIDE.md) |
| Go-live steps | [PRODUCTION_GO_LIVE_PLAYBOOK.md](./PRODUCTION_GO_LIVE_PLAYBOOK.md) |
| Flag phases | [FEATURE_FLAG_ROLLOUT_PLAN.md](./FEATURE_FLAG_ROLLOUT_PLAN.md) |

---

## 13. Implementation checklist (for Infra team)

- [ ] Synthetic monitor on `GET /api/` (1 min interval)
- [ ] Container CPU/memory on VPS
- [ ] Mongo disk alert on `mongo-data`
- [ ] GitHub Actions failure notification
- [ ] Access log shipping with status code + path
- [ ] Razorpay + n8n health bookmarks for on-call

**No application code required** for baseline monitoring.
