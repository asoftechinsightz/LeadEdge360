# RC-3 Staging Readiness Checklist

**Release:** R1.1 Foundation GA  
**Date:** 3 August 2026  
**Purpose:** Pre-production staging validation — **execute on staging**, not local workstation  

---

## Phase 3 — Infrastructure

| Item | Verify | Owner | Evidence |
|------|--------|-------|----------|
| Docker image builds on CI | `docker build -t asoftech-rc3:ci .` | Eng | GHA log / image tag |
| `docker compose config` valid | `docker compose config` | Eng | RC-2 deployment suite |
| App container healthy | `docker compose up` | Eng | Compose logs |
| `GET /api/` returns ok | curl staging `/api/` | Eng | Smoke log |
| Mongo reachable from app | App logs / health | Eng | Connection string test |
| Mongo backups configured | Ops runbook | Ops | Backup job ID |
| GitHub Actions deploy secrets | E-001 SSH | Eng | Secret audit |

---

## Environment variables (staging)

| Variable | Required | Staging pilot value | Verified |
|----------|----------|---------------------|----------|
| `MONGO_URL` | Yes | Set | [ ] |
| `DB_NAME` | Yes | Set | [ ] |
| `NEXT_PUBLIC_BASE_URL` | Yes | Staging URL | [ ] |
| `NEXT_PUBLIC_APP_URL` | Yes | Staging URL | [ ] |
| `JWT_SECRET` | Yes | Strong random | [ ] |
| `N8N_WEBHOOK_TOKEN` | Yes | Not `change-me` | [ ] |
| `ENFORCE_PLAN_LIMITS` | Flag | `false` baseline / `true` pilot | [ ] |
| `WEB_JWT_BRIDGE` | Flag | `false` baseline / `true` pilot | [ ] |
| `AEO_SERVER_PROFILE` | Flag | `false` baseline / `true` pilot | [ ] |
| `GRANDFATHER_ORG_IDS` | Optional | Tenant #1 if approved | [ ] |
| `EMERGENT_LLM_KEY` | LLM | Set | [ ] |
| `EMERGENT_PROJECT_ID` | LLM | Set | [ ] |
| `EMERGENT_API_KEY` | LLM | Set | [ ] |
| `RAZORPAY_KEY_SECRET` | Billing | Test/live per env | [ ] |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Billing | Test/live per env | [ ] |
| SMTP / MSG91 | Notifications | Per env docs | [ ] |

---

## Phase 4 — Feature flag matrix (live staging)

Execute after baseline deploy with flags **OFF OFF OFF**, then enable per combination.

| # | ENFORCE_PLAN_LIMITS | WEB_JWT_BRIDGE | AEO_SERVER_PROFILE | Smoke tests |
|---|---------------------|----------------|--------------------|-------------|
| 1 | OFF | OFF | OFF | Baseline CRM, leads, dashboard |
| 2 | ON | OFF | OFF | Plan limit 402 on cap |
| 3 | ON | ON | OFF | Cookie bridge followups/admin |
| 4 | ON | ON | ON | Server AEO profile PATCH |

Automation pre-validated all four combinations (24/24 unit checks). **Live staging confirmation still required.**

---

## Phase 5 — Tenant #1 CS validation checklist (prepare only — do not execute in RC-3)

**Customer Success evidence pack for Tenant #1.** Mark each item when executed on staging with PO-approved flags.

### Lead & CRM

| # | Scenario | Steps | Pass criteria | Executed | Evidence |
|---|----------|-------|---------------|----------|----------|
| T1-01 | Lead creation | Create lead in LeadEdge360 | Lead saved, org scoped | [ ] | Screenshot / ID |
| T1-02 | Lead edit | Update status / notes | Persisted | [ ] | |
| T1-03 | Lead list / filter | Dashboard territory filter | Correct subset | [ ] | |
| T1-04 | Retail product CRUD | RetailEdge360 products | Org isolated | [ ] | |

### Dashboard & KPIs

| # | Scenario | Pass criteria | Executed | Evidence |
|---|----------|---------------|----------|----------|
| T1-05 | Dashboard load | KPIs render < 3s | [ ] | |
| T1-06 | Lead save latency | Acceptable UX | [ ] | |

### AEO (E-003)

| # | Scenario | Pass criteria | Executed | Evidence |
|---|----------|---------------|----------|----------|
| T1-07 | AEO profile load | Server profile when flag ON | [ ] | |
| T1-08 | AEO score compute | Score updates | [ ] | |
| T1-09 | Debounced PATCH | preferences.aeoProfile saved | [ ] | Audit log |

### Bridge (E-002)

| # | Scenario | Pass criteria | Executed | Evidence |
|---|----------|---------------|----------|----------|
| T1-10 | Cookie followups list | Same data as JWT path | [ ] | |
| T1-11 | Cookie followups CRUD | Create/update/complete | [ ] | |
| T1-12 | Agent denied admin | 403 on `/api/admin/users` | [ ] | |
| T1-13 | JWT mobile smoke | Bearer followups unchanged | [ ] | |

### Billing (E-004)

| # | Scenario | Pass criteria | Executed | Evidence |
|---|----------|---------------|----------|----------|
| T1-14 | Plan limits OFF | No 402 on create | [ ] | |
| T1-15 | Plan limits ON | 402 at cap + toast | [ ] | |
| T1-16 | Grandfather Tenant #1 | Exempt if configured | [ ] | |
| T1-17 | Razorpay test payment | Subscription activated | [ ] | Audit |

### Notifications & followups

| # | Scenario | Pass criteria | Executed | Evidence |
|---|----------|---------------|----------|----------|
| T1-18 | Followup due reminder | Notification path | [ ] | |
| T1-19 | In-app notifications | Preferences respected | [ ] | |

### Admin & webhooks

| # | Scenario | Pass criteria | Executed | Evidence |
|---|----------|---------------|----------|----------|
| T1-20 | Admin user list | Admin only | [ ] | |
| T1-21 | Webhook lead ingest | Token + entitlement | [ ] | n8n log |

### WhatsApp

| # | Scenario | Pass criteria | Executed | Evidence |
|---|----------|---------------|----------|----------|
| T1-22 | WA conversation view | Loads for bridged user | [ ] | |
| T1-23 | WA send (if configured) | Provider ack | [ ] | |

**WS3 sign-off:** CS lead name, date, Tenant #1 org ID: _______________

---

## Staging sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Engineering | | | [ ] |
| CS / Ops | | | [ ] |
| Product Owner | | | [ ] |
