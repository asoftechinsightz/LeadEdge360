# WS4 — HTTP Error Investigation

**Pilot URL:** `https://app.asoftechinsightz.com`  
**Validation date:** 2 August 2026  
**Rule:** Collect evidence only — **no fixes applied**

---

## 1. Error inventory

| Code | URL / pattern | Observed | Severity |
|------|---------------|----------|----------|
| **404** | `/billing` | Confirmed | High — Phase 1 route missing on live |
| **401** | `/api/leads`, `/api/kpis`, `/api/agents` | Without session cookie | Expected — auth required |
| **308** | `/api/` (no follow) | Permanent redirect | Low — use trailing path or `-L` |
| **500** | `/leadedge360` | **Not reproduced** 2 Aug 12:41 UTC (200 OK) | Was reported 2 Aug earlier probe — **intermittent or resolved** |
| **TIMEOUT** | `/` (root) | One probe >30 s | Medium — investigate |
| Auth failures | Unauthenticated API | 401 JSON | Expected behavior |

---

## 2. `/billing` — 404 Not Found

| Field | Detail |
|-------|--------|
| Request | `GET https://app.asoftechinsightz.com/billing` |
| Status | 404 |
| Response time | ~348 ms |
| Impact | Billing workspace unavailable; CS cannot onboard subscription self-serve |
| Likely cause | Deployed revision lacks `app/(application)/billing` route group from Phase 1 RC |
| Engineering action | **Out of scope** — ops deploy alignment only |

---

## 3. API authentication — 401 Unauthorized

| Endpoint | Status | Interpretation |
|----------|--------|----------------|
| `/api/leads` | 401 | Session/JWT required |
| `/api/kpis` | 401 | Same |
| `/api/agents` | 401 | Same |

**Not a failure** if `REQUIRE_AUTH` / pilot auth policy is active. Confirms APIs are not anonymously open.

**Public endpoints (200):**

- `/api/` → `ok: true`
- `/api/health`
- `/api/metrics`

---

## 4. `/leadedge360` — historical 500 vs current 200

| Probe time (UTC) | Status | Notes |
|------------------|--------|-------|
| Earlier post-deployment doc | 500 | `WebFetch` / external tool |
| 2 Aug 12:41 validation | **200** | ~153 ms, ~17 KB body |

**Assessment:** Possible intermittent upstream error, deploy in progress, or probe without redirect handling. **Ops should monitor** nginx/app logs if 500 recurs.

---

## 5. Root `/` timeout

| Field | Detail |
|-------|--------|
| Probe | `GET https://app.asoftechinsightz.com/` |
| Result | Operation timed out (>30 s) on one run |
| Note | nginx returns `301` to `https://app.asoftechinsightz.com:3000/dashboard` on HEAD — **misconfigured redirect port** may confuse some clients |

**Evidence (nginx header sample):**

```
location: https://app.asoftechinsightz.com:3000/dashboard
```

**Risk:** External clients may fail or hang on marketing root URL.

---

## 6. Log collection status

| Source | Collected? | Notes |
|--------|----------|-------|
| nginx logs | **NO** | SSH required — `/var/log/nginx/` |
| app / Docker logs | **NO** | `docker logs asoftech-app` — SSH required |
| browser console | **NO** | **AUTHENTICATED VALIDATION PENDING** |
| network traces | Partial | HTTP status/timing only via PowerShell/curl |
| stack traces | **NO** | No 500 body captured in successful 200 run |

### Ops log capture commands (do not fix — collect only)

```bash
sudo tail -n 200 /var/log/nginx/error.log
sudo tail -n 200 /var/log/nginx/access.log
docker logs --tail 200 asoftech-app
docker logs --tail 100 asoftech-mongo
```

---

## 7. WS4 verdict

**WARN** — Actionable 404 on `/billing`; redirect port anomaly on root; SSH log review **pending**. No engineering fixes performed per freeze.
