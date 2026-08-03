# WS1 — Production Deployment Verification

**Program:** LeadEdge360 Pilot Operations — Live Deployment Verification  
**Pilot URL:** `https://app.asoftechinsightz.com`  
**Validation date:** 2 August 2026, 12:40–12:42 UTC  
**Method:** External HTTP probes + SSH attempt (read-only)  
**Approved Pilot RC reference:** Local workspace `asoftech-insightz` with AEO Phase-1 (see `docs/aeo/AEO_PHASE1_RELEASE_VALIDATION_REPORT.md`)

---

## 1. Executive summary

| Check | Result |
|-------|--------|
| SSH inspection | **NOT COMPLETED** — `Permission denied (publickey,password)` |
| Git commit / branch on VPS | **UNKNOWN** |
| Docker image SHA / build date | **UNKNOWN** |
| AEO files in deployed container | **NOT VERIFIED** |
| Production vs approved AEO RC | **MISMATCH SUSPECTED** — live API surface differs from local RC |

---

## 2. SSH verification attempt

| Parameter | Value |
|-----------|-------|
| Target host (DNS) | `185.38.109.200` (+ 185.38.109.201–209) |
| User attempted | `asoftech` |
| Path expected | `/opt/asoftech` |
| Result | `Permission denied (publickey,password)` |
| Batch mode | Yes — no interactive password |

**Ops action required:** Run WS1 checklist from a host with `VPS_SSH_KEY` (GitHub Actions secret) or operator SSH key.

### SSH checklist (for ops — not executed here)

```bash
ssh asoftech@<VPS_HOST>
cd /opt/asoftech
git rev-parse HEAD
git branch --show-current
git log -1 --oneline
docker compose ps
docker images --format '{{.Repository}} {{.ID}} {{.CreatedAt}}' | grep asoftech
docker inspect asoftech-app --format '{{.Image}}'
docker exec asoftech-app ls -la config/aeo 2>/dev/null || echo 'NO config/aeo'
docker exec asoftech-app test -f components/aeo/AeoGrowthEngine.jsx && echo AEO_UI || echo NO_AEO_UI
grep -E '^[A-Z_]+=' .env | cut -d= -f1 | sort   # keys only, no values
```

---

## 3. External evidence collected

| Signal | Observation | Time (UTC) |
|--------|-------------|------------|
| `GET /api/` (follow redirect) | `{"ok":true,"name":"AsoftechInsightz API",...}` | 12:42:22 |
| `GET /api/health` | Extended pilot health JSON (see WS2) | 12:42:35 |
| `GET /api/metrics` | Prometheus-style metrics present | 12:42:35 |
| `GET /dashboard` | HTTP 200, ~266 ms | 12:41:22 |
| `GET /leadedge360` | HTTP 200, ~153 ms | 12:41:22 |
| `GET /billing` | HTTP **404** | 12:41:22 |
| Dashboard HTML (SSR) | Contains dashboard shell markers; **no** static `AEO` / `GROWTH ENGINE` strings | 12:42 |

---

## 4. Comparison — Approved Pilot RC vs live behavior

| Artifact (approved RC) | Expected on pilot | Live evidence |
|------------------------|-------------------|---------------|
| `config/aeo/*` | Present in container | **Not verified** (no SSH) |
| `components/aeo/AeoGrowthEngine.jsx` | Bundled in app | **Not confirmed** in SSR HTML |
| `GET /api/health` with `pilotMode` | If RC deployed | **Present on live** — but **not in local RC workspace** |
| `GET /api/metrics` with `asoftech_opportunities_*` | If extended pilot build | **Present on live** — **not in local RC** |
| `/billing` route (Phase 1) | 200 | **404** |
| App version `0.1.0` (package.json) | — | **Not exposed** in API root response |

**Conclusion:** Live pilot appears to run a **third revision** — neither the pre-Phase-1 GIX marketing build documented in June 2026 nor the local AEO Phase-1 RC workspace audited for this program.

---

## 5. Running containers / application version

| Item | Status |
|------|--------|
| Running containers | **Not inspected** (SSH blocked) |
| `asoftech-app` | Assumed per `docker-compose.yml` pattern |
| `asoftech-mongo` | Mongo connectivity **ok** via `/api/health` |
| Application version string | Not returned on `/api/` |
| Active environment | Health reports `status: "pilot"`, `pilotMode: true` |

---

## 6. WS1 verdict

| Result | Detail |
|--------|--------|
| **FAIL (incomplete)** | SSH deployment verification **blocked** |
| **WARN** | Live revision **does not match** local AEO Phase-1 RC file tree |
| **WARN** | `/billing` missing on live host |

**Cannot certify** that Pilot VPS runs the approved LeadEdge360 + AEO Phase-1 build until ops completes SSH evidence pack and reconciles git SHA with PO-approved RC tag/commit.

---

## Related

- [07_EXECUTIVE_OPERATIONS_SUMMARY.md](./07_EXECUTIVE_OPERATIONS_SUMMARY.md)  
- [docs/aeo/AEO_PHASE1_RELEASE_VALIDATION_REPORT.md](../../aeo/AEO_PHASE1_RELEASE_VALIDATION_REPORT.md)  
- [docs/PHASE1_DEPLOYMENT_VERIFICATION.md](../../PHASE1_DEPLOYMENT_VERIFICATION.md)
