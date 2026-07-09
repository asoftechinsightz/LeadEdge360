# Sprint 0 Hardening — Staging Deploy & UAT

**Date:** 2026-06-22  
**VPS:** `root@187.127.179.138`  
**Path:** `/opt/asoftech`  
**Staging port:** `3007`  
**Production:** Docker on `3000` / `https://app.asoftechinsightz.com`

---

## Scope

| Area | Changes |
|------|---------|
| Lead Details | `GET /api/leads/:id` — fixes "Lead not found" (405) |
| API auth | `guardCrmRequest` / `guardProposalRequest` on 44+ routes |
| Tenant isolation | Assignment scope, `proposal_items.orgId`, growth-audit fail-closed |
| Branding | Dynamic PDFs, settings API, campaign `fromName` |
| Onboarding | Admin-only writes on email, whatsapp, team, progress |
| Billing | Checkout returns `merchantName` from org branding |
| Environment | DEMO/UAT/PROD badge in suite header |

---

## Pre-deploy (local)

```bash
npm run build   # must pass
```

Sync code to VPS (choose one):

```bash
# Option A — git (preferred)
git push origin main
# On VPS: git pull origin main

# Option B — tarball from Windows (scripts/vps-sync-deploy.ps1)
powershell -ExecutionPolicy Bypass -File scripts/vps-sync-deploy.ps1
```

---

## Staging deploy (on VPS via Cursor Remote SSH)

Open **Cursor Remote SSH** → `root@187.127.179.138` → `/opt/asoftech`

### One command (recommended)

Sync code first (see [Pre-deploy](#pre-deploy-local)), then on VPS:

```bash
cd /opt/asoftech
bash scripts/vps-sprint0-staging-deploy.sh
```

Or: `npm run deploy:staging:s0h`

This script starts Mongo, launches the dev server on `3007` if needed, runs `deploy:s0h`, and prints the staging URL.

### Manual (two terminals)

```bash
cd /opt/asoftech
git pull origin main
npm install
docker compose up -d mongo
npm run dev -- --hostname 0.0.0.0 --port 3007
```

Ensure `.env` includes:

```env
NEXT_PUBLIC_APP_ENV=uat
REQUIRE_AUTH=true
DEV_AUTH_BYPASS=false
NEXT_PUBLIC_APP_URL=http://187.127.179.138:3007
```

### Terminal 2 — automated Sprint 0 UAT

```bash
cd /opt/asoftech
export RETEST_API_BASE=http://127.0.0.1:3007/api
npm run deploy:s0h
```

`deploy:s0h` runs:

1. `docker compose up -d mongo`
2. `npm run db:indexes`
3. `npm run build`
4. `node scripts/sprint0-staging-uat.mjs` — Lead Details, branding, PDF, billing
5. `node scripts/uat-retest.mjs` — baseline UAT regression
6. `node scripts/tenant-isolation-retest.mjs` — org isolation smoke
7. `node scripts/go-live-retest.mjs` — CRM baseline

---

## Manual UI smoke (staging)

Login: `admin@asoftechinsightz.com` / `ChangeMe@2025`  
URL: `http://187.127.179.138:3007`

| Check | Action |
|-------|--------|
| Environment badge | Header shows **UAT** (or DEMO) badge |
| Lead detail | Open any lead → tabs load, no "Lead not found" |
| Branding | Settings → Branding → save company name |
| Proposal PDF | Create/open proposal → Download PDF → company name on doc |
| Onboarding | Settings onboarding steps save (admin only) |
| Subscribe | `/subscribe` → Razorpay modal shows tenant company name |

---

## Production deploy (after staging PASS)

```bash
cd /opt/asoftech
git pull origin main
docker compose up -d --build
curl -fsS http://127.0.0.1:3000/api/ || curl -fsS https://app.asoftechinsightz.com/api/
```

Set on production `.env`:

```env
NEXT_PUBLIC_APP_ENV=production
GROWTH_AUDIT_ORG_ID=<your-org-id>
REQUIRE_AUTH=true
DEV_AUTH_BYPASS=false
```

---

## Sign-off

| Step | Status | Notes |
|------|--------|-------|
| Code synced to VPS | ☐ | |
| `npm run build` | ☐ | |
| `sprint0-staging-uat` | ☐ | |
| `uat-retest` | ☐ | |
| `tenant-isolation-retest` | ☐ | |
| `go-live-retest` | ☐ | |
| UI smoke | ☐ | |
| Production deploy | ☐ | |

**Deployed by:** _______________  
**Verified by:** _______________  
**Date:** _______________

---

## Rollback

```bash
cd /opt/asoftech
git log -5 --oneline
git checkout <previous-commit>
docker compose up -d --build
```
