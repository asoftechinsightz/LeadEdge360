# LeadEdge360 — Production Rollback Guide

**Release:** R1.1 Foundation GA  
**Audience:** DevOps · Infrastructure · Eng on-call  
**Last updated:** 3 August 2026  
**Target recovery time:** < 5 minutes for flag rollback; < 30 minutes for full deploy rollback  

---

## 1. When to rollback

| Severity | Condition | Action |
|----------|-----------|--------|
| **P1** | Cross-tenant data leak, payment corruption, app down | Flag rollback + incident; consider full deploy rollback |
| **P1** | Mongo data corruption | Stop writes; restore from backup |
| **P2** | Widespread 402/403 after flag ON | Roll back offending flag |
| **P2** | Bridge auth confusion blocking users | `WEB_JWT_BRIDGE=false` |
| **P3** | AEO profile save errors | `AEO_SERVER_PROFILE=false` |
| **P3** | n8n webhook failures | Fix token/workflow; flags may stay ON |

**PO must be notified** for any production rollback affecting pilot tenant.

---

## 2. Rollback types

| Type | Scope | Data impact | Time |
|------|-------|-------------|------|
| **R1 — Flag rollback** | Env vars only | None | ~5 min |
| **R2 — App redeploy** | Previous git commit | None | ~15 min |
| **R3 — Compose service restart** | Single container | None | ~2 min |
| **R4 — Mongo restore** | Database point-in-time | Last backup window | 30–120 min |

---

## 3. R1 — Feature flag rollback (preferred)

### 3.1 Full Sprint 1 disable (safe default)

On VPS:

```bash
cd /opt/asoftech
sudo sed -i 's/^ENFORCE_PLAN_LIMITS=.*/ENFORCE_PLAN_LIMITS=false/' .env
sudo sed -i 's/^WEB_JWT_BRIDGE=.*/WEB_JWT_BRIDGE=false/' .env
sudo sed -i 's/^AEO_SERVER_PROFILE=.*/AEO_SERVER_PROFILE=false/' .env
# Optional: clear grandfather
sudo sed -i 's/^GRANDFATHER_ORG_IDS=.*/GRANDFATHER_ORG_IDS=/' .env
docker compose up -d app
```

### 3.2 Single flag rollback

| Symptom | Set |
|---------|-----|
| Plan limit errors | `ENFORCE_PLAN_LIMITS=false` |
| Bridge / cookie API issues | `WEB_JWT_BRIDGE=false` |
| AEO save issues | `AEO_SERVER_PROFILE=false` |

Then: `docker compose up -d app`

### 3.3 Verify after R1

```bash
curl -fsS "https://<PUBLIC_URL>/api/" | jq .
docker compose logs app --tail 50
```

| Check | Expected after full R1 |
|-------|------------------------|
| `GET /api/` | `ok: true` |
| Cookie `/api/followups` | 404 (bridge off) |
| Lead create | No 402 from limits |
| Mobile JWT | Unchanged |
| Server AEO data | Still in Mongo (retained) |

---

## 4. R2 — Application deploy rollback

Use when bad **code** on `main`, not flag-related.

### 4.1 Via git on VPS

```bash
cd /opt/asoftech
git fetch --all
git reset --hard <previous-known-good-commit-sha>
docker compose up -d --build --remove-orphans
docker image prune -f
```

### 4.2 Via GitHub

1. Revert commit on `main` or reset branch to good SHA.
2. Push — triggers `Deploy to VPS` workflow.
3. Confirm Actions green + smoke.

### 4.3 Verify

- Health check
- Login smoke
- `GET /api/leads` for test user

---

## 5. R3 — Service restart (no config change)

```bash
cd /opt/asoftech
docker compose restart app
# or full stack:
docker compose restart
```

Use for transient Node OOM or stuck connections. **Not sufficient** for bad config.

---

## 6. R4 — Mongo restore

**Only for database corruption or accidental mass delete.**

### Preconditions

- Stop app writes: `docker compose stop app`
- Identify backup snapshot timestamp
- PO + Infra approval

### High-level steps

1. `docker compose stop app`
2. Restore `mongo-data` volume from backup (procedure per Infra runbook)
3. `docker compose start mongo` — verify `mongosh ping`
4. `docker compose start app`
5. CS validate pilot tenant data scope
6. Document incident

**Sprint 1 flags do not require schema rollback** — no new collections were added for flags alone.

---

## 7. Rollback decision matrix

| Flag state | Rollback to | Mobile JWT | Cookie CRM | AEO data |
|------------|-------------|------------|------------|----------|
| ON ON ON → OFF OFF OFF | R1 | OK | Pre-E-002 behavior | Retained in DB |
| ON ON OFF → ON OFF OFF | R1 bridge only | OK | Bridge 404 | Retained |
| ON OFF OFF → OFF OFF OFF | R1 enforce only | OK | No 402 limits | Retained |

---

## 8. Communication

### Internal (immediate)

```
ROLLBACK: LeadEdge360 [R1/R2/R3/R4]
Time: <UTC>
Flags: ENFORCE=<v> BRIDGE=<v> AEO=<v>
Reason: <1 line>
Status: investigating / stable
Lead: <on-call>
```

### Pilot tenant (CS)

```
We have temporarily reverted a configuration change on LeadEdge360.
Your data is safe. Impact: <brief>. Next update by: <time>.
```

---

## 9. Post-rollback

| # | Action | Owner |
|---|--------|-------|
| 1 | Capture logs (`docker compose logs app --tail 500`) | DevOps |
| 2 | Export relevant `audit_logs` window | Eng |
| 3 | Root cause ticket | Eng |
| 4 | Update [FINAL_RELEASE_DECISION.md](./FINAL_RELEASE_DECISION.md) if gates reopen | PO |
| 5 | Re-run RC-2 Validation before re-attempt | DevOps |
| 6 | Rollback drill retrospective within 48h | PO |

---

## 10. Rollback drill (staging)

Before production pilot, execute on **staging**:

1. Enable ON ON ON
2. Run WS3 smoke subset
3. Execute R1 full flag OFF
4. Confirm behavior matches Phase 0
5. Record elapsed time and issues

**Drill log template:**

| Date | Environment | Type | Time to stable | Issues |
|------|-------------|------|----------------|--------|
| | staging | R1 | | |

---

## 11. Related documents

- [FEATURE_FLAG_ROLLOUT_PLAN.md](./FEATURE_FLAG_ROLLOUT_PLAN.md)
- [PRODUCTION_GO_LIVE_PLAYBOOK.md](./PRODUCTION_GO_LIVE_PLAYBOOK.md)
- [PRODUCTION_MONITORING_GUIDE.md](./PRODUCTION_MONITORING_GUIDE.md)
