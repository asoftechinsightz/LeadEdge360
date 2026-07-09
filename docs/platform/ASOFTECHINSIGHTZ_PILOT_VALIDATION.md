# AsoftechInsightz — First-Tenant Pilot Validation

**Purpose:** Validate all platform features using **AsoftechInsightz** as Org #1 before onboarding paying clients.  
**Companion:** [Pilot Provisioning](./PILOT_PROVISIONING.md) · [Pilot Readiness](./PILOT_READINESS.md) · [Operations Runbook](./OPERATIONS_RUNBOOK.md)  
**Automation:** `bash scripts/pilot-onboard-asoftechinsightz.sh` (Phases 0–2 on VPS)

---

## Success criteria

The platform is ready for external pilots when:

1. Automated Phases 0–2 pass on VPS (`pilot-onboard-asoftechinsightz.sh`)
2. Manual Phases 3–4 complete once without DB edits
3. `DEV_AUTH_BYPASS=false` and production auth enforced
4. Tenant isolation retest passes

---

## Quick start (VPS)

```bash
cd /opt/asoftech-insightz
source .env

export PILOT_ADMIN_PASSWORD='your-secure-password'
export CERT_ADMIN_PASSWORD="$PILOT_ADMIN_PASSWORD"

# Preview all automated steps
bash scripts/pilot-onboard-asoftechinsightz.sh --dry-run

# Run Phases 0–2 (provision + automated tests)
bash scripts/pilot-onboard-asoftechinsightz.sh

# Include full runtime certification (longer)
bash scripts/pilot-onboard-asoftechinsightz.sh --with-cert-runtime
```

**Login after provision:**

| Field | Value |
|-------|--------|
| Org ID | `asoftechinsightz` |
| Admin email | `admin@asoftechinsightz.com` |
| Industry | `it_services` |
| Plan | `ENTERPRISE` |
| Proposal prefix | `ASI` |
| Invoice prefix | `ASI-INV` |

---

## Phase 0 — Platform prep (automated + spot checks)

| # | Check | How | Pass |
|---|--------|-----|------|
| 0.1 | App container healthy | `docker compose ps` | `app` running |
| 0.2 | Mongo connected | `curl -s http://127.0.0.1:3000/api/health/ready` | `mongo: connected` |
| 0.3 | Production auth | `.env`: `DEV_AUTH_BYPASS=false`, `REQUIRE_AUTH=true` | No demo bypass |
| 0.4 | App env | `NEXT_PUBLIC_APP_ENV=production` | Not `demo` |
| 0.5 | Pilot verify (pre) | `npm run pilot:verify` | `PASS` |

---

## Phase 1 — Provision AsoftechInsightz org (automated)

Script sets these defaults (override via env if needed):

```bash
PILOT_ORG_NAME="AsoftechInsightz Pvt Ltd"
PILOT_ORG_ID="asoftechinsightz"
PILOT_ADMIN_EMAIL="admin@asoftechinsightz.com"
PILOT_ADMIN_NAME="Platform Admin"
PILOT_ADMIN_PHONE="+917307911405"
PILOT_INDUSTRY=it_services
PILOT_GSTIN=09AAAAA0000A1Z5
PILOT_PROPOSAL_PREFIX=ASI
PILOT_INVOICE_PREFIX=ASI-INV
PILOT_PLACE_OF_SUPPLY="Uttar Pradesh"
```

| # | Check | Pass |
|---|--------|------|
| 1.1 | Dry-run completes | No errors |
| 1.2 | `npm run pilot:provision` | Org + admin created |
| 1.3 | `--seed-sample` | Sample leads visible |
| 1.4 | Admin login at production URL | Dashboard loads |
| 1.5 | Settings → branding | GST, prefixes, industry set |
| 1.6 | Re-run provision (idempotent) | Succeeds, no duplicates |

---

## Phase 2 — Automated API smoke (automated)

| # | Command | Pass |
|---|---------|------|
| 2.1 | `npm run pilot:verify` | Exit 0 |
| 2.2 | `npm run db:foundation-retest` | Exit 0 |
| 2.3 | `npm run db:tenant-retest` | Exit 0 |
| 2.4 | `npm run db:agent-runtime-retest` | Exit 0 |
| 2.5 | `npm run cert:runtime` (optional) | **GO** or **GO WITH MINOR OBSERVATIONS** |

Set credentials for authenticated checks:

```bash
export CERT_ADMIN_EMAIL=admin@asoftechinsightz.com
export CERT_ADMIN_PASSWORD='your-secure-password'
export RETEST_API_BASE=http://127.0.0.1:3000/api
```

---

## Phase 3 — Manual business validation (printable)

Run as your real day-1 workflow. Check each box when done.

### A. Marketing → inbound leads

| # | Step | URL / module | ☐ Pass |
|---|------|--------------|--------|
| A1 | Homepage loads (all sections) | `/` | |
| A2 | Growth Audit form submits | `/growth-audit` | |
| A3 | Contact form submits | `/contact` | |
| A4 | New leads appear in CRM | `/leads` | |
| A5 | DPDP consent banner visible | marketing pages | |
| A6 | Footer renders (no white box) | any marketing page | |

