# WS2 — Runtime Health Validation

**Pilot URL:** `https://app.asoftechinsightz.com`  
**Validation date:** 2 August 2026  
**Method:** HTTPS probes (read-only)

---

## 1. Summary matrix

| Check | Result | Evidence |
|-------|--------|----------|
| HTTPS availability | **PASS** | TLS handshake successful; HSTS present |
| Dashboard availability | **PASS** | `GET /dashboard` → 200 (~266 ms) |
| Authentication page | **PASS** | `GET /signin` → 200 (~184 ms) |
| Health endpoint | **PASS** | `GET /api/health` → 200, JSON below |
| Metrics endpoint | **PASS** | `GET /api/metrics` → 200, text metrics |
| Mongo connectivity | **PASS** | `checks.database.ok: true` |
| Docker health | **NOT INSPECTED** | SSH required |
| SSL certificate | **PASS** (basic) | HTTPS works; nginx headers present |
| Average response time | **PASS** | See §3 |

---

## 2. Health endpoint response (captured)

**Request:** `GET https://app.asoftechinsightz.com/api/health`  
**Time:** 2026-08-02T12:42:35Z (approx)

```json
{
  "ok": true,
  "status": "pilot",
  "checks": {
    "database": { "ok": true, "detail": "connected" },
    "smtp": { "ok": false, "detail": "missing: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS" },
    "razorpay": { "ok": false, "detail": "NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing" }
  },
  "pilot": {
    "pilotMode": true,
    "productionLike": true,
    "billing": {
      "keysConfigured": false,
      "plansConfigured": false,
      "checkoutEnabled": false
    },
    "smtp": {
      "configured": false,
      "ready": false,
      "mode": "dry_run",
      "missing": ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"]
    },
    "oauthSignupEnabled": false,
    "trialProvisioningAvailable": true,
    "contactEmail": "Enquiry@asoftechinsightz.com"
  }
}
```

---

## 3. Response time samples (external probe)

| Endpoint | Status | Time (ms) |
|----------|--------|-----------|
| `/dashboard` | 200 | ~266 |
| `/leadedge360` | 200 | ~153 |
| `/signin` | 200 | ~184 |
| `/api/health` | 200 | ~100 |
| `/api/metrics` | 200 | ~95 |
| `/api/` (with redirect) | 200 | ~3823 |
| `/billing` | 404 | ~348 |
| `/api/agents` (no auth) | 401 | ~1612 |
| `/` (root) | **TIMEOUT** | >30 s (single probe) |

**Pilot baseline comparison:** No historical baseline file in repo; treat sub-500 ms page loads as acceptable for pilot observation.

---

## 4. SSL / HTTPS headers (sample)

From `curl -sI https://app.asoftechinsightz.com`:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Server: nginx/1.27.5`
- Security headers: `X-Frame-Options`, `CSP`, `Referrer-Policy`

Full SSL Labs grade: **not run** in this pass (see `docs/POST_DEPLOY_CHECKLIST.md`).

---

## 5. Metrics endpoint (sample lines)

```
asoftech_process_uptime_seconds 98515
asoftech_nodejs_heap_used_bytes 85130192
asoftech_nodejs_rss_bytes 169340928
asoftech_active_tenants 0
asoftech_active_users_24h 0
asoftech_leads_created_total 0
asoftech_opportunities_won_total 0
asoftech_pos_transactions_total 0
asoftech_mrr_inr 0
```

**Note:** Metrics include `opportunities` and `pos_transactions` — indicates extended pilot build not present in local AEO RC workspace.

---

## 6. Warnings

| ID | Issue | Severity |
|----|-------|----------|
| W-01 | SMTP not configured | Medium — email notifications dry-run |
| W-02 | Razorpay keys missing | Medium — checkout disabled |
| W-03 | Root `/` timeout on one probe | Low — investigate nginx/upstream |
| W-04 | `active_tenants: 0` on metrics | Info — may reflect metric definition |

---

## 7. WS2 verdict

**PASS WITH CONDITIONS** — Core HTTPS, health, metrics, and Mongo connectivity are healthy; billing/SMTP integration degraded; Docker container health not SSH-verified.
