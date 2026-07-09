# Observability360 — Security Report

**Date:** 3 July 2026  
**Prior audits:** `SECURITY_AUDIT_REPORT.md`, `docs/SECURITY_AUDIT.md` (Jun 2026)

---

## 1. Security Checklist

| Control | Status | Score | Notes |
|---------|--------|-------|-------|
| **JWT** | ✅ | 90% | HS256, refresh rotation, prod secret enforcement |
| **RBAC** | ✅ | 88% | 6 roles, `guard*Request` pattern |
| **Secrets management** | ✅ | 82% | `assertProductionSecrets()` on ready probe |
| **Password hashing** | ✅ | 90% | bcrypt OTP codes |
| **Encryption at rest** | ⚠️ | 70% | Integration creds AES-256-GCM; Mongo relies on infra |
| **HTTPS** | ✅ | 90% | nginx TLS, HSTS, certbot |
| **CORS** | ⚠️ | 60% | `Access-Control-Allow-Origin: *` on API |
| **Rate limiting** | ✅ | 85% | Edge + Mongo OTP/login + nginx |
| **SQL injection** | N/A | — | MongoDB — use parameterized queries ✅ |
| **XSS** | ⚠️ | 75% | React default escaping; audit user-generated content |
| **CSRF** | ⚠️ | 70% | Cookie + SameSite — verify all mutations |
| **Dependency vulnerabilities** | ✅ | 95% | Last scan 2026-06-28: 0 issues |
| **Tenant isolation** | ⚠️ | 78% | S0 fixes applied; retest required |
| **Webhook auth** | ✅ | 85% | Razorpay signature, n8n token, cron secret |
| **Metrics endpoint** | ✅ | 88% | Token + IP allowlist |

---

## 2. Authentication Detail

```
Request → middleware.js (rate limit)
       → resolveTenant() / requireAuthenticatedTenant()
       → guard*Request() (RBAC + plan + feature)
       → service layer
```

| Surface | Auth model |
|---------|------------|
| Suite API | JWT bearer + cookie session |
| Portal | Separate portal JWT |
| Mobile API | Token in `lib/mobile-routes.js` |
| Public growth | Slug/token based |
| Metrics | `METRICS_TOKEN` optional |
| Cron/scheduler | `CRON_SECRET` header |

---

## 3. RBAC Matrix (summary)

| Role | CRM | Growth | Revenue | Ops | Observability360 (planned) |
|------|-----|--------|---------|-----|---------------------------|
| SUPER_ADMIN | Full | Full | Full | Full | Full |
| ORG_ADMIN | Full | Full | Full | Read | Admin |
| SALES_MANAGER | CRM | Read | Read | — | Read dashboards |
| SALES_EXECUTIVE | Own leads | — | — | — | — |
| FINANCE | Read | — | Full | — | Cost/carbon views |
| PARTNER | Limited | — | Commissions | — | — |

Full matrix: `docs/audit/PERMISSION_MATRIX.md`

---

## 4. Secrets & Encryption

| Secret | Storage | Risk |
|--------|---------|------|
| `JWT_SECRET` | Env | Low if 256-bit prod key |
| `RAZORPAY_KEY_SECRET` | Env | Low |
| Integration OAuth tokens | Mongo encrypted (`lib/integrations/crypto.js`) | Medium — fallback key to JWT_SECRET |
| `INTEGRATION_ENCRYPTION_KEY` | Env optional | **Set dedicated key in prod** |
| Mongo credentials | `MONGO_URL` env | Standard |

---

## 5. Observability360 Security Requirements

| Requirement | Trinetra360 status | Gap |
|-------------|-------------------|-----|
| OTLP ingestion auth | Dev: open; prod: needs API key | Configure in Sprint 6 |
| Agent mTLS | Not implemented | Sprint 2 (agent management) |
| CMDB data classification | Attributes JSONB | Add sensitivity tags |
| Audit log for CI changes | ✅ `audit_log` table | Wire to Suite audit |
| FedRAMP controls | ✅ Governance service | Enterprise tier only |
| SIEM webhook | ✅ Security service | Integrate |

---

## 6. Dependency & Container Security

| Tool | Path | Last result |
|------|------|-------------|
| `npm run security:audit` | `scripts/security/dependency-audit.mjs` | Pass |
| OWASP verify | `scripts/security/owasp-verify.mjs` | Pass |
| Container scan | `scripts/security/container-scan.sh` | Manual |
| CI | `.github/workflows/security-scan.yml` | On PR/push |

---

## 7. Penetration Test Readiness

| Item | Status |
|------|--------|
| `docs/PEN_TEST_CHECKLIST.md` | ✅ Exists |
| External pen test | ❌ Not completed — blocks public GA |
| Tenant isolation script | ✅ `tenant-isolation-check.mjs` |
| Auth brute force protection | ✅ |

---

## 8. Security Recommendations (priority)

| Priority | Action | Sprint |
|----------|--------|--------|
| P0 | Tighten CORS to `CORS_ORIGINS` env list | Sprint 1 cleanup |
| P0 | Dedicated `INTEGRATION_ENCRYPTION_KEY` in prod | Sprint 1 |
| P1 | OTLP API key / tenant header on ingest | Sprint 6 |
| P1 | Re-run tenant isolation after Observability360 routes | Each sprint |
| P2 | Agent mTLS for discovery | Sprint 2 |
| P2 | External pen test before Banking360 GA | Sprint 10 |

---

## 9. Conclusion

**Business Suite security foundation is production-grade for CRM/SaaS workloads.**

**Observability360 adds new attack surface** (OTLP ingest, agents, CMDB APIs) — inherit Trinetra360 gateway auth (`AUTH_REQUIRED`, JWT, tenant header) and do not expose microservices directly.

**Status: APPROVED to proceed with architecture** — security gates defined per sprint.
