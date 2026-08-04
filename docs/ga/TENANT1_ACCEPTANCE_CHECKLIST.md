# Tenant #1 Acceptance Checklist

**Program:** Commercial GA Closure — Customer Success readiness  
**Tenant:** Tenant #1 (pilot)  
**Environment:** `https://app.asoftechinsightz.com`  
**Deployed SHA:** `bcc6215`  
**Mode:** Checklist only — **not executed in this program**

CS must complete each item and record Pass/Fail with date and tester name.

---

## Prerequisites before testing

| # | Prerequisite | Status |
|---|--------------|--------|
| P1 | Tenant #1 org exists in Mongo with correct plan | CS verify |
| P2 | CS test user credentials issued | CS verify |
| P3 | `ENFORCE_PLAN_LIMITS=false` confirmed | ✓ (production default) |
| P4 | `WEB_JWT_BRIDGE=false` confirmed | ✓ |
| P5 | `AEO_SERVER_PROFILE=false` confirmed | ✓ |
| P6 | Commercial secrets (Razorpay, SMTP, LLM) | ✗ **Block billing/AI until configured** |

---

## Authentication & access

| # | Test | Steps | Pass criteria | CS result |
|---|------|-------|---------------|-----------|
| 1 | Login | Sign in via `/signin` | Dashboard loads, no auth error | ☐ |
| 2 | Session persistence | Refresh page | Still authenticated | ☐ |
| 3 | Logout | Sign out | Session cleared | ☐ |
| 4 | Wrong password | Invalid login | Clear error, no leak | ☐ |

---

## Dashboard

| # | Test | Pass criteria | CS result |
|---|------|---------------|-----------|
| 5 | Dashboard load | `/dashboard` renders KPIs | ☐ |
| 6 | Org context | Data matches Tenant #1 only | ☐ |
| 7 | Navigation | Core nav links work | ☐ |

---

## Leads (LeadEdge360)

| # | Test | Pass criteria | CS result |
|---|------|---------------|-----------|
| 8 | Lead list | `/leadedge360` shows leads | ☐ |
| 9 | Lead creation | Create new lead | Lead appears in list | ☐ |
| 10 | Lead edit | Update status | Persists after refresh | ☐ |
| 11 | Lead detail | Open lead record | Fields load correctly | ☐ |

---

## Follow-ups

| # | Test | Pass criteria | CS result |
|---|------|---------------|-----------|
| 12 | Follow-up list | Accessible from CRM | ☐ |
| 13 | Create follow-up | Schedule follow-up | Saved | ☐ |
| 14 | Bridge OFF note | Cookie bridge disabled — mobile JWT paths N/A | Document expected 404 if tested | ☐ |

---

## Notifications

| # | Test | Pass criteria | CS result |
|---|------|---------------|-----------|
| 15 | Notification feed | `/api/notifications` or UI | Returns data or empty state | ☐ |
| 16 | Email notification | Trigger event | **Blocked until SMTP configured** | ☐ |

---

## WhatsApp integration

| # | Test | Pass criteria | CS result |
|---|------|---------------|-----------|
| 17 | WhatsApp settings | Settings page loads | ☐ |
| 18 | Webhook ingest | Test lead via n8n/webhook | **Requires N8N_WEBHOOK_ORG_ID** | ☐ |

---

## Billing workflow

| # | Test | Pass criteria | CS result |
|---|------|---------------|-----------|
| 19 | Pricing page | `/pricing` loads | ☐ |
| 20 | Billing page | `/billing` loads | ☐ |
| 21 | Test payment | Razorpay checkout | **Blocked — Razorpay keys missing** | ☐ |
| 22 | Plan display | Current plan shown | ☐ |

---

## AEO profile

| # | Test | Pass criteria | CS result |
|---|------|---------------|-----------|
| 23 | AEO UI | AEO section loads | ☐ |
| 24 | Profile save | Edit profile | With `AEO_SERVER_PROFILE=false`, sessionStorage path | ☐ |
| 25 | AI suggestions | Run AEO compute | **Blocked — EMERGENT_LLM_KEY missing** | ☐ |

---

## Reports

| # | Test | Pass criteria | CS result |
|---|------|---------------|-----------|
| 26 | Export / reports | Available report views | Data matches tenant | ☐ |
| 27 | Date filters | Apply filter | Results update | ☐ |

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| CS Lead | | | |
| Product Owner | | | |

---

## Commercial GA gate

| Criterion | Result |
|-----------|--------|
| Checklist completed by CS | **NOT DONE** |
| All applicable tests PASS | **BLOCKED** (secrets + CS execution) |

---

## Related

- `docs/operations/runtime-handover/03_AUTHENTICATED_VALIDATION_CHECKLIST.md`
- `COMMERCIAL_GA_APPROVAL.md`
