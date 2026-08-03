# WS2 — Infrastructure Action Checklist

**Audience:** Infrastructure / Ops  
**Pilot host:** `app.asoftechinsightz.com` (expected path: `/opt/asoftech`)  
**Prerequisite:** GitHub Actions `VPS_SSH_KEY` or operator SSH key (see `.github/DEPLOY_SETUP.md`)  
**Rule:** **Read-only inspection** unless PO explicitly authorizes deploy afterward.

**Infrastructure execution session:** 2 August 2026, ~13:15–13:16 UTC  
**Operator host:** Validation workstation (`C:\Users\ARNAV`)  
**SSH key used:** `C:\Users\ARNAV\.ssh\asoftech_vps` (only key present; `asoftech_ci` / `VPS_SSH_KEY` **not** on host)  
**Production modified:** **No**

---

## Phase 0 — Access

| Step | Action | Pass? | Notes |
|------|--------|-------|-------|
| 0.1 | Confirm `VPS_HOST`, `VPS_USER`, SSH port (default 22) | ☑ partial | DNS A: `185.38.109.200`–`209`; SSH config `asoftech-vps` → `187.127.179.138` (see variance) |
| 0.2 | `ssh -p <PORT> <USER>@<HOST>` — login succeeds | ☐ **FAIL** | See SSH evidence below |
| 0.3 | Confirm user can `cd /opt/asoftech` | ☐ | Not reached — SSH failed |
| 0.4 | Confirm `docker` without sudo (or document sudo path) | ☐ | Not reached — SSH failed |

**SSH evidence (2 Aug 2026):**

```
$ ssh -i C:\Users\ARNAV\.ssh\asoftech_vps -o BatchMode=yes -o ConnectTimeout=15 asoftech-vps hostname
ssh: connect to host 187.127.179.138 port 22: Connection timed out

$ ssh -i C:\Users\ARNAV\.ssh\asoftech_vps -o BatchMode=yes -o ConnectTimeout=15 root@185.38.109.200 hostname
root@185.38.109.200: Permission denied (publickey,password).

$ ssh -i C:\Users\ARNAV\.ssh\asoftech_vps -o BatchMode=yes -o ConnectTimeout=15 asoftech@185.38.109.200 hostname
asoftech@185.38.109.200: Permission denied (publickey,password).

$ ssh -i C:\Users\ARNAV\.ssh\asoftech_vps -o BatchMode=yes -o ConnectTimeout=15 -p 2222 root@185.38.109.200 hostname
ssh: connect to host 185.38.109.200 port 2222: Connection timed out
```

**If SSH fails:** Stop and escalate — reconciliation cannot complete remotely. **Status: escalated — infra checklist incomplete.**

---

## Phase 1 — Git state

```bash
cd /opt/asoftech
git rev-parse HEAD
git branch --show-current
git status
git log -1 --oneline
git remote -v
```

| Field | Record here |
|-------|-------------|
| Commit SHA | **NOT COLLECTED** — SSH blocked |
| Branch | **NOT COLLECTED** — SSH blocked |
| Dirty working tree? | **NOT COLLECTED** — SSH blocked |
| Remote URL | **NOT COLLECTED** — SSH blocked |

**Compare to:** PO-approved Pilot RC tag/commit (must be supplied by PO if RC only exists locally).

---

## Phase 2 — Docker Compose & containers

```bash
cd /opt/asoftech
docker compose ps
docker compose config --services
docker images --format 'table {{.Repository}}\t{{.ID}}\t{{.CreatedAt}}' | grep -E 'asoftech|REPOSITORY'
docker inspect asoftech-app --format 'ContainerID={{.Id}} Image={{.Image}} Started={{.State.StartedAt}} Status={{.State.Status}}'
docker inspect asoftech-mongo --format 'Id={{.Id}} Status={{.State.Status}}' 2>/dev/null || true
```

| Item | Record |
|------|--------|
| `asoftech-app` container ID | **NOT COLLECTED** — SSH blocked |
| App image ID / repo tag | **NOT COLLECTED** — SSH blocked |
| Image created timestamp | **NOT COLLECTED** — SSH blocked |
| `asoftech-mongo` status | **NOT COLLECTED** — SSH blocked |
| n8n container (if running) | **NOT COLLECTED** — SSH blocked |
| Docker Compose version | **NOT COLLECTED** — SSH blocked |

