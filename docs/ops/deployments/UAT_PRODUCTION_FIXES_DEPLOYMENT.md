# UAT Production Defect Fixes — VPS Deployment

**Date:** 2026-06-22  
**VPS:** `root@187.127.179.138`  
**Path:** `/opt/asoftech`  
**Staging port:** `3007`  
**Production:** Docker on `3000` / `https://app.asoftechinsightz.com`

---

## Scope (12 defects)

| Priority | Items |
|----------|-------|
| P1 | Global create workflow, lead soft delete, territory CRUD, tenant isolation |
| P2 | RetailEdge360 nav isolation, global search, signup/forgot password |
| P3 | Timeline UI, assignment UI, org header, logout cache, Razorpay CSP |

---

## Pre-deploy (local)

1. `npm run build` — must pass
2. Sync code to VPS (`git pull` or rsync/scp)

---

## Staging deploy (on VPS)

Open **Cursor Remote SSH** → `root@187.127.179.138` → `/opt/asoftech`

### Terminal 1 — dev server (required for retests)

```bash
cd /opt/asoftech
npm run dev -- --hostname 0.0.0.0 --port 3007
```

### Terminal 2 — automated UAT deploy

```bash
cd /opt/asoftech
git pull origin main
npm install
export RETEST_API_BASE=http://127.0.0.1:3007/api
npm run deploy:uat
```

The `deploy:uat` script runs:

1. `docker compose up -d mongo`
2. `npm run db:indexes` (territories + lead soft-delete indexes)
3. `npm run build`
4. `npm run db:uat-retest` — create/delete/restore lead, territories, search, CRUD
5. `npm run db:tenant-retest` — org isolation smoke
6. `node scripts/go-live-retest.mjs` — baseline CRM regression

---

## Manual UI smoke (staging)

Login: `admin@asoftechinsightz.com` / `ChangeMe@2025`

| Check | URL / action |
|-------|----------------|
| New Lead | Header **+ New → New Lead** → form → save → `/leads/{id}` |
| New Opportunity | **+ New → New Opportunity** |
| New Proposal | **+ New → New Proposal** |
| New Campaign | **+ New → New Campaign** |
| Lead delete | Open lead → **Delete** → confirm → hidden from list |
| Territories | `/leadedge360/territories` → create/edit |
| Retail nav | `/retailedge360` → retail sidebar only |
| Global search | Header search → leads + opportunities |
| Signup | `/signup` |
| Forgot password | `/forgot-password` |
| Logout cache | Sign out → browser back → no stale auth page |

---

## Production deploy (after staging PASS)

```bash
cd /opt/asoftech
git pull origin main
docker compose up -d --build
curl -fsS https://app.asoftechinsightz.com/api/health || curl -fsS http://127.0.0.1:3000/api/health
```

Verify `REQUIRE_AUTH=true` and `DEV_AUTH_BYPASS=false` in production `.env`.

---

## Sign-off

| Step | Status | Notes |
|------|--------|-------|
| Indexes applied | ☐ | `territories`, `leads_orgId_deletedAt` |
| Build | ☐ | |
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
git log -1 --oneline
git checkout <previous-commit>
docker compose up -d --build
```

Soft-deleted leads remain in DB (`deletedAt` set); no data loss on rollback.
