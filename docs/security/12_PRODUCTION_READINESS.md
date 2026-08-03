# Production Readiness (Security Lens)

---

## Health & observability

| Item | Status | Notes |
|------|--------|-------|
| `GET /api/` health | Pass | Returns `{ ok: true }` — no DB ping |
| Metrics endpoint | Missing | No Prometheus `/metrics` |
| Graceful shutdown | Not explicit | Docker restart handles |
| Structured errors | Partial | JSON errors; some `console.error` |

---

## Error handling

| Area | Assessment |
|------|------------|
| Auth failures | Consistent 401 JSON |
| Entitlement | Structured 402/403 codes |
| Webhook failures | Razorpay returns 200 even on internal activation error (M-07) |
| Mongo connection | App may hang on getDb if Mongo down |

---

## Backup readiness

| Item | Status |
|------|--------|
| Mongo volume documented | Yes — `mongo-data` |
| Backup automation | **Not in repo** — ops responsibility |
| Restore drill | **Not evidenced** |

---

## Secrets management

| Item | Status |
|------|--------|
| `.env` on VPS | Manual — deploy merges public URLs only |
| GitHub secrets | VPS SSH + PUBLIC_URL |
| Default secrets in code | JWT, webhook bypass logic |

---

## Production readiness score (security)

| Dimension | Score / 100 |
|-----------|-------------|
| Authentication hardening | 50 |
| API / tenant isolation | 72 |
| Transport & headers | 45 |
| Dependencies | 40 |
| Container / infra | 58 |
| Billing / webhooks | 65 |
| LLM / privacy | 70 |
| Observability | 55 |
| **Overall** | **55** |

---

## Minimum gates before VPS

See [14_SECURITY_CHECKLIST.md](./14_SECURITY_CHECKLIST.md) — all **MANDATORY** items must be checked.

---

## Alignment with release program

| Program doc | Security dependency |
|-------------|---------------------|
| `docs/release/PRODUCTION_GO_LIVE_PLAYBOOK.md` | Complete security checklist first |
| `docs/release/FINAL_RELEASE_DECISION.md` | NO GO until security gates |
| RC-3 certification | Security automation 100/100 on suites; env gaps remain |