---

## Phase 3 — Application version & build

```bash
docker exec asoftech-app node -e "console.log('node', process.version)" 2>/dev/null
docker exec asoftech-app sh -c 'head -5 package.json 2>/dev/null || cat package.json | head -8'
docker exec asoftech-app sh -c 'ls -la .next/BUILD_ID 2>/dev/null && cat .next/BUILD_ID'
```

| Item | Record |
|------|--------|
| `package.json` version | **NOT COLLECTED** — SSH blocked |
| Node version | **NOT COLLECTED** — SSH blocked |
| Next `BUILD_ID` (if present) | **NOT COLLECTED** — SSH blocked |

---

## Phase 4 — Environment variables (presence only — **do not paste values**)

```bash
cd /opt/asoftech
for v in MONGO_URL JWT_SECRET CERT_ADMIN_EMAIL CERT_ADMIN_PASSWORD EMERGENT_LLM_KEY REQUIRE_AUTH PILOT_MODE \
  NEXT_PUBLIC_BASE_URL DB_NAME EMERGENT_PROJECT_ID EMERGENT_API_KEY \
  NEXT_PUBLIC_RAZORPAY_KEY_ID RAZORPAY_KEY_SECRET N8N_WEBHOOK_TOKEN; do
  if grep -q "^${v}=" .env 2>/dev/null; then echo "PRESENT $v"; else echo "MISSING $v"; fi
done
```

| Variable | Present / Missing |
|----------|-------------------|
| MONGO_URL | **NOT VERIFIED** (`.env` grep requires SSH) |
| JWT_SECRET | **NOT VERIFIED** |
| CERT_ADMIN_EMAIL | **NOT VERIFIED** |
| CERT_ADMIN_PASSWORD | **NOT VERIFIED** |
| EMERGENT_LLM_KEY | **NOT VERIFIED** |
| REQUIRE_AUTH | **NOT VERIFIED** |
| PILOT_MODE | **NOT VERIFIED** in `.env`; runtime `/api/health` reports `pilotMode: true` (external HTTP only) |
| (others from script) | **NOT VERIFIED** |

**External runtime signals (not `.env` grep):** `/api/health` — Razorpay keys missing, SMTP missing; Mongo `connected`.

---

## Phase 5 — Mounted volumes

```bash
docker inspect asoftech-app --format '{{json .Mounts}}' | python3 -m json.tool 2>/dev/null || docker inspect asoftech-app --format '{{json .Mounts}}'
docker volume ls | grep -E 'mongo|n8n|asoftech'
```

| Volume | Mounted? | Purpose |
|--------|----------|---------|
| mongo-data | ☐ | **NOT COLLECTED** — SSH blocked |
| n8n-data | ☐ | **NOT COLLECTED** — SSH blocked |

---

## Phase 6 — AEO directories (container)

```bash
docker exec asoftech-app sh -c '
echo "=== AEO paths ==="
for p in config/aeo components/aeo lib/aeo; do
  if [ -d "$p" ]; then echo "PRESENT $p"; find "$p" -type f | head -20; else echo "MISSING $p"; fi
done
grep -q runAeoPrompt lib/scoring.js 2>/dev/null && echo "PRESENT runAeoPrompt" || echo "MISSING runAeoPrompt"
'
ls -la /opt/asoftech/n8n/aeo-*.json 2>/dev/null || echo "Host: no n8n/aeo-*.json"
```

| Path | Present / Missing |
|------|-------------------|
| `config/aeo/` | **UNCONFIRMED** on live container — SSH blocked |
| `components/aeo/` | **UNCONFIRMED** |
| `lib/aeo/` | **UNCONFIRMED** |
| `runAeoPrompt` in `lib/scoring.js` | **UNCONFIRMED** |
| `n8n/aeo-profile-reminder.json` (host) | **UNCONFIRMED** |
| `n8n/aeo-review-reminder.json` | **UNCONFIRMED** |
| `n8n/aeo-faq-nudge.json` | **UNCONFIRMED** |

