# Edge Nginx 502 — Root Cause & Permanent Fix

**Date:** 4 August 2026  
**SHA (fix):** pending commit on `main`  
**Approved RC:** `6b76253`  
**Edge stack:** `/opt/asoftech-edge` (`asoftech-edge-nginx` on `asoftech_edge`)  
**App stack:** `/opt/asoftech-insightz` (`asoftech-app`)

---

## 1. Root Cause Report

### Symptom

| Check | Result |
|-------|--------|
| `docker compose build` | PASS |
| Container start / Next.js "Ready" | PASS |
| `https://app.asoftechinsightz.com/*` | **502 Bad Gateway** |
| `http://172.21.0.4:3000/api` inside app container | PASS |
| `http://127.0.0.1:3000/api` inside app container | **FAIL** (connection refused) |
| `http://172.22.0.2:3000/api` inside app container | **FAIL** (connection refused) |
| `curl http://app:3000/api` from `asoftech-edge-nginx` | **FAIL** |

### Exact root cause

**Primary (runtime bind):** Docker sets `HOSTNAME` to the container ID at runtime (`cec4818c7d13`), overriding the image `ENV HOSTNAME=0.0.0.0`. Next.js standalone `server.js` uses:

```javascript
const hostname = process.env.HOSTNAME || '0.0.0.0'
startServer({ hostname, port, ... })
```

Node resolves `HOSTNAME` via `/etc/hosts`, where the container ID maps to **both** network IPs but **getent / bind uses the first** (`172.21.0.4` on `asoftech-insightz_default`). The process listens on **`172.21.0.4:3000` only** — not `0.0.0.0`, not `127.0.0.1`, not `172.22.0.2`.

**Secondary (networking):** Production TLS is terminated by `asoftech-edge-nginx` (`/opt/asoftech-edge`), upstream `edge_app → app:3000` on external network `asoftech_edge`. The app compose file did not attach `app` to `asoftech_edge`; a manual `docker network connect` was required and was lost on rebuild. DNS `app` on the edge network resolves to `172.22.0.2`.

**Combined failure:** Edge nginx connects to `172.22.0.2:3000` while Next.js only accepts on `172.21.0.4:3000` → **502 Bad Gateway**.

### Why build succeeds but runtime fails

- Docker **build** does not run `server.js` or validate listen sockets.
- **Runtime** bind address depends on injected `HOSTNAME` + multi-homed container networking.
- RC-2 CI runs the app on a single-network GitHub Actions runner (no edge proxy), so the defect is invisible in CI.

### Classification

| Layer | Issue |
|-------|--------|
| **Docker / Compose** | Runtime `HOSTNAME` override; missing `asoftech_edge` network attachment |
| **Next.js standalone** | Uses `HOSTNAME` env for `listen()` (by design) |
| **Edge nginx** | Correct upstream (`app:3000`); target unreachable due to bind + network |
| **Application business logic** | Not involved |

### Why not other hypotheses

| Hypothesis | Verdict |
|------------|---------|
| Wrong nginx upstream name | Upstream `app:3000` is correct for edge stack |
| Missing `config/` in image | Causes 500 on some routes, not 502 at TCP level |
| `PORT` wrong | `PORT=3000` correct; socket is on 3000 |
| Host systemd nginx | Ports 80/443 owned by `asoftech-edge-nginx` container |

---

## 2. Permanent Fix Summary

1. **`docker-compose.yml`**
   - Set `environment.HOSTNAME=0.0.0.0` and `PORT=3000` so Compose overrides Docker’s injected hostname.
   - Attach `app` to external network `asoftech_edge` with alias `app` (matches edge nginx upstream).

2. **`Dockerfile`**
   - `COPY config/` into runner image (runtime asset for AEO routes; survives rebuild without `docker cp`).

No changes to `server.js`, application routes, or edge nginx config required.

---

## 3. Files Modified

| File | Change |
|------|--------|
| `docker-compose.yml` | `HOSTNAME`/`PORT` env; `asoftech_edge` network + `app` alias |
| `Dockerfile` | Copy `config/` into runner stage |
| `docs/infrastructure/EDGE_502_ROOT_CAUSE_AND_FIX.md` | This document |

---

## 4. Unified diff

```diff
diff --git a/Dockerfile b/Dockerfile
--- a/Dockerfile
+++ b/Dockerfile
@@ -33,6 +33,7 @@ USER app
 
 COPY --from=builder --chown=app:app /app/public ./public
+COPY --from=builder --chown=app:app /app/config ./config
 COPY --from=builder --chown=app:app /app/.next/standalone ./
 COPY --from=builder --chown=app:app /app/.next/static ./.next/static

diff --git a/docker-compose.yml b/docker-compose.yml
--- a/docker-compose.yml
+++ b/docker-compose.yml
@@ -7,8 +7,16 @@ services:
     ports:
       - "3000:3000"
     env_file: .env
     environment:
+      HOSTNAME: "0.0.0.0"
+      PORT: "3000"
       MONGO_URL: mongodb://mongo:27017
       DB_NAME: asoftech_saas
     depends_on:
       - mongo
     restart: always
+    networks:
+      default:
+      asoftech_edge:
+        aliases:
+          - app
 
@@ -36,6 +44,10 @@ services:
     volumes:
       - n8n-data:/home/node/.n8n
     restart: always
 
+networks:
+  asoftech_edge:
+    external: true
+
 volumes:
   mongo-data: {}
   n8n-data: {}
```

---

## 5. Rollback plan

```bash
cd /opt/asoftech-insightz
git fetch origin
git checkout main
git reset --hard <previous-sha>   # e.g. 6b76253 before this fix
docker compose build --no-cache
docker compose up -d
```

If 502 returns after rollback, re-apply this compose/network fix or temporarily:

```bash
docker network connect asoftech_edge asoftech-app --alias app
```

(Not recommended — does not fix bind address.)

---

## 6. Deployment validation checklist

Run on VPS after `docker compose build --no-cache && docker compose up -d`:

| # | Command | Expected |
|---|---------|----------|
| 1 | `docker ps --filter name=asoftech-app` | Up |
| 2 | `docker logs asoftech-app --tail 20` | Ready, no ENOENT config errors |
| 3 | `docker exec asoftech-app printenv HOSTNAME` | `0.0.0.0` |
| 4 | `docker exec asoftech-app netstat -tln \| grep 3000` | `0.0.0.0:3000` or `:::3000` |
| 5 | `docker exec asoftech-app wget -qO- http://127.0.0.1:3000/api` | `{"ok":true,...}` |
| 6 | `docker exec asoftech-edge-nginx wget -qO- http://app:3000/api` | `{"ok":true,...}` |
| 7 | `docker exec asoftech-edge-nginx wget -qO- http://asoftech-app:3000/api` | `{"ok":true,...}` |
| 8 | `curl -fsS https://app.asoftechinsightz.com/api` | `{"ok":true,...}` |
| 9 | `curl -fsS -o /dev/null -w '%{http_code}' https://app.asoftechinsightz.com/signin` | `200` |
| 10 | Public browser smoke | No 502 |

---

## 7. GO / NO-GO

| Gate | After fix |
|------|-----------|
| Edge 502 resolved | GO (when checklist passes) |
| Survives `docker compose up -d` rebuild | GO (network in compose) |
| Survives image rebuild | GO (`HOSTNAME` in compose env) |
