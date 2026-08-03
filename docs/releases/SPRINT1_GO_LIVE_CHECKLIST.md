# Sprint 1 — Go-Live Checklist (RC-1 → Production)

**Release:** R1.1 Foundation GA  
**Date:** 3 August 2026  

Use this checklist after **staging RC sign-off**. All Sprint 1 flags default OFF in production until PO approves phased enablement.

---

## Pre-deploy (engineering)

- [ ] Merge E-004, E-002, E-003 to `staging` branch
- [ ] `yarn build` green on CI (Ubuntu runner)
- [ ] `npm run test:aeo` green
- [ ] `npm run test:bridge` green (with Mongo service in CI)
- [ ] `npm run test:billing` green (with Mongo service in CI)
- [ ] `.env.example` documents all three flags
- [ ] No P1 regressions in `backend_test.py` against staging URL

---

## Staging validation (CS + eng)

- [ ] **Flag matrix 1** OFF/OFF/OFF — baseline WS3 subset
- [ ] **Flag matrix 4** ON/ON/ON — full Sprint 1 pilot tenant
- [ ] E-001 WS3 authenticated checklist PASS
- [ ] Cross-browser AEO profile (E-003)
- [ ] Mobile JWT smoke (followups, users/me) — no regression
- [ ] Cookie bridge: followups CRUD (E-002)
- [ ] Plan limit 402 toast on lead cap (E-004) with grandfather tested
- [ ] n8n lead ingest webhooks with token + entitlement

---

## Environment variables (staging → prod)

| Variable | Staging pilot | Production initial |
|----------|---------------|-------------------|
| `ENFORCE_PLAN_LIMITS` | `true` (pilot) | `false` until PO |
| `WEB_JWT_BRIDGE` | `true` (pilot) | `false` until PO |
| `AEO_SERVER_PROFILE` | `true` (pilot) | `false` until PO |
| `GRANDFATHER_ORG_IDS` | Tenant #1 if approved | As PO directs |
| `MONGO_URL` / `DB_NAME` | Set | Set |
| `EMERGENT_*` | Set | Set |
| `RAZORPAY_*` | Test/live per env | Live keys |
| `N8N_WEBHOOK_TOKEN` | Strong random | Strong random — not `change-me` |
| `EMERGENT_LLM_KEY` | Set | Set |

---

## Infrastructure

- [ ] `docker compose up` — app + mongo + n8n healthy
- [ ] `GET /api/` returns `ok: true` (deploy smoke)
- [ ] Mongo backups configured
- [ ] GitHub Actions deploy SSH secrets valid (E-001)
- [ ] Razorpay webhook URL + signature verified
- [ ] MSG91 / OTP for mobile auth (if mobile GA)

---

## Rollback plan (verified)

- [ ] Set all Sprint 1 flags `false` → redeploy (< 5 min)
- [ ] No DB rollback scripts required
- [ ] Mobile JWT clients unaffected when bridge OFF
- [ ] Server AEO data retained when `AEO_SERVER_PROFILE` OFF

---

## PO / commercial gates

- [ ] Product Owner sign-off on E-004, E-002, E-003 individually
- [ ] RC-1 score ≥ 90 or documented exceptions
- [ ] Tenant #1 grandfather policy approved
- [ ] CS playbooks updated for bridge + limits + server profile
- [ ] CHANGELOG / release notes for R1.1 drafted

---

## Post-go-live monitoring (first 48h)

- [ ] 401/403/402 rate on `/api/leads`, `/api/products`, `/api/users/me`
- [ ] Audit logs: `aeo.profile.updated`, `subscription.activated`
- [ ] Error logs for bridge 404 vs 401 confusion
- [ ] n8n workflow success rate

---

## Sprint 2 authorization

Do **not** start Sprint 2 until:

1. This checklist complete on staging  
2. PO explicit approval  
3. RC-1 GO recommendation accepted or waived with documented risk