**Approved RC (local workspace):** all above **Present** — see `docs/aeo/AEO_PHASE1_RELEASE_VALIDATION_REPORT.md`.

---

## Phase 7 — External smoke (from VPS or laptop)

```bash
curl -fsS https://app.asoftechinsightz.com/api/health | jq .
curl -fsS https://app.asoftechinsightz.com/api/metrics | head -10
curl -o /dev/null -w "%{http_code}\n" https://app.asoftechinsightz.com/billing
curl -o /dev/null -w "%{http_code}\n" https://app.asoftechinsightz.com/leadedge360
```

| URL | Expected for RC | Record status |
|-----|-----------------|---------------|
| `/api/health` | pilot JSON | **200** — see evidence |
| `/billing` | 200 (RC) | **404** |
| `/leadedge360` | 200 | **200** |
| `/dashboard` | 200 | **200** |
| `/signin` | 200 | **200** |
| `/api/leads` (no auth) | 401 | **401** |
| `/api/kpis` (no auth) | 401 | **401** |

**Phase 7 evidence (2 Aug 2026 13:15–13:16 UTC):**

```
$ curl.exe -sS --max-time 15 https://app.asoftechinsightz.com/api/health
{"ok":true,"status":"pilot","time":"2026-08-02T13:15:18.606Z","checks":{"database":{"ok":true,"detail":"connected"},"smtp":{"ok":false,"detail":"missing: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS"},"razorpay":{"ok":false,"detail":"NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing"}},"pilot":{"pilotMode":true,"productionLike":true,"billing":{"keysConfigured":false,"plansConfigured":false,"checkoutEnabled":false},"smtp":{"configured":false,"ready":false,"mode":"dry_run","missing":["SMTP_HOST","SMTP_PORT","SMTP_USER","SMTP_PASS"]},"oauthSignupEnabled":false,"trialProvisioningAvailable":true,"contactEmail":"Enquiry@asoftechinsightz.com"}}

$ curl.exe -sS --max-time 15 https://app.asoftechinsightz.com/api/metrics | head -10
asoftech_process_uptime_seconds 100479
asoftech_nodejs_heap_used_bytes 87787024
asoftech_nodejs_rss_bytes 168251392
asoftech_active_tenants 0
asoftech_active_users_24h 0
asoftech_leads_created_total 0
asoftech_opportunities_won_total 0
asoftech_pos_transactions_total 0
asoftech_mrr_inr 0

billing:404
leadedge360:200
dashboard:200
signin:200
api_leads:401
api_kpis:401
```

**DNS (same session):** `app.asoftechinsightz.com` → `185.38.109.200`–`209` (non-authoritative nslookup).

---

## Phase 8 — Logs (collect only)

```bash
sudo tail -n 200 /var/log/nginx/error.log > /tmp/nginx-error-$(date +%F).log
sudo tail -n 200 /var/log/nginx/access.log | tail -50
docker logs --tail 200 asoftech-app 2>&1 | tail -100
```

| Log | Status |
|-----|--------|
| nginx error/access | **NOT COLLECTED** — SSH blocked |
| `docker logs asoftech-app` | **NOT COLLECTED** — SSH blocked |

---

## Sign-off

| Role | Name | Date | SHA verified | AEO verified |
|------|------|------|--------------|--------------|
| Infrastructure | Validation agent | 2 Aug 2026 | ☐ **BLOCKED** | ☐ **BLOCKED** |
| Product Owner | | | ☐ | ☐ |

**Infrastructure checklist outcome:** **INCOMPLETE** — SSH access required to close Phases 1–6 and 8.

**Next:** Ops must run this checklist from a host with **authorized** `VPS_SSH_KEY` (`~/.ssh/asoftech_ci` per `.github/DEPLOY_SETUP.md`) or whitelist validation IP on VPS firewall. Then hand results to CS for `03_AUTHENTICATED_VALIDATION_CHECKLIST.md`.

**Customer Success:** **Do not begin** authenticated validation until Infrastructure records Git SHA, Docker image, and container AEO paths.
