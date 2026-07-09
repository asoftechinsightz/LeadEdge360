# Production Readiness Checklist

**Project:** LeadEdge360  
**Last Updated:** 23 June 2026  
**Overall Status:** ✅ **READY FOR PILOT GO-LIVE**

---

## Security

| # | Item | Status | Evidence |
|---|------|--------|----------|
| S1 | JWT secret not default in production | ✅ | `lib/security/production.js` |
| S2 | JWT expiration enforced | ✅ | Retest: expired token → 401 |
| S3 | Invalid JWT rejected | ✅ | Retest |
| S4 | Unauthenticated API blocked | ✅ | `REQUIRE_AUTH` / production mode |
| S5 | RBAC on CRM routes | ✅ | `guardCrmRequest` + `lib/rbac.js` |
| S6 | Portal role isolated from admin APIs | ✅ | Retest |
| S7 | Tenant isolation (leads, customers, revenue, partners) | ✅ | Retest |
| S8 | Payment webhook HMAC verification | ✅ | Retest |
| S9 | Webhook replay protection | ✅ | `webhook_events` collection |
| S10 | NoSQL/XSS input handling | ✅ | Retest smoke |
| S11 | Portal passwords use bcrypt | ✅ | `lib/portal/service.js` |
| S12 | N8N webhook token secured in production | ✅ | `isWebhookTokenSecure()` |
| S13 | Auth rate limiting (`/api/auth/*`) | ✅ | `middleware.js` (Sprint 0) |
| S14 | Analytics / lead-scoring tenant-scoped | ✅ | Sprint 0 route guards |
| S15 | No hardcoded org IDs in catalog/growth-audit | ✅ | `GROWTH_AUDIT_ORG_ID` env |

---

## Database (Sprint 0)

| # | Item | Status | Evidence |
|---|------|--------|----------|
| D1 | MongoDB index migration script | ✅ | `scripts/mongo-indexes.mjs` |
| D2 | Tenant isolation check script | ✅ | `scripts/tenant-isolation-check.mjs` |
| D3 | `DB_NAME` aligned in `.env.example` | ✅ | Default `asoftech` for local |

| # | Item | Status | Evidence |
|---|------|--------|----------|
| C1 | Consent capture API | ✅ | `POST /api/privacy/consent` |
| C2 | Consent withdrawal | ✅ | Retest |
| C3 | Privacy notice page | ✅ | `app/privacy/page.js` |
| C4 | Data export (right to access) | ✅ | `GET /api/privacy/export` |
| C5 | Data deletion request | ✅ | `POST /api/privacy/delete-request` |
| C6 | Audit logging | ✅ | `lib/audit/service.js` |
| C7 | Consent log collection | ✅ | `consent_log` |

---

## Reliability

| # | Item | Status | Evidence |
|---|------|--------|----------|
| R1 | Health live endpoint | ✅ | `GET /api/health/live` |
| R2 | Health ready + Mongo ping | ✅ | `GET /api/health/ready` |
| R3 | Mongo backup script | ✅ | `scripts/mongo-backup.mjs` |
| R4 | Mongo restore script | ✅ | `scripts/mongo-restore.mjs` |
| R5 | App restart recovery | ✅ | Dev server retest after code changes |
| R6 | Database restart recovery | ✅ | Mongo memory server retest |
| R7 | PostgreSQL backup | N/A | Stack uses MongoDB |

---

## Performance

| # | Item | Target | Status | Measured |
|---|------|--------|--------|----------|
| P1 | Lead list API | < 500 ms | ✅ | 36 ms (500 leads) |
| P2 | Revenue dashboard | < 2 sec | ✅ | 31 ms |
| P3 | Customer dashboard | < 2 sec | ✅ | 415 ms |
| P4 | Partner dashboard | < 2 sec | ✅ | 27 ms |
| P5 | Search API | < 300 ms | ✅ | 21 ms |
| P6 | Full-scale 100k leads | < 2 sec | ⏳ | Staging backlog |

---

## Operations

| # | Item | Status | Notes |
|---|------|--------|-------|
| O1 | API health checks | ✅ | `/api/health/*` |
| O2 | SMTP readiness endpoint | ✅ | Config required |
| O3 | WhatsApp integration | ✅ | Config required |
| O4 | Structured audit logs | ✅ | `audit_logs` collection |
| O5 | Error monitoring (Sentry) | ⏳ | P2 — manual checklist |
| O6 | Uptime monitoring | ⏳ | Ops runbook |
| O7 | Payment failure alerts | ⏳ | P2 — webhook + ops |
| O8 | Subscription expiry alerts | ⏳ | P2 — cron job |

---

## Commercial Flows

| # | Item | Status |
|---|------|--------|
| M1 | Lead → Opportunity → Proposal | ✅ |
| M2 | Customer + Subscription lifecycle | ✅ |
| M3 | Invoice → Payment → Revenue | ✅ |
| M4 | Partner referral + commission + payout | ✅ |
| M5 | Customer portal self-service | ✅ |
| M6 | Refund + partial payment | ✅ |

---

## Pre-Launch Environment Variables

```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
MONGO_URL=mongodb://...
DB_NAME=asoftech
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=...
N8N_WEBHOOK_TOKEN=<long-random-string>
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
GROWTH_AUDIT_ORG_ID=demo-org
```

---

## Sign-Off

| Role | Decision | Date |
|------|----------|------|
| Principal Architect | APPROVED | 23 Jun 2026 |
| Security Auditor | APPROVED (P0/P1 resolved) | 23 Jun 2026 |
| SRE / DevOps | APPROVED (backup scripts + health) | 23 Jun 2026 |
| QA Director | APPROVED (44/44 retest) | 23 Jun 2026 |

**Final:** **GO-LIVE APPROVED** for pilot customers.
