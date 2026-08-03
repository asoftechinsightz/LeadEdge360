# Pre-Deployment Security Checklist

Use before **any** VPS production deploy. Check = verified on target environment.

---

## MANDATORY (all required)

### Secrets & environment

- [ ] `JWT_SECRET` set — not `dev-secret-change-me`
- [ ] `N8N_WEBHOOK_TOKEN` set — not `change-me-to-a-long-random-string`
- [ ] `BILLING_TEST_MODE=false`
- [ ] `RAZORPAY_WEBHOOK_SECRET` set (live)
- [ ] `RAZORPAY_KEY_SECRET` and public key match Razorpay dashboard
- [ ] `EMERGENT_PROJECT_ID` + `EMERGENT_API_KEY` set (if using Emergent auth)
- [ ] `EMERGENT_LLM_KEY` set (if using AI scoring)
- [ ] `.env` file mode `600`, owned by deploy user
- [ ] No secrets committed in git history on deploy branch

### Sprint 1 flags (initial deploy)

- [ ] `ENFORCE_PLAN_LIMITS=false`
- [ ] `WEB_JWT_BRIDGE=false`
- [ ] `AEO_SERVER_PROFILE=false`

### Docker / infra

- [ ] n8n admin password changed from `changeme`
- [ ] Mongo port **not** exposed to public internet
- [ ] App port 3000 behind nginx TLS only
- [ ] n8n port 5678 not public OR behind basic auth (flows vhost)
- [ ] Mongo backup scheduled and restore tested once

### Dependencies

- [ ] `npm audit` — zero **critical** and **high** (or PO waiver documented)
- [ ] `axios` ≥ 1.15.1

### Network / headers

- [ ] HTTPS valid certificate
- [ ] HSTS enabled at nginx
- [ ] `CORS_ORIGINS` restricted to production app URL(s)

---

## RECOMMENDED

- [ ] Disable or protect demo org seed on production marketing domain
- [ ] nginx rate limit on `/api/auth/` and `/api/webhooks/`
- [ ] Docker healthcheck on app service
- [ ] Mongo authentication enabled
- [ ] Log shipping without OTP/password fields
- [ ] RC-2 Validation workflow green on release commit
- [ ] Rollback drill completed on staging

---

## OWASP quick map

| OWASP | Checklist items |
|-------|-----------------|
| A01 Access control | Flags OFF, webhook token, JWT secret |
| A02 Crypto | JWT_SECRET, TLS, Razorpay secrets |
| A05 Misconfig | n8n password, CORS, test mode off |
| A06 Components | npm audit |
| A07 Auth | JWT secret, rate limits (recommended) |

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| DevOps | | | |
| Security / Eng | | | |
| Product Owner | | | |
