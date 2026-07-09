# Security Audit — RC1

**Generated:** 2026-06-22  
**Prior audit:** `SECURITY_AUDIT_REPORT.md` (2026-06-23) — **PASS** after P0 fixes  
**Hardening guide:** `docs/SECURITY_HARDENING.md`

## Executive summary

| Area | Score | RC1 target | Met |
|------|-------|------------|-----|
| Authentication | 92% | 95% | 🟡 |
| Authorization (RBAC) | 88% | 95% | 🟡 |
| Tenant isolation | 95% | 100% | 🟡 |
| Transport / headers | 75% | 90% | 🟡 |
| Input validation | 80% | 90% | 🟡 |
| Secrets management | 85% | 95% | 🟡 |
| **Overall security readiness** | **72% → 85%** | 95% | ❌ |

**Critical (P0) open issues:** 0  
**High (P1) open issues:** 4

---

## JWT & refresh tokens

| Control | Status | Location |
|---------|--------|----------|
| HS256 signed access tokens | ✅ | `lib/jwt.js` |
| Refresh token hashing (SHA-256) | ✅ | `auth_refresh_tokens` |
| Token rotation on refresh | ✅ | `lib/jwt.js` |
| Access TTL default 900s | ✅ | Configurable `JWT_ACCESS_TTL` |
| Refresh TTL ~30 days | ✅ | `JWT_REFRESH_TTL` |
| Dev bypass disabled in production | ✅ | `lib/dev-auth.js`, `REQUIRE_AUTH` |

---

## OTP

| Control | Status |
|---------|--------|
| Bcrypt-hashed OTP storage | ✅ |
| 5 attempts per OTP record | ✅ |
| 5-minute TTL | ✅ |
| SMS + WhatsApp channels | ✅ |
| IP rate limit (3/min) | ❌ Documented only |

**P1:** Implement IP-based rate limiting in `lib/otp.js` or edge (nginx/Caddy).

---

## RBAC

| Role | Permissions | Enforced |
|------|-------------|----------|
| SUPER_ADMIN | `*` | ✅ |
| ORG_ADMIN | Full org | ✅ |
| SALES_MANAGER / EXECUTIVE | CRM subset | ✅ |
| FINANCE | Billing/invoices | ✅ |
| PARTNER | Partner routes | ✅ |

Enforcement: `lib/rbac.js`, `lib/billing/roles.js`, route guards.

---

## Tenant isolation

| Check | Result |
|-------|--------|
| All CRM reads filter `orgId` | ✅ |
| Demo tenant blocked in production | ✅ |
| Portal users separate collection | ✅ |
| Partner cross-tenant leak | ✅ Fixed |
| File uploads scoped by org path | ✅ `lib/media/upload.js` |

---

## API keys & webhooks

| Integration | Verification |
|-------------|--------------|
| Razorpay checkout | HMAC signature ✅ |
| Razorpay webhook | HMAC + secret ✅ |
| N8N webhooks | Token header ✅ |
| WhatsApp Meta | Bearer token ✅ |
| Google OAuth | Client secret ✅ |

---

## Headers & XSS/CSRF

| Control | Status |
|---------|--------|
| CORS | Configured per env |
| CSP | 🟡 Not enforced globally |
| CSRF | JWT bearer (mobile) — cookie routes 🟡 |
| XSS | React escaping + sanitize user HTML 🟡 |

---

## File upload validation

| Rule | Status |
|------|--------|
| MIME whitelist | ✅ |
| Size limits (2 MB images, 5 MB docs) | ✅ |
| Path traversal prevention | ✅ orgId sanitize |
| Magic-byte verification | ❌ |
| Virus scan hook | ❌ Placeholder for RC2 |

---

## Password policies

| Rule | Status |
|------|--------|
| bcrypt cost 10 | ✅ |
| Minimum length enforcement | 🟡 Client-side primarily |
| Session idle timeout (mobile) | ✅ 15 min (`security_config_test.dart`) |

---

## Rate limiting summary

| Vector | Protected |
|--------|-----------|
| Public QR | ✅ |
| AI agents | ✅ |
| Auth OTP | ❌ |
| Login brute force | 🟡 Edge recommended |

---

## P1 remediation (before GA)

1. OTP IP rate limiting
2. Global API rate limit at reverse proxy
3. CSP headers on web app
4. Magic-byte file validation
5. Expand RBAC integration tests

**RC1 verdict:** Acceptable for controlled enterprise pilot with P1 backlog tracked. Not GA-ready without P1 closure.
