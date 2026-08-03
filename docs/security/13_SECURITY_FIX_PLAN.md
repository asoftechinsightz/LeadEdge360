# Security Fix Plan (Recommendations Only)

**This audit did not implement fixes.** Phases below are for engineering after PO approval.

---

## Phase 0 — Pre-deploy (environment & ops, no code)

| # | Action | Closes |
|---|--------|--------|
| 0.1 | Set `JWT_SECRET` (32+ random bytes) | C-01 |
| 0.2 | Set `N8N_WEBHOOK_TOKEN` (random, ≠ example) | C-02 |
| 0.3 | Set `BILLING_TEST_MODE=false` | H-05 |
| 0.4 | Set `RAZORPAY_WEBHOOK_SECRET` | M-08 |
| 0.5 | Change n8n admin password | H-06 |
| 0.6 | `chmod 600 /opt/asoftech/.env` | M-12 |
| 0.7 | Restrict CORS via `CORS_ORIGINS` env | H-01 |
| 0.8 | Upgrade axios + `npm audit` clean high/critical | C-03 |
| 0.9 | nginx TLS + do not expose 3000/5678 publicly | Infra |
| 0.10 | Mongo backup job | Ops |

---

## Phase 1 — Quick code fixes (high value)

| # | Change | Finding |
|---|--------|---------|
| 1.1 | Fail startup if `JWT_SECRET` missing in production | C-01 |
| 1.2 | `ingestWebhookAllowed` reject when token unset in production | C-02 |
| 1.3 | Remove webhook `body.orgId` — use configured org map | H-03 |
| 1.4 | `findOne({ id: body.userId, orgId })` on lead assign | H-04 |
| 1.5 | Block `billing/simulate` when `NODE_ENV=production` | H-05 |
| 1.6 | Fix `next.config.js` headers (SAMEORIGIN, strict CORS) | H-01, H-02 |
| 1.7 | Remove or auth-guard `seed-reset` | M-05 |

---

## Phase 2 — Hardening

| # | Change |
|---|--------|
| 2.1 | Application rate limiting (auth, webhooks) |
| 2.2 | Mongo authentication + app credentials |
| 2.3 | Docker healthchecks |
| 2.4 | DPDP/contact field allowlists |
| 2.5 | LLM prompt field limits + output schema validation |
| 2.6 | Razorpay webhook retry on activation failure |
| 2.7 | CI `npm audit --audit-level=high` gate |

---

## Phase 3 — Continuous

| # | Activity |
|---|----------|
| 3.1 | Quarterly dependency audit |
| 3.2 | Annual penetration test on staging |
| 3.3 | Security regression in RC-2 pipeline |
| 3.4 | Secret rotation calendar (JWT, webhook, Razorpay) |

---

## Effort estimate

| Phase | Effort | Blocks deploy? |
|-------|--------|----------------|
| Phase 0 | 1–2 hours ops | **Yes** — mandatory |
| Phase 1 | 1–3 dev days | Recommended before GA |
| Phase 2 | 3–5 dev days | Before broad GA |
| Phase 3 | Ongoing | — |
