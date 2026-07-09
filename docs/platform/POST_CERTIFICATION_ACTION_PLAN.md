# Post-Certification Action Plan — Pilot Readiness

**Certification decision:** **GO WITH MINOR OBSERVATIONS**  
**Date:** June 2026  
**VPS:** `leadedge360` (`/opt/asoftech-insightz`)  
**Companion:** [Pilot Readiness Guide](./PILOT_READINESS.md) · [Operations Runbook](./OPERATIONS_RUNBOOK.md) · [Runtime Certification Report](./RUNTIME_CERTIFICATION_REPORT.md)

The platform is approved for **controlled pilot deployment**. No major architectural work should begin before pilot feedback is collected.

---

## Priority 1 — Resolve Remaining Observations

### 1.1 Platform events & activities (Docker image)

Certification noted `/api/platform/*` and `/api/activities` return **404** on the current production container — the image was built from an older commit. Routes exist in the repository; a **rebuild and redeploy** is required.

**On VPS after syncing latest code:**

```bash
cd /opt/asoftech-insightz
git pull   # or sync from dev machine
docker compose build app --no-cache
docker compose up -d app
```

**Verify (after login token obtained):**

```bash
# Health (no auth → 401 is OK)
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/platform/health

# With admin token — expect 200
TOKEN=$(curl -s -X POST http://127.0.0.1:3000/api/auth/login-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@asoftechinsightz.com","password":"YOUR_PASSWORD"}' \
  | jq -r .accessToken)
curl -s -o /dev/null -w "platform/health %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" http://127.0.0.1:3000/api/platform/health
curl -s -o /dev/null -w "activities %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" "http://127.0.0.1:3000/api/activities?limit=5"
```

**Expected after rebuild:** `platform/health 200`, `activities 200`.

---

### 1.2 Optional integrations (graceful degradation)

The core CRM operates without these. Configure when pilot customers need the capability.

| Variable | Purpose | If unset |
|----------|---------|----------|
| `EMERGENT_LLM_KEY` | AI scoring, agent LLM tasks | Rule-based agents run; AI tasks skipped in cert |
| `N8N_WEBHOOK_TOKEN` | Signed n8n inbound webhooks | n8n container runs; app webhooks unsigned |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Campaign email | `/api/campaigns/smtp/readiness` → `configured=false`; no outbound email |
| `MSG91_AUTH_KEY` | SMS OTP (India) | Dev OTP returned in non-production only |

See `.env.example` for full list. Never commit live secrets.

---

### 1.3 Deployment synchronization

Confirm VPS matches the current repository.

**Automated check (on VPS):**

```bash
cd /opt/asoftech-insightz
export CERT_ADMIN_EMAIL=admin@asoftechinsightz.com
export CERT_ADMIN_PASSWORD='your-password'
export RETEST_API_BASE=http://127.0.0.1:3000/api
npm run pilot:verify
```

**Manual checklist:**

| Item | Path / command |
|------|----------------|
| Billing plan map | `lib/billing/plan-map.js` |
| Mongo connect | `lib/mongo-connect.js` |
| Runtime cert | `scripts/runtime-vps-certification.mjs` |
| Index migration | `scripts/mongo-indexes.mjs` |
| Go-live retest | `scripts/go-live-retest.mjs` |
| Foundation retest | `scripts/foundation-retest.mjs` |
| Docker routes | Rebuild `app` service (see §1.1) |

Re-run certification after sync:

```bash
export RETEST_API_BASE=http://127.0.0.1:3000/api
export SKIP_BUILD=1
export CERT_ADMIN_EMAIL=admin@asoftechinsightz.com
export CERT_ADMIN_PASSWORD='your-password'
npm run cert:runtime
```

---

## Priority 2 — Pilot Environment

