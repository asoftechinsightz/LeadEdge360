# Workstream 5 — Automation Validation

**Program:** LeadEdge360 AI Growth Engine Phase-1  
**Validation date:** August 2026  
**Scope:** n8n workflow JSON + operational readiness

---

## 1. Summary

| Workflow | JSON in repo | Import verified on pilot n8n | Disabled by default | Env vars |
|----------|--------------|-------------------------------|---------------------|----------|
| Profile Reminder (AR-01) | `n8n/aeo-profile-reminder.json` | **NOT VERIFIED** | **ASSUMED** (import policy) | ☐ |
| Review Reminder (AR-02) | `n8n/aeo-review-reminder.json` | **NOT VERIFIED** | **ASSUMED** | ☐ |
| FAQ Nudge (AR-03) | `n8n/aeo-faq-nudge.json` | **NOT VERIFIED** | **ASSUMED** | ☐ |
| WhatsApp Nurture (AR-05) | `n8n/whatsapp-followup-automation.json` | Pre-existing | Per ops baseline | ☐ |
| Google Priority (AR-05 ext) | Same file — sort google first | Code in Filter node | — | — |

**WS5 verdict:** **CONDITIONAL PASS** — artifacts present and structurally valid; **live n8n import and execution not verified** in this documentation-only validation.

---

## 2. Workflow inventory

### AR-01 — AEO Profile Reminder

| Field | Value |
|-------|-------|
| File | `n8n/aeo-profile-reminder.json` |
| Trigger | Weekly cron |
| Condition | `completenessPct < 60` (from JWT `GET /users/me` preferences) |
| Action | `POST /api/followups` |
| Credential | `LEADEDGE_ADMIN_JWT` (httpHeaderAuth) |

**Pilot note:** Web AEO profile uses sessionStorage — n8n will only see server `preferences.aeoProfile` if synced via mobile JWT `PATCH /users/me`. Profile reminder may not fire until server profile exists.

### AR-02 — Review Reply Reminder

| Field | Value |
|-------|-------|
| File | `n8n/aeo-review-reminder.json` |
| Trigger | Daily |
| Condition | `reviews.pendingReplies > 0` |
| Action | Follow-up with `channel: whatsapp`, title prefix for review |

### AR-03 — FAQ Nudge

| Field | Value |
|-------|-------|
| File | `n8n/aeo-faq-nudge.json` |
| Trigger | Bi-weekly |
| Condition | FAQ count &lt; 5 |
| Action | Follow-up nudge (human-in-the-loop for LLM) |

### AR-05 — WhatsApp Nurture + Google priority

| Field | Value |
|-------|-------|
| File | `n8n/whatsapp-followup-automation.json` |
| Change | Filter node sorts `source=google` leads before others |
| APIs | `GET /api/leads?status=New` (cookie/session or service token per ops) |

---

## 3. Required environment variables

| Variable | Purpose | Configured on pilot? |
|----------|---------|---------------------|
| `ASOFTECH_API` | Base URL e.g. `https://app.asoftechinsightz.com` | ☐ Ops |
| `WA_PHONE_NUMBER_ID` | WhatsApp Cloud | ☐ Ops |
| `LEADEDGE_ADMIN_JWT` | n8n credential for `/users/me`, `/followups` | ☐ Ops |
| `N8N_WEBHOOK_TOKEN` | Ingest webhooks (unchanged) | ☐ Ops |

---

## 4. Import & safety checklist (ops)

```
☐ Import aeo-profile-reminder.json — workflow inactive after import
☐ Import aeo-review-reminder.json — inactive
☐ Import aeo-faq-nudge.json — inactive
☐ Re-import or merge whatsapp-followup-automation.json — verify Google sort
☐ Test execution with manual trigger — no production WhatsApp blast
☐ Confirm JWT credential scopes: users/me read, followups write
☐ Enable AR-01 only after Tenant #1 server profile path confirmed
```

---

## 5. Execution failure modes

| Failure | Cause | CS action |
|---------|-------|-----------|
| 401 on GET users/me | JWT expired / wrong credential | Rotate admin JWT in n8n |
| No follow-up created | Completeness ≥ 60 or empty server profile | Expected; coach profile completion |
| WhatsApp send fails | WA_CLOUD not configured | Use wa.me manual nurture |

---

## 6. WS5 verdict

**CONDITIONAL PASS** — Workflow definitions ready in repo; **pilot import, disable-by-default policy, and dry-run execution** require ops sign-off.
