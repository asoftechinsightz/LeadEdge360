# Production Secret Verification

**Program:** Commercial GA Closure  
**Date:** 4 August 2026  
**Host:** leadedge360 (`/opt/asoftech-insightz/.env`)  
**Mode:** Read-only — **values not inspected or recorded**

---

## Charter audit

| Variable | App `.env` key | Status |
|----------|----------------|--------|
| JWT_SECRET | `JWT_SECRET` | ✓ Present |
| MONGO_URL | `MONGO_URL` | ✓ Present |
| DB_NAME | `DB_NAME` | ✓ Present |
| SMTP_HOST | `SMTP_HOST` | ✗ Missing |
| SMTP_USER | `SMTP_USER` | ✗ Missing |
| SMTP_PASSWORD | `SMTP_PASS` | ✗ Missing |
| RAZORPAY_KEY_ID | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ✗ Missing |
| RAZORPAY_SECRET | `RAZORPAY_KEY_SECRET` | ✗ Missing |
| RAZORPAY_WEBHOOK_SECRET | `RAZORPAY_WEBHOOK_SECRET` | ✗ Missing |
| EMERGENT_LLM_KEY | `EMERGENT_LLM_KEY` | ✗ Missing |
| N8N_WEBHOOK_TOKEN | `N8N_WEBHOOK_TOKEN` | ✓ Present |
| N8N_WEBHOOK_ORG_ID | `N8N_WEBHOOK_ORG_ID` | ✗ Missing |
| N8N_BASIC_AUTH_PASSWORD | `N8N_BASIC_AUTH_PASSWORD` | ✓ Present |
| CORS_ORIGINS | `CORS_ORIGINS` | ✓ Present |

---

## Summary

| Metric | Count |
|--------|-------|
| **Present** | **7** |
| **Missing** | **7** |
| **Mandatory for Commercial GA** | **14** |
| **GA secret gate** | **FAIL** |

---

## Impact of missing secrets

| Missing | Production impact |
|---------|-------------------|
| SMTP_* | No transactional email (notifications, billing receipts) |
| Razorpay (3) | No live payments, subscriptions, or webhook reconciliation |
| EMERGENT_LLM_KEY | No AI lead scoring, RevenueShield, AEO LLM features |
| N8N_WEBHOOK_ORG_ID | Webhook lead ingest may not target correct org |

---

## Present secrets — functional notes

| Secret | Notes |
|--------|-------|
| `N8N_WEBHOOK_TOKEN` | Present (may be aliased from legacy `N8N_WEBHOOK_SECRET` during stabilization) |
| `JWT_SECRET` | Required for session/JWT — present |
| `CORS_ORIGINS` | Present — verify value matches production URL in ops review (value not audited) |

---

## Remediation (configuration only — not executed in this program)

1. Add missing keys to `/opt/asoftech-insightz/.env` via secure channel (not git).
2. Use correct app key names (`NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `SMTP_PASS`).
3. Restart **not performed** in this program — required after secret injection by ops.
4. Re-run this checklist before Commercial GA sign-off.

---

## Commercial GA gate

| Criterion | Result |
|-----------|--------|
| All 14 mandatory secrets present | **NO GO** |

---

## Related

- `docs/operations/PRODUCTION_HEALTH_REPORT.md`
- `COMMERCIAL_GA_APPROVAL.md`