Prepare the first pilot organization. Use [Pilot Provisioning](./PILOT_PROVISIONING.md) and [Pilot Readiness §2](./PILOT_READINESS.md#2-customer-onboarding-checklist).

```bash
cd /opt/asoftech-insightz
source .env
export PILOT_ORG_NAME="Customer Pvt Ltd"
export PILOT_ADMIN_EMAIL=admin@customer.com
export PILOT_ADMIN_PASSWORD='...'
export PILOT_INDUSTRY=healthcare
npm run pilot:provision -- --dry-run
npm run pilot:provision
```

| Area | Action |
|------|--------|
| Production org | `npm run pilot:provision` — unique `orgId` (not `demo-org`) |
| Administrator | Created active with bcrypt password |
| Branding | `org_branding` — GST, prefixes, company name |
| Proposal templates | Default org-scoped template seeded |
| Invoice numbering | `PILOT_INVOICE_PREFIX` + GST in branding |
| GST | `PILOT_GSTIN`, `PILOT_GST_TYPE`, `PILOT_PLACE_OF_SUPPLY` |
| Email | SMTP when campaigns required |
| Backup | Mongo volume snapshots or `scripts/mongo-backup.mjs` cron |
| Monitoring | Health checks, log rotation (see Priority 3) |

**Production env minimum:**

```env
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_USE_MOCK_API=false
REQUIRE_AUTH=true
DEV_AUTH_BYPASS=false
```

---

## Priority 3 — Monitoring (first 30 days)

| Signal | Check | Alert threshold |
|--------|-------|-----------------|
| Login failures | App logs, `audit_logs` | Spike vs baseline |
| API errors | Reverse proxy / container logs | 5xx rate > 1% |
| Queue failures | `agent_tasks` status=failed | > 5 per org/day |
| MongoDB | `GET /api/health/ready` | `mongo != connected` |
| Docker | `docker ps`, healthchecks | Container not `healthy` |
| AI task failures | `/ops/agents` | Failed batch > 10/hr |
| Activity feed | `/activities` | Empty after known events (post-rebuild) |
| Notifications | `org_notifications` delivery | Undelivered > 1 hr |
| Backup | Backup job exit code | Any failure |

**Daily:** `/api/health/live`, `/api/health/ready`  
**Weekly:** Audit sample, tenant isolation spot-check, AI cost vs budget

Details: [Operations Runbook §6](./OPERATIONS_RUNBOOK.md), [Pilot Readiness §9](./PILOT_READINESS.md#9-recommended-monitoring--first-30-days).

---

## Priority 4 — Feedback

Collect structured pilot feedback. Classify every item:

| Severity | Definition | Response |
|----------|------------|----------|
| **Critical** | Data loss, security breach, payment failure | Fix before continued pilot |
| **High** | Core workflow blocked | Fix within 48 h |
| **Medium** | Workaround exists | Next sprint |
| **Low** | Cosmetic / minor UX | Backlog |
| **Enhancement** | New capability | Post-pilot roadmap |

**Prioritize production defects before new functionality.**

Template fields: org, workflow step, steps to reproduce, expected vs actual, severity, screenshot/log.

---

## Change Policy (pilot freeze)

**Freeze major architecture changes** until day-30 pilot review.

**Allowed during pilot:**

- Bug fixes
- Security fixes
- Performance improvements
- Pilot-requested enhancements (scoped, reviewed)

**Not allowed without explicit approval:**

- Database schema redesign
- Auth model changes
- Multi-tenant model changes
- New microservices or queue migrations

---

## Success Criteria

The pilot phase is successful when:

- [ ] Core CRM workflows remain stable (lead → invoice → payment)
- [ ] Multi-tenant isolation remains intact (zero cross-org leakage)
- [ ] Pilot organization(s) use the platform daily for agreed workflows
- [ ] No **Critical** or **High** production defects remain open
- [ ] Feedback collected and prioritized for the next release plan
- [ ] Runtime certification remains **GO** or **GO WITH MINOR OBSERVATIONS**

---

## Sign-off

| Milestone | Owner | Target date | Done |
|-----------|-------|-------------|------|
| P1 observations resolved | Engineering | | |
| Pilot org provisioned | Ops + Sales | | |
| Monitoring active | DevOps | | |
| Pilot start | Product | | |
| Day-30 review | All stakeholders | | |

---

*Generated from VPS runtime certification — controlled pilot approved.*
