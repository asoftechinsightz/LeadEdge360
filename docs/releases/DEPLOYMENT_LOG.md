# Deployment Log — Controlled Pilot

**Program:** LeadEdge360 v1.0 Production VPS Deployment  
**Operator:** Cursor agent (workstation)  
**Target:** `https://app.asoftechinsightz.com` / `/opt/asoftech`  

---

## Timeline

| Time (UTC) | Phase | Action | Outcome |
|------------|-------|--------|---------|
| 2026-08-03 18:18:00 | P1 | External DNS lookup `app.asoftechinsightz.com` | A: `185.38.109.200`–`209` |
| 2026-08-03 18:18:15 | P1 | `GET /api/health` | 200 — pilot JSON, Mongo OK, SMTP/Razorpay FAIL |
| 2026-08-03 18:18:20 | P1 | `GET /api/metrics` | 200 — Prometheus metrics |
| 2026-08-03 18:18:25 | P1 | Route matrix (signin, dashboard, leads, kpis) | Mixed — auth routes 401 without session |
| 2026-08-03 18:18:30 | P1 | `GET /api/auth/me` | 200 — `configured:false` |
| 2026-08-03 18:18:35 | P1 | SSL probe via curl | TLS OK (ssl_verify=0) |
| 2026-08-03 18:18:40 | P1 | Local `git rev-parse HEAD` | FAIL — not a git repository |
| 2026-08-03 18:18:45 | P1 | `gh auth status` | FAIL — not logged in |
| 2026-08-03 18:18:50 | P1 | SSH `asoftech@187.127.179.138` | FAIL — Permission denied (publickey) |
| 2026-08-03 18:18:55 | P1 | Mandatory secrets gate | **STOP** — Razorpay + SMTP confirmed missing via health |
| 2026-08-03 18:19:00 | P2 | Backup procedures | **NOT STARTED** — blocked at P1 |
| 2026-08-03 18:19:00 | P3 | `docker compose up -d --build` | **NOT STARTED** |
| 2026-08-03 18:19:00 | P4 | Feature flag verification | **NOT STARTED** — no `.env` access |
| 2026-08-03 18:19:05 | P5 | Extended probes (`/billing`, `/api/agents`) | billing 404; agents 401 |
| 2026-08-03 18:19:10 | P6–P8 | Reports generated | See linked artifacts |

---

## Decision log

| # | Decision | Rationale |
|---|----------|-----------|
| D-01 | Halt deploy before backup | Charter: stop if mandatory secrets missing |
| D-02 | No GitHub Actions trigger | `gh` not authenticated |
| D-03 | No application code changes | Deploy-only charter |
| D-04 | No POST write smoke to production | Avoid unsolicited lead/contact records |
| D-05 | Document live ≠ RC artifact | Health/metrics endpoints differ from local RC |

---

## Artifacts produced

| File | Path |
|------|------|
| VPS deployment report | `docs/releases/VPS_DEPLOYMENT_REPORT.md` |
| Post-deployment report | `docs/releases/POST_DEPLOYMENT_REPORT.md` |
| System health report | `docs/releases/SYSTEM_HEALTH_REPORT.md` |
| Smoke test report | `docs/releases/SMOKE_TEST_REPORT.md` |
| This log | `docs/releases/DEPLOYMENT_LOG.md` |

---

## Break-glass commands (for DevOps on VPS)

```bash
# === PHASE 1 verify ===
cd /opt/asoftech
git rev-parse HEAD
git log -1 --oneline
docker -v
docker compose version
docker compose ps
df -h && free -m && uptime
sudo nginx -t && sudo systemctl status nginx --no-pager
grep -E '^(JWT_SECRET|N8N_WEBHOOK|CORS_ORIGINS|RAZORPAY|EMERGENT|SMTP|ENFORCE|WEB_JWT|AEO_SERVER)' .env | sed 's/=.*/=***/'

# === PHASE 2 backup ===
BACKUP_DIR=/opt/asoftech/backups/$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP_DIR"
docker exec asoftech-mongo mongodump --archive="$BACKUP_DIR/mongo.archive.gz" --gzip
cp .env docker-compose.yml "$BACKUP_DIR/"
docker compose images > "$BACKUP_DIR/images.txt"
sudo cp /etc/nginx/sites-enabled/* "$BACKUP_DIR/" 2>/dev/null || true
ls -la "$BACKUP_DIR"

# === PHASE 3 deploy (approved SHA) ===
git fetch --all
git reset --hard origin/main   # or <approved-sha>
docker compose up -d --build --remove-orphans
for i in $(seq 1 30); do curl -fsS http://localhost:3000/api/health && break; sleep 2; done

# === PHASE 5 smoke ===
curl -fsS https://app.asoftechinsightz.com/api/health
RC_API_BASE_URL=https://app.asoftechinsightz.com/api python backend_test.py
```

---

## Final status

| Field | Value |
|-------|-------|
| **Deployment status** | **NOT COMPLETED** |
| **Git SHA deployed** | **Unknown** (no VPS access) |
| **Docker image** | **Unknown** |
| **Application version** | Live pilot (not RC SHA) |
| **Environment** | Production pilot — `pilotMode:true` |
| **Health** | Yellow — app up, integrations incomplete |
| **Smoke** | FAIL |
| **Security** | Headers OK; secrets incomplete |
| **Deployment score** | 22 / 100 |
| **Verdict** | **NO GO** |

**STOP:** Do not enable Sprint-1 feature flags. Await Product Owner approval after successful redeploy verification.
