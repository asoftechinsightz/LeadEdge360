# AEO User Journey — LeadEdge360

**Version:** 1.0  
**Personas:** Admin, Sales Manager, Sales Agent  
**Constraint:** All steps use existing routes (`/dashboard`, `/leadedge360`) and existing APIs  

---

## Journey map overview

```
Sign in → Workspace dashboard → AEO awareness → Profile optimization
    → AI recommendations → Content publish → Monitor KPIs → Automated reminders
```

No new URLs. AEO surfaces appear as **sections and cards** on existing pages.

---

## Journey 1 — Admin: First-time AEO setup

| Step | User action | System behavior | Existing API / surface |
|------|-------------|-----------------|------------------------|
| 1 | Sign in | Emergent OAuth or JWT login | `/api/auth/*` |
| 2 | Land on workspace dashboard | Shows KPI row + **AEO card row** (composition) | `/dashboard`, `GET /api/kpis` |
| 3 | See low Business Completeness | Card shows % from checklist | Client: `preferences.aeoProfile` + config |
| 4 | Open “Improve profile” | Expands inline panel on dashboard (no new route) | — |
| 5 | Fill business description, areas, keywords | Saves to preferences | `PATCH /api/users/me` |
| 6 | Complete checklist items | Completeness score updates live | Client computation |
| 7 | Request FAQ suggestions | Runs AEO prompt template (same LLM as scoring) | Prompt config + `EMERGENT_LLM_KEY` |
| 8 | Save FAQs to profile | Stored in preferences | `PATCH /api/users/me` |
| 9 | Copy GBP post to clipboard | Generated from content prompt | Client only |
| 10 | Return weekly | Dashboard shows improved AEO Score | Derived metrics |

**Success:** Business Completeness ≥ 80%, FAQ Readiness ≥ 5 FAQs.

---

## Journey 2 — Manager: Local visibility review

| Step | User action | System behavior | API |
|------|-------------|-----------------|-----|
| 1 | Open LeadEdge360 CRM | Existing command center | `/leadedge360` |
| 2 | View Local Visibility card | Shows territory coverage % | `GET /api/kpis` → `byTerritory` |
| 3 | Identify gap cities | Recommendation: “Add service area: Hyderabad” | Rule + `byTerritory` |
| 4 | Add territory to profile | Updates `preferences.aeoProfile.serviceAreas` | `PATCH /api/users/me` |
| 5 | Filter leads by territory | Existing filters | `GET /api/leads?territory=` |
| 6 | Review sales performance | Optional growth row | `GET /api/dashboard/sales-performance` |

**Success:** All target territories appear in `byTerritory` with > 0 leads over 30 days.

---

## Journey 3 — Agent: Review response workflow

| Step | User action | System behavior | API |
|------|-------------|-----------------|-----|
| 1 | See Review Health card amber | Pending replies > 0 | `preferences.aeoProfile.reviews` + follow-ups |
| 2 | Open pending reviews list | Shows manual review entries + open follow-ups | `GET /api/followups?status=open` |
| 3 | Tap review needing reply | Shows review text | Preferences metadata |
| 4 | Generate AI reply suggestion | Review-reply prompt template | LLM config |
| 5 | Send via WhatsApp | Opens wa.me or API send | `POST /api/whatsapp/send` |
| 6 | Mark follow-up closed | Updates task | `POST /api/followups/{id}/close` |
| 7 | Update pending count | Review Health card turns green | Preferences PATCH |

**Success:** Pending replies = 0.

---

## Journey 4 — Manager: Growth scanner (digital optimization)

| Step | User action | System behavior | API |
|------|-------------|-----------------|-----|
| 1 | Open “Needs optimization” filter on Leads | Pre-set filter: Cold label, missing company | `GET /api/leads?label=Cold` |
| 2 | Review lead list | Scanner results = existing table | Same page |
| 3 | Open lead detail | See AI reasons | `GET /api/leads/{id}` |
| 4 | Rescore or update message | Improve data quality | `POST /rescore`, `PATCH` |
| 5 | Create follow-up for outreach | Task created | `POST /api/followups` |

**Success:** Convert Cold leads to Warm/Hot; improve territory coverage.

---

## Journey 5 — Automated reminders (background)

| Trigger | User experience | Automation |
|---------|-----------------|------------|
| Profile &lt; 60% complete 7 days | In-app notification or follow-up task | n8n weekly + `POST /followups` |
| Review pending &gt; 48h | WhatsApp reminder to agent | n8n + follow-up template |
| FAQ count &lt; 3 | Dashboard banner on `/dashboard` | Client rule on preferences |
| Stale New leads | Existing WhatsApp automation | `n8n/whatsapp-followup-automation.json` |

User does not configure new automation UI — ops imports n8n workflow JSON.

---

## Journey 6 — Content publishing (WhatsApp / social)

| Step | Action | API |
|------|--------|-----|
| 1 | Generate social caption from AEO panel | LLM prompt (config) |
| 2 | Select lead or business context | `GET /api/leads/{id}` optional |
| 3 | Send WhatsApp | `POST /api/whatsapp/send` |
| 4 | Log activity | Server lead_activities on status/whatsapp paths |

---

## Touchpoint matrix

| Touchpoint | Route | New navigation? |
|------------|-------|-----------------|
| AEO KPI cards | `/dashboard` | No |
| CRM + optional AEO row | `/leadedge360` | No |
| Profile editor panel | Inline on `/dashboard` | No |
| Lead scanner | `/leadedge360` filters | No |
| Tasks for AEO | `/leadedge360` or mobile Tasks | No |
| Settings | Existing user menu → profile | No |

---

## Edge cases

| Case | Behavior |
|------|----------|
| Demo org (`isDemo`) | Show sample AEO scores from config defaults |
| No LLM key | Rule-based recommendations only; banner “AI suggestions unavailable” |
| No WhatsApp configured | Copy-only for messages; wa.me still works |
| Mobile app | Same preferences via `PATCH /users/me`; dashboard KPIs via JWT `GET /dashboard/kpis` |

---

## Related

- [AEO_DASHBOARD_SPECIFICATION.md](./AEO_DASHBOARD_SPECIFICATION.md)
- [AEO_AUTOMATION_RULES.md](./AEO_AUTOMATION_RULES.md)
