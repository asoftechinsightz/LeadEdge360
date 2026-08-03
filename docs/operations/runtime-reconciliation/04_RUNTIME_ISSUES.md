# WS4 — Runtime Issue Investigation

**Pilot URL:** `https://app.asoftechinsightz.com`  
**Date:** 2 August 2026  
**Rule:** Evidence collection only — **no fixes applied**  
**Production modified:** **No**

---

## 1. Issue register

| ID | Symptom | Status | Blocks pilot? |
|----|---------|--------|---------------|
| I-01 | `/billing` → 404 | **Confirmed** | **Yes** — billing workspace / Phase-1 route missing |
| I-02 | `/leadedge360` intermittent 500 | **Not reproduced** latest probe (200) | **Monitor** |
| I-03 | Root `/` redirect anomaly | **Observed** (prior: Location with `:3000`) | **Warn** — marketing entry |
| I-04 | Protected APIs return 401 w/o auth | **Expected** | **No** |
| I-05 | SMTP / Razorpay not configured | **Confirmed** via `/api/health` | **Warn** — checkout/email |
| I-06 | SSH / logs not collected | **Blocked** | **Yes** for reconciliation completion |

---

## 2. I-01 — `/billing` 404

### Evidence

```
GET https://app.asoftechinsightz.com/billing
HTTP/1.1 404 Not Found
Server: nginx/1.27.5
X-Powered-By: Next.js
Content-Type: text/html; charset=utf-8
```

**Time:** 2 August 2026, ~12:47 UTC

### Root cause (determinable without SSH)

| Factor | Analysis |
|--------|----------|
| Layer | **Application (Next.js)** — nginx forwards; app returns 404 HTML |
| Likely cause | Deployed Next build **does not include** `app/(application)/billing` route present in **approved Pilot RC** |
| nginx misroute? | **Unlikely** — other app routes (`/dashboard`, `/leadedge360`) return 200 |

### Impact

- Subscription self-serve and billing success flows unavailable on live URL  
- CS scripts referencing `/billing` will fail  
- Does not necessarily block **lead CRM** pilot observation

### Blocks pilot?

**Partial** — blocks billing-led onboarding; CRM + AEO (if present) may still operate.

---

## 3. I-02 — `/leadedge360` routing

### Evidence timeline

| Probe | Result |
|-------|--------|
| Earlier post-deployment `WebFetch` | 500 |
| 2 Aug 12:41 UTC PowerShell | 200, ~153 ms |
| 2 Aug 12:47 UTC curl HEAD | 200 OK, `Content-Length: 17074` |

### Assessment

- **No stable reproduction** of 500 during this reconciliation window  
- Possible causes if 500 returns: transient app error, cold start, upstream timeout, auth/session edge case  

### Logs (not collected)

```bash
sudo tail -n 300 /var/log/nginx/error.log
sudo tail -n 300 /var/log/nginx/access.log | grep leadedge360
docker logs --tail 300 asoftech-app 2>&1 | grep -iE 'error|leadedge|500'
```

### Blocks pilot?

**No** (current) — **Monitor** if 500 recurs.

---

## 4. I-03 — Nginx / HTTP entry

### Evidence

- HTTP `http://app.asoftechinsightz.com/` → `301` to `https://app.asoftechinsightz.com/` (prior probe)
- Prior HEAD on HTTPS root showed `Location: https://app.asoftechinsightz.com:3000/dashboard` — **port 3000 in public redirect** is misconfiguration risk

### Root cause (hypothesis — confirm via nginx config on VPS)

Upstream or `proxy_redirect` may expose internal port 3000 to clients.

### Impact

Some clients may fail loading marketing home; SEO/crawler issues.

### Blocks pilot?

**Low** for authenticated app users using `/signin` or `/dashboard` directly.

---

## 5. Application logs / browser console

| Source | Collected? |
|--------|------------|
| nginx error/access | **No** — SSH required |
| `docker logs asoftech-app` | **No** — SSH required |
| Browser console | **No** — **AUTHENTICATED VALIDATION PENDING** |
| Network HAR | **No** |

---

## 6. WS4 verdict

**Investigation incomplete** for log-backed root cause of historical `/leadedge360` 500.  
**Determinable:** `/billing` 404 is **missing Next route in deployed build** vs approved RC.

**No fixes applied.**

---

## Related

- [04_RUNTIME_ISSUES.md](../live-validation/04_RUNTIME_ISSUES.md) (prior pass — cross-reference, not duplicate)  
- [01_RUNTIME_INVENTORY.md](./01_RUNTIME_INVENTORY.md)
