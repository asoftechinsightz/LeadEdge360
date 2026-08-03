# AEO Automation Rules — LeadEdge360

**Version:** 1.0  
**Constraint:** Reuse n8n workflows, follow-ups API, notifications API — **no new automation backend**  

---

## 1. Automation stack (existing)

| Layer | Artifact | Role |
|-------|----------|------|
| Workflow engine | n8n (`n8n/*.json`) | Scheduled triggers, HTTP to API |
| CRM tasks | `follow_ups` collection | Reminders as tasks |
| Mobile reminders | `GET /api/followups/reminders` | Due window queries |
| Push registration | `POST /api/notifications/devices` | Device tokens |
| WhatsApp outbound | Meta Cloud API via n8n or `POST /api/whatsapp/send` | Nudges |
| Stale lead nurture | `n8n/whatsapp-followup-automation.json` | Every 6h New leads |

---

## 2. AEO automation rules

### AR-01 — Profile completion reminder

| Field | Value |
|-------|-------|
| Trigger | Weekly cron (Monday 09:00 IST) |
| Condition | User `preferences.aeoProfile.completenessPct < 60` |
| Action | Create follow-up for admin user |
| API | `POST /api/followups` (JWT service account or admin token) |
| Payload | `{ title: "Complete AEO business profile", channel: "other", dueAt: +24h }` |
| n8n | New workflow `n8n/aeo-profile-reminder.json` |

**Note:** n8n cannot read preferences without `GET /users/me` with user token — workflow uses per-org admin JWT stored in n8n credential.

---

### AR-02 — Review response reminder

| Field | Value |
|-------|-------|
| Trigger | Daily 10:00 IST |
| Condition | `preferences.aeoProfile.reviews.pendingReplies > 0` |
| Action | Create follow-up assigned to agent |
| API | `POST /api/followups` |
| Title | `Reply to ${pendingReplies} pending reviews` |
| Channel | `whatsapp` |

Alternative without preferences read: count open follow-ups tagged `AEO-REVIEW` in title prefix.

---

### AR-03 — FAQ generation nudge

| Field | Value |
|-------|-------|
| Trigger | Bi-weekly |
| Condition | `faqCount < faqTarget` from preferences |
| Action | In-app only — **no auto LLM** |
| Mechanism | `GET /api/followups/reminders` + manual follow-up creation in n8n |
| Title | `Add ${faqTarget - faqCount} FAQs for AEO` |

User must click “Suggest FAQs” in app for LLM generation (human-in-the-loop).

---

### AR-04 — Business profile improvement suggestion

| Field | Value |
|-------|-------|
| Trigger | Weekly after KPI sync |
| Condition | `aeoScore < 70` (computed in n8n from stored last-known preferences export) |
| Action | Notification or follow-up |
| API | `POST /api/followups` with notes containing top 3 checklist gaps |

Gap list from rule engine mirroring [AEO_AI_RECOMMENDATION_CATALOG.md](./AEO_AI_RECOMMENDATION_CATALOG.md) R-03, R-04.

---

### AR-05 — Stale lead nurture (existing — extend)

| Field | Value |
|-------|-------|
| Workflow | `n8n/whatsapp-followup-automation.json` |
| Trigger | Every 6 hours |
| API | `GET /api/leads?status=New` |
| Filter | WhatsApp opt-in, age > 4h |
| Action | WhatsApp template `leadedge_followup_v1` |

**AEO extension:** Add filter `source=google` priority branch for local-intent leads — **workflow JSON config only**.

---

### AR-06 — Follow-up due reminders (existing)

| Field | Value |
|-------|-------|
| API | `GET /api/followups/reminders?withinHours=24` |
| Mobile | Local notifications from cached follow-ups |
| Web | Dashboard `followups-due` card |

No change — AEO tasks appear when created by AR-01–AR-04.

---

## 3. n8n workflow template (profile reminder)

```json
{
  "name": "LeadEdge360 — AEO Profile Reminder",
  "nodes": [
    { "name": "Weekly cron", "type": "n8n-nodes-base.scheduleTrigger" },
    { "name": "GET users/me", "type": "n8n-nodes-base.httpRequest",
      "parameters": { "url": "={{$env.ASOFTECH_API}}/api/users/me", "authentication": "genericCredentialType" }},
    { "name": "IF completeness < 60", "type": "n8n-nodes-base.if" },
    { "name": "POST followup", "type": "n8n-nodes-base.httpRequest",
      "parameters": { "method": "POST", "url": "={{$env.ASOFTECH_API}}/api/followups", "body": "..." }}
  ]
}
```

Deliverable file: `n8n/aeo-profile-reminder.json` (documentation reference — import at deploy).

---

## 4. Notification types (client convention)

When server notification writer expands, use types:

| type | Title |
|------|-------|
| `aeo_profile_incomplete` | Complete your business profile |
| `aeo_review_pending` | Reviews need replies |
| `aeo_faq_needed` | Add FAQs for better visibility |

Today: follow-ups carry the workload until `notifications` insert path is live.

---

## 5. Permissions

| Automation | Token |
|------------|-------|
| n8n HTTP | Admin JWT per tenant |
| User-triggered | User JWT |
| Webhooks | Unchanged |

---

## 6. Failure handling

| Failure | Behavior |
|---------|----------|
| API 401 | Refresh n8n credential |
| User not found | Skip tenant |
| Duplicate follow-up | Title prefix `AEO:` dedupe in n8n code node |

---

## 7. Ops checklist

- [ ] Import AEO n8n workflows to staging
- [ ] Set `ASOFTECH_API` env in n8n
- [ ] Store admin JWT in n8n credentials (rotate quarterly)
- [ ] Verify `POST /followups` from n8n with test org
- [ ] Disable AR-01 in demo org

---

## Related

- [AEO_USER_JOURNEY.md](./AEO_USER_JOURNEY.md)
- `n8n/whatsapp-followup-automation.json`
