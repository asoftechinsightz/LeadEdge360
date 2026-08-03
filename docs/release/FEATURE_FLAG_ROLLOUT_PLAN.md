# LeadEdge360 — Feature Flag Rollout Plan

**Release:** R1.1 Foundation GA  
**Flags:** E-004 · E-002 · E-003  
**Last updated:** 3 August 2026  

---

## 1. Flags in scope

| Environment variable | Epic | Default | When ON |
|---------------------|------|---------|---------|
| `ENFORCE_PLAN_LIMITS` | E-004 | `false` | Plan caps enforced; 402/403 on limits |
| `WEB_JWT_BRIDGE` | E-002 | `false` | Cookie session can access bridged mobile API roots |
| `AEO_SERVER_PROFILE` | E-003 | `false` | AEO profile persisted server-side on `users.preferences` |
| `GRANDFATHER_ORG_IDS` | E-004 | empty | Comma-separated org IDs exempt from limits (optional) |

**Bridged API roots (E-002):** `followups`, `admin`, `wa` (and related paths) — see `lib/request-actor.js` `BRIDGE_ROOTS`.

---

## 2. Rollout philosophy

1. **Baseline first** — all flags OFF matches pre-Sprint-1 production behavior for cookie CRM paths.
2. **One flag dimension at a time** — limits → bridge → server AEO profile.
3. **PO gate** between phases — no automatic progression.
4. **Pilot tenant only** until 7-day observation complete.
5. **Grandfather** only with explicit PO approval (typically Tenant #1).

---

## 3. Phase matrix

| Phase | ENFORCE | BRIDGE | AEO | Duration | Primary validation |
|-------|---------|--------|-----|----------|-------------------|
| **0 — Baseline** | OFF | OFF | OFF | 48–72h | CRM, leads, dashboard, billing UI |
| **1 — Limits** | ON | OFF | OFF | 48h min | 402 at cap, grandfather, retail 403 |
| **2 — Bridge** | ON | ON | OFF | 48h min | Cookie followups/admin, JWT unchanged |
| **3 — Full Sprint 1** | ON | ON | ON | 7d min | Server AEO save, audit `aeo.profile.updated` |

Automation pre-validated all four combinations (24/24 unit checks in RC-2). **Live production validation still required.**

---

## 4. Phase 0 — Baseline (OFF OFF OFF)

### Configuration

```env
ENFORCE_PLAN_LIMITS=false
WEB_JWT_BRIDGE=false
AEO_SERVER_PROFILE=false
```

### Expected behavior

| Surface | Behavior |
|---------|----------|
| Lead create | No plan-based 402 |
| Cookie `/api/followups` | 404 (bridge disabled) |
| Mobile JWT `/api/followups` | Normal JWT handlers |
| AEO profile | Client sessionStorage only |
| Leads / KPIs / billing routes | Legacy cookie paths |

### Validation

- [ ] `npm run test:aeo` equivalent smoke on prod read paths
- [ ] Dashboard KPI load acceptable
- [ ] No spike in 402/403

### Rollback trigger

P1 app instability unrelated to flags — standard incident response; flags already OFF.

---

## 5. Phase 1 — Plan enforcement (ON OFF OFF)

### Configuration

```env
ENFORCE_PLAN_LIMITS=true
WEB_JWT_BRIDGE=false
AEO_SERVER_PROFILE=false
GRANDFATHER_ORG_IDS=<tenant-1-org-id>   # only if PO approved
```

### Expected behavior

| Action | Starter | Growth | Scale |
|--------|---------|--------|-------|
| Lead create over cap | 402 | 402 | Allowed |
| Retail on starter | 403 | Per plan | Per plan |
| Admin user create over cap | 402 | 402 | Allowed |
| Webhook lead ingest over cap | 402 | 402 | Allowed |
| Grandfather org | Exempt | Exempt | Exempt |

### Monitoring

- 402 rate on `POST /api/leads`, products, webhooks
- CS: user sees toast on limit (UI)
- Audit: `subscription.activated` after payment

### Rollback

Set `ENFORCE_PLAN_LIMITS=false`, redeploy. **No data loss.**

### Rollback trigger

- Wrongful 402 for paying customers
- Grandfather misconfiguration affecting billing trust

---

## 6. Phase 2 — Cookie bridge (ON ON OFF)

### Configuration

```env
ENFORCE_PLAN_LIMITS=true
WEB_JWT_BRIDGE=true
AEO_SERVER_PROFILE=false
```

### Expected behavior

| Client | Path | Result |
|--------|------|--------|
| Cookie session | `/api/followups` | 200, org-scoped |
| Cookie session | `/api/leads` | Legacy handler (not bridged) |
| JWT Bearer | `/api/followups` | JWT handler (unchanged) |
| Agent cookie | `/api/admin/users` | 403 |
| Admin cookie | `/api/admin/users` | 200 |

### Monitoring

- Bridge 404 vs 401 confusion (misconfigured clients)
- 403 on admin for agents
- Cross-tenant isolation (must remain 0 incidents)

### Rollback

Set `WEB_JWT_BRIDGE=false`, redeploy. Mobile JWT clients unaffected.

### Rollback trigger

- Cross-tenant data exposure (P1 — rollback all flags, incident)
- Cookie users see wrong org data

---

## 7. Phase 3 — Server AEO profile (ON ON ON)

### Configuration

```env
ENFORCE_PLAN_LIMITS=true
WEB_JWT_BRIDGE=true
AEO_SERVER_PROFILE=true
```

### Expected behavior

| Feature | Behavior |
|---------|----------|
| AEO Growth Engine load | Hydrate from `GET /api/users/me` preferences |
| Profile edit | Debounced `PATCH /api/users/me` |
| Audit | `aeo.profile.updated` in `audit_logs` |
| Flag OFF later | Data retained in Mongo; client may fall back to session |

### CS actions

- Spot-check 10 users: profile persists across browser refresh
- Verify invalid URL rejected server-side

### Monitoring

- `PATCH /api/users/me` rate and errors
- Audit log volume
- AEO page load latency

### Rollback

Set `AEO_SERVER_PROFILE=false`. **Server data retained.**

### Rollback trigger

- Profile corruption / merge bugs
- Excessive PATCH volume impacting Mongo

---

## 8. Execution procedure (DevOps)

For each phase:

1. Edit `/opt/asoftech/.env` with new flag values.
2. `chmod 600 .env`
3. `docker compose up -d --build` (or restart app if env-only change: `docker compose up -d app`)
4. Smoke: `curl $PUBLIC_URL/api/`
5. CS executes phase validation checklist (see staging WS3 items).
6. PO documents approval in release tracker.
7. Monitor per [PRODUCTION_MONITORING_GUIDE.md](./PRODUCTION_MONITORING_GUIDE.md) for phase duration.

**Do not change flags during active CS demo windows.**

---

## 9. Communication templates

### To pilot tenant (phase advance)

> We are enabling [feature name] for your organization on [date/time UTC]. Expected impact: [brief]. Support: [channel]. Rollback window: [hours].

### Internal (Slack)

> Flag phase [N] starting: ENFORCE=[x] BRIDGE=[x] AEO=[x]. On-call: [name]. Rollback: PRODUCTION_ROLLBACK_GUIDE.md §3.

---

## 10. Decision log template

| Date | Phase | PO approver | Tenant org ID | Grandfather | Notes |
|------|-------|-------------|---------------|-------------|-------|
| | 0 | | | | |
| | 1 | | | | |
| | 2 | | | | |
| | 3 | | | | |
