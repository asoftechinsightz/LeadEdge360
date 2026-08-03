# WS1 — SSH Runtime Inventory

**Program:** LeadEdge360 Pilot Runtime Reconciliation  
**Pilot URL:** `https://app.asoftechinsightz.com`  
**Collection window:** 2 August 2026, ~12:40–12:48 UTC  
**Operator:** Read-only validation agent (no VPS SSH key on host)  
**Production modified:** **No**

---

## 1. Executive summary

| Required artifact | Status |
|-------------------|--------|
| Git commit SHA | **NOT IDENTIFIED** |
| Active branch | **NOT IDENTIFIED** |
| `git status` | **NOT COLLECTED** |
| Docker image IDs | **NOT IDENTIFIED** |
| Container IDs | **NOT IDENTIFIED** |
| Image creation timestamps | **NOT IDENTIFIED** |
| `docker compose ps` | **NOT COLLECTED** |
| Running application version | **NOT EXPOSED** via public API |

**WS1 result:** **BLOCKED** — SSH access to Pilot VPS not available from validation environment.

---

## 2. SSH attempts (evidence log)

| # | Target | Port | Result | Detail |
|---|--------|------|--------|--------|
| 1 | `asoftech@185.38.109.200` | 22 | **Fail** | `Permission denied (publickey,password)` |
| 2 | `asoftech@app.asoftechinsightz.com` | 22 | **Fail** | `Host key verification failed` |
| 3 | `asoftech@187.127.179.138` | 22 | **Fail** | `Connection timed out` |

### DNS context

| Query | Result |
|-------|--------|
| `app.asoftechinsightz.com` A | `187.127.179.138` (authoritative probe 12:47 UTC) |
| Earlier probe | Multiple `185.38.109.x` (non-authoritative / resolver variance) |

**Note:** HTTPS to `app.asoftechinsightz.com` succeeds while direct SSH to resolved A record times out — consistent with **SSH restricted to allowlist**, **non-standard SSH port**, or **firewall blocking validation host**.

---

## 3. External runtime fingerprint (non-SSH)

Collected without modifying production:

| Signal | Value | Time (UTC) |
|--------|-------|------------|
| `GET /api/health` | `status: "pilot"`, `pilotMode: true`, Mongo connected | 12:47:59 |
| `GET /api/metrics` | `asoftech_process_uptime_seconds` ≈ 98,854 (~27.5 h) | 12:48:15 |
| `Server` header | `nginx/1.27.5` | — |
| `X-Powered-By` (billing 404) | `Next.js` | 12:47:58 |
| TLS | HTTPS functional, HSTS present | — |

**Application version string:** Not returned on `GET /api/` (`ok`, `name`, `time` only).

---

## 4. Ops handoff — commands to complete WS1

Run from a host with authorized SSH key (GitHub Actions `VPS_SSH_KEY` or operator key):

```bash
ssh -p <PORT> asoftech@<VPS_HOST>
hostname
cd /opt/asoftech
git rev-parse HEAD
git branch --show-current
git status
git log -1 --oneline
docker compose ps
docker images --format 'table {{.Repository}}\t{{.ID}}\t{{.CreatedSince}}\t{{.CreatedAt}}'
docker inspect asoftech-app --format 'Image={{.Image}} Name={{.Name}} State={{.State.Status}}'
docker exec asoftech-app node -e "console.log(process.version)" 2>/dev/null || true
grep -E '^VERSION|version' package.json 2>/dev/null || cat package.json | head -5
```

Paste outputs into an addendum to this document — **do not commit secrets**.

---

## 5. Success criteria mapping

| Criterion | Met? |
|-----------|------|
| Live Git SHA identified | **No** |
| Running Docker image identified | **No** |
| No production changes | **Yes** |

---

## Related

- [06_EXECUTIVE_RUNTIME_ASSESSMENT.md](./06_EXECUTIVE_RUNTIME_ASSESSMENT.md)  
- [docs/operations/live-validation/01_DEPLOYMENT_VERIFICATION.md](../live-validation/01_DEPLOYMENT_VERIFICATION.md)
