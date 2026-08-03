# System Health Report — Production Pilot

**Date:** 3 August 2026  
**Host:** `https://app.asoftechinsightz.com`  
**Collection method:** External HTTPS probes + `/api/health` + `/api/metrics`  
**VPS shell metrics:** **Not collected** (SSH unavailable)  

---

## Executive summary

| Area | Status |
|------|--------|
| Application | **Healthy** — HTTP 200, pilot mode |
| Database | **Healthy** — Mongo connected |
| SMTP | **Degraded** — not configured |
| Razorpay | **Degraded** — keys missing |
| Nginx / TLS | **Healthy** — nginx 1.27.5, TLS OK |
| Docker (host) | **Unknown** |
| Overall health | **YELLOW** |

---

## Application metrics (from `/api/metrics`)

| Metric | Value | Interpretation |
|--------|-------|----------------|
| `asoftech_process_uptime_seconds` | 22482 | ~6.2 h uptime |
| `asoftech_nodejs_heap_used_bytes` | 70710504 | ~67 MB heap |
| `asoftech_nodejs_rss_bytes` | 141127680 | ~135 MB RSS |
| `asoftech_active_tenants` | 0 | No active tenant sessions in metric |
| `asoftech_active_users_24h` | 1 | Low traffic |
| `asoftech_leads_created_total` | 0 | No leads in counter window |
| `asoftech_mrr_inr` | 0 | No MRR |

---

## Host resources (not collected)

| Resource | Target | Actual |
|----------|--------|--------|
| CPU load | < 70% sustained | **N/A** |
| Memory available | > 20% free | **N/A** |
| Disk free | > 30% | **N/A** |
| Mongo data volume | Monitored | **N/A** |

**Required on VPS:**

```bash
df -h
free -m
uptime
docker stats --no-stream
docker compose ps
docker compose logs --tail=100 app
```

---

## Component status

### MongoDB

| Check | Result |
|-------|--------|
| App connectivity | **PASS** (`database.ok: true`) |
| Auth enabled in compose | **Unknown** |
| Backup recency | **Unknown** |

### Docker

| Check | Result |
|-------|--------|
| Containers running | **Unknown** |
| Image rebuild after deploy | **Not performed** |
| Healthchecks in compose | Not defined in RC `docker-compose.yml` |

### Nginx

| Check | Result |
|-------|--------|
| Serving HTTPS | **PASS** |
| Version | `nginx/1.27.5` |
| Security headers | **PASS** (frame, CSP, referrer) |
| Config backup | **Not performed** |

### SSL

| Check | Result |
|-------|--------|
| Certificate valid | **PASS** (HTTPS succeeds) |
| Expiry date | **Not verified** on host |

```bash
# On VPS or from ops host
echo | openssl s_client -connect app.asoftechinsightz.com:443 -servername app.asoftechinsightz.com 2>/dev/null | openssl x509 -noout -dates
```

---

## Application logs / errors

| Source | Status |
|--------|--------|
| `docker compose logs app` | **Not collected** |
| Nginx error log | **Not collected** |
| Mongo logs | **Not collected** |

No application error bodies observed in external GET probes.

---

## Error-rate proxy (external)

| Endpoint | Errors observed |
|----------|-----------------|
| `/api/health` | None |
| `/api/leads` | 401 (expected without auth) |
| `/billing` | 404 |
| `/api/agents` | 401 |

---

## Health score

| Dimension | Score / 100 |
|-----------|-------------|
| App availability | 95 |
| Data layer | 90 |
| Integrations | 25 |
| Infra visibility | 10 |
| Observability | 70 |
| **Weighted overall** | **58 / 100** |

---

## Recommendations

1. **SSH or CI deploy access** — collect host CPU/memory/disk and Docker state.
2. **Configure SMTP and Razorpay** — clears yellow integration status.
3. **Schedule Mongo backup** — not evidenced in repo automation.
4. **After RC deploy** — compare metrics baseline pre/post deploy.
5. **Alerting** — wire `/api/health` to UptimeRobot or equivalent (see `docs/SECURITY_HARDENING.md`).

---

## Related

- [VPS_DEPLOYMENT_REPORT.md](./VPS_DEPLOYMENT_REPORT.md)
- [SMOKE_TEST_REPORT.md](./SMOKE_TEST_REPORT.md)
