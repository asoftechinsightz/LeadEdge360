# VPS Access Report

**Date:** 3 August 2026  
**Program:** LeadEdge360 Infrastructure Enablement (no application changes)  
**Auditor:** Operator workstation via SSH alias `asoftech-vps`  

---

## Executive summary

Production LeadEdge360 runs on host **`leadedge360`** (`187.127.179.138`). **SSH access is available** to `root` using the approved local key `C:\Users\ARNAV\.ssh\asoftech_vps` via SSH config host **`asoftech-vps`**.

**Critical infrastructure gap:** Documented deploy path **`/opt/asoftech`** does **not** match the **actual** application root **`/opt/asoftech-insightz`**. GitHub Actions `deploy.yml` and ops runbooks reference the wrong directory.

---

## Deployment target (actual vs documented)

| Attribute | Documented (repo / deploy.yml) | **Actual (verified on VPS)** |
|-----------|-------------------------------|------------------------------|
| **Primary hostname** | `app.asoftechinsightz.com` | Same — serves via edge nginx |
| **VPS hostname** | — | `leadedge360` |
| **SSH IP (management)** | Mixed refs: `185.38.109.x`, `187.127.179.138` | **`187.127.179.138`** (SSH works) |
| **Public DNS A records** | — | `185.38.109.200`–`209` (anycast / CDN-style pool) |
| **SSH port** | `22` (default) | **22** |
| **SSH user (working)** | `asoftech` (deploy.yml) | **`root`** (via `asoftech-vps` config) |
| **SSH user (failed)** | `asoftech@185.38.109.200` | Permission denied |
| **Deployment directory** | `/opt/asoftech` | **`/opt/asoftech-insightz`** |
| **Docker Compose file** | `/opt/asoftech/docker-compose.yml` | **`/opt/asoftech-insightz/docker-compose.yml`** |
| **`.env` file** | `/opt/asoftech/.env` | **`/opt/asoftech-insightz/.env`** |
| **Git remote** | Generic GitHub clone | `git@github.com:arnav02champ/AsoftechLeadEdge360.git` |
| **Legacy `/opt/asoftech`** | Expected app root | **Exists** — only `backups/` + `releases/` (no app) |

---

## Production topology (documented)

```
                    Internet
                        │
         DNS: app.asoftechinsightz.com → 185.38.109.200–209
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│  Host: leadedge360 (187.127.179.138)                       │
│  OS: Ubuntu, kernel 7.0.0-27-generic                      │
│  Disk: /dev/sda1 193G (66% used, 68G free)                 │
│  RAM: 16 GB (≈11 GB available)                            │
├───────────────────────────────────────────────────────────┤
│  Edge TLS / routing                                        │
│  • Container: asoftech-edge-nginx (nginx:1.27-alpine)      │
│  • Config: /opt/asoftech-edge/nginx.conf (bind-mount)      │
│  • TLS: /etc/letsencrypt (bind-mount)                      │
│  • Host nginx 1.28.3 present but systemctl nginx: failed   │
│    (edge container is primary publisher for app traffic)   │
├───────────────────────────────────────────────────────────┤
│  LeadEdge360 app stack (/opt/asoftech-insightz)             │
│  • asoftech-app → image asoftech-insightz-app (healthy)    │
│  • asoftech-mongo → mongo:7 (healthy)                      │
│  • asoftech-n8n → n8nio/n8n:1.110.0                        │
│  • App bind: 127.0.0.1:3000                                │
├───────────────────────────────────────────────────────────┤
│  Adjacent stacks (same host)                               │
│  • asoftech-marketing (asoftech-marketing:v2.0.0-cosmic)    │
│  • OpsEdge360 (web, api-gateway, postgres, kafka, …)       │
│  • observability: prometheus, grafana, cadvisor, …         │
└───────────────────────────────────────────────────────────┘
```

### Nginx locations

| Layer | Path | Role |
|-------|------|------|
| **Active edge** | `/opt/asoftech-edge/nginx.conf` | Unified reverse proxy (app, marketing, opsedge, n8n) |
| **Host nginx sites** | `/etc/nginx/sites-available/asoftech` | Legacy/alternate config (upstream `127.0.0.1:3000`) |
| **Host sites-enabled** | `/etc/nginx/sites-enabled/asoftech` | Symlink to sites-available |
| **Certbot webroot** | `/var/www/certbot` | ACME challenge (edge container mount) |

### SSL

| Field | Value |
|-------|-------|
| Certificate | Let's Encrypt |
| Subject | `CN=asoftechinsightz.com` |
| Valid from | 19 Jun 2026 |
| Valid until | **17 Sep 2026** |
| Probe | HTTPS to `app.asoftechinsightz.com` — OK |

---

## Docker environment

| Tool | Version |
|------|---------|
| Docker | **29.5.3** |
| Docker Compose | **v5.1.4** |

### LeadEdge360 compose services (`/opt/asoftech-insightz`)

| Service | Container | Image | Status |
|---------|-----------|-------|--------|
| app | `asoftech-app` | `asoftech-insightz-app` | Up 6h (healthy) |
| mongo | `asoftech-mongo` | `mongo:7` | Up 3 weeks (healthy) |
| n8n | `asoftech-n8n` | `n8nio/n8n:1.110.0` | Up 6 days |

---

## Access paths for operators

| Method | Status | Notes |
|--------|--------|-------|
| SSH `asoftech-vps` → `root@187.127.179.138:22` | **WORKS** | Key: `~/.ssh/asoftech_vps` |
| SSH `asoftech@185.38.109.200` | **FAIL** | Permission denied (publickey) |
| SSH `asoftech@app.asoftechinsightz.com` | **FAIL** | Permission denied (publickey) |
| SSH `asoftech@187.127.179.138` with same key | **FAIL** | Permission denied — use **root** |
| GitHub Actions deploy | **UNVERIFIED** | `gh` not authenticated on workstation |
| HTTPS public API | **WORKS** | `/api/health` 200 |

---

## Blockers for automated deploy (infrastructure)

1. **`deploy.yml` targets `/opt/asoftech`** — actual app at **`/opt/asoftech-insightz`**.
2. **Deploy user mismatch** — workflow assumes `VPS_USER` with docker; working break-glass access is **`root`** via ops key (document `asoftech` + `asoftech_ci` for CI).
3. **DNS vs SSH IP** — public DNS uses `185.38.109.x`; SSH management IP is `187.127.179.138`.
4. **GitHub CLI / secrets** — not verified from workstation (see [SSH_VALIDATION_REPORT.md](./SSH_VALIDATION_REPORT.md)).

---

## Recommendations (infrastructure only)

1. Update `deploy.yml` and runbooks: `cd /opt/asoftech-insightz` (or symlink `/opt/asoftech` → insightz tree).
2. Register **`asoftech_ci`** public key for `asoftech` user with docker group; restrict root SSH if policy requires.
3. Document canonical SSH target: **`187.127.179.138`**, port **22**, user **`root`** (ops) / **`asoftech`** (CI).
4. Align `VPS_HOST` secret with SSH-reachable IP, not only CDN DNS pool.

**No deployment performed.** Await infrastructure approval.