### B. CRM sales pipeline

| # | Step | URL / module | ☐ Pass |
|---|------|--------------|--------|
| B1 | Dashboard KPIs load | `/dashboard` | |
| B2 | Create manual lead | `/leads` | |
| B3 | AI lead score runs | lead detail | |
| B4 | Convert to opportunity | `/opportunities` | |
| B5 | Create proposal | `/proposals` | |
| B6 | Proposal PDF preview | proposal detail | |
| B7 | Approve proposal (if gated) | proposal workflow | |
| B8 | Create invoice from won deal | `/invoices` | |
| B9 | GST + `ASI-INV` prefix on PDF | invoice PDF | |
| B10 | Record payment | invoice / revenue | |
| B11 | Revenue dashboard updates | `/revenue` or dashboard | |

### C. Growth tools

| # | Step | URL / module | ☐ Pass |
|---|------|--------------|--------|
| C1 | Digital business card | `/growth/business-card` | |
| C2 | Public card link works | shared URL | |
| C3 | QR code generated + tracked | `/growth/qr` | |
| C4 | Review request sent | `/growth/reviews` | |
| C5 | Campaign created | `/campaigns` | |

### D. AI Workforce

| # | Step | URL / module | ☐ Pass |
|---|------|--------------|--------|
| D1 | AI Command Center loads | `/leadedge360/command-center` | |
| D2 | Insights page | `/leadedge360/insights` | |
| D3 | Geo finder / scanner | `/leadedge360/geo-finder` | |
| D4 | Agent queue healthy | `/ops/agents` | |
| D5 | Platform events visible | `/ops/events` | |
| D6 | Activity feed | dashboard / activities | |

### E. Admin, branding, security

| # | Step | URL / module | ☐ Pass |
|---|------|--------------|--------|
| E1 | Upload logo + signature | Settings | |
| E2 | Logo on proposal PDF | PDF export | |
| E3 | Sidebar shows LeadEdge logo | app shell | |
| E4 | Logout + re-login | auth | |
| E5 | Second user (sales rep) — tenant isolation | users + data | |
| E6 | No access to other org data | cross-tenant check | |

---

## Phase 4 — Dogfood scenario (end-to-end)

Simulate AsoftechInsightz selling LeadEdge360 to a prospect:

```
1. Lead: "Retail chain — wants AI CRM"     (Growth Audit or Contact form)
2. Qualify with AI score                    (Lead detail → AI)
3. Opportunity: ₹5L annual deal           (Pipeline)
4. Proposal: LeadEdge360 Enterprise       (Proposal AI + PDF)
5. Invoice: 50% advance                   (ASI-INV-001, GST correct)
6. Payment recorded                         (Revenue dashboard)
7. Post-win follow-up task                  (CRM / agents)
8. CEO briefing / insights                  (AI Insights or Reports)
```

| # | Milestone | ☐ Pass |
|---|-----------|--------|
| 4.1 | Inbound lead captured without manual DB edit | |
| 4.2 | Full Lead → Invoice flow completed | |
| 4.3 | Revenue reflects payment | |
| 4.4 | Audit / activity log shows key events | |

---

## Go / No-Go before first external client

| Criteria | Required |
|----------|----------|
| `pilot-onboard-asoftechinsightz.sh` | Exit 0 |
| Admin login on production URL | Works |
| Lead → Invoice once | Complete |
| AI Command Center | No crash |
| `db:tenant-retest` | Pass |
| Marketing forms | Working |
| `DEV_AUTH_BYPASS=false` | Enforced |
| Mongo backup tested | Documented in runbook |

**GO** = all above pass  
**NO-GO** = login, CRM pipeline, or tenant isolation fails

---

## Recommended schedule

| Day | Focus |
|-----|--------|
| Day 1 | Phase 0–2 (automated script on VPS) |
| Day 2 | Phase 3A–B (marketing + CRM) |
| Day 3 | Phase 3C–D (growth + AI) |
| Day 4 | Phase 4 dogfood scenario |
| Day 5 | Fix gaps → onboard first external pilot |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `pilot:provision` missing on VPS | Sync `package.json` + `scripts/` from dev |
| Login fails after provision | `ADMIN_EMAIL=admin@asoftechinsightz.com ADMIN_PASSWORD='...' npm run db:set-password` |
| Email belongs to UUID org | `npm run pilot:align-org -- --from-email` then `bash scripts/pilot-onboard-asoftechinsightz.sh --align-existing` |
| Platform routes 404 | `docker compose build app --no-cache && docker compose up -d app` |
| AI Command Center crash | Rebuild app with latest `httpClient.ts` + `AICommandCenter.tsx` |
| Logos missing in sidebar | Sync `public/images/brand/*.svg` + `lib/brand.js` |
| `CERT_ADMIN_PASSWORD` unset | Export before running script or retests |

---

## Related commands

```bash
# Password reset
npm run db:set-password -- admin@asoftechinsightz.com 'your-password'

# Re-provision (idempotent)
npm run pilot:provision -- --seed-sample

# Deep certification
bash scripts/vps-runtime-certification.sh
```
