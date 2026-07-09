# Penetration Test Checklist — RC3

External penetration test required before **public GA**. RC3 provides internal verification only.

## Pre-engagement

- [ ] Scope: web app, mobile API, webhooks, admin routes
- [ ] Staging environment with production-like data (anonymized)
- [ ] Emergency contact + rollback plan
- [ ] OWASP ASVS Level 2 as baseline

## OWASP Top 10 (automated baseline)

Run before external test:

```bash
node scripts/security/owasp-verify.mjs
node scripts/security/headers-check.mjs
node scripts/security/dependency-audit.mjs
bash scripts/security/container-scan.sh asoftech-app:latest
```

## Manual test areas

| Area | Tests |
|------|-------|
| Authentication | OTP brute force, session fixation, refresh token reuse |
| Authorization | Cross-tenant IDOR on leads, invoices, retail |
| Injection | NoSQL, XSS in lead notes, template params |
| File upload | Malware bypass, path traversal |
| Billing | Razorpay webhook replay, amount tampering |
| WhatsApp | Template injection, unauthorized send |
| API | Rate limit bypass, mass assignment |

## Deliverables

1. Executive summary (Critical/High/Medium/Low counts)
2. Remediation tracker with owners
3. Re-test sign-off after fixes
4. Store report at `docs/security/PEN_TEST_REPORT_<date>.pdf` (not committed if confidential)

## RC3 status

| Item | Status |
|------|--------|
| Internal OWASP verification | Automated |
| Dependency scan | Automated |
| Container scan | Trivy/Scout (optional) |
| External pen test | **Required for GA** |
