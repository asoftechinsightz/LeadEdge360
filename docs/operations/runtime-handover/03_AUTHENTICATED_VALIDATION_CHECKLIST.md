# WS3 — Authenticated Validation Checklist

**Audience:** Customer Success + Ops (with Tenant #1 admin)  
**URL:** `https://app.asoftechinsightz.com/signin`  
**Prerequisite:** Infrastructure checklist complete; known git SHA vs RC  

**Infrastructure handover status (2 Aug 2026 13:16 UTC):** **BLOCKED** — WS2 Phases 1–6 and 8 not completed (SSH failed). Customer Success must **not** execute this checklist until Infrastructure records Git SHA, Docker image ID, and container AEO path verification in `02_INFRASTRUCTURE_CHECKLIST.md`.

**Screenshots:** Store in **internal CS folder** — do not commit to product repo.

---

## Credentials

| Field | Value |
|-------|-------|
| Admin email | _Tenant #1 or seed admin (ops-provided)_ |
| Password | _ops-provided — do not document in git_ |
| Reference (seed) | See `docs/POST_DEPLOY_CHECKLIST.md` §4 — use only if PO authorizes |

---

## 1. Login

| Step | Pass? | Screenshot |
|------|-------|------------|
| Open `/signin` | ☐ | `screenshots/01-signin.png` |
| Sign in succeeds | ☐ | `screenshots/02-post-login-redirect.png` |
| No console errors on login | ☐ | (note in ticket) |
| DPDP consent if shown | ☐ | |

---

## 2. Dashboard

| Step | Pass? | Screenshot |
|------|-------|------------|
| `/dashboard` loads workspace overview | ☐ | `screenshots/03-dashboard-overview.png` |
| Row 1 KPIs: leads, hot, conversion, retail | ☐ | |
| Product cards (LeadEdge / Retail) | ☐ | |

---

## 3. AI Growth Engine (AEO)

| Step | Pass? | Screenshot |
|------|-------|------------|
| Section title "AI GROWTH ENGINE" visible | ☐ | `screenshots/04-aeo-section.png` |
| Five KPI cards: AEO Score, Completeness, FAQ, Local, Review | ☐ | `screenshots/05-aeo-kpi-row.png` |
| "Improve profile" panel opens | ☐ | `screenshots/06-aeo-profile-panel.png` |
| Checklist panel shows items | ☐ | |
| Growth recommendations panel shows bullets | ☐ | `screenshots/07-aeo-recommendations.png` |
| Optional: "Suggest FAQs" / LLM button (if key set) | ☐ | `screenshots/08-aeo-llm-output.png` |

**If AEO section missing:** Record **FAIL** — deploy mismatch; do not proceed with AEO CS onboarding.

---

## 4. LeadEdge360 workspace

| Step | Pass? | Screenshot |
|------|-------|------------|
| `/leadedge360` loads | ☐ | `screenshots/09-leadedge360.png` |
| CRM KPI row (5 cards) | ☐ | |
| AEO intelligence strip (if in RC build) | ☐ | `screenshots/10-aeo-crm-strip.png` |
| Charts render (trend, source, territory) | ☐ | |
| Lead table populated | ☐ | |

---

## 5. Lead CRUD & intelligence

| Step | Pass? | Screenshot |
|------|-------|------------|
| Create lead (+ New lead) | ☐ | |
| Lead appears in table | ☐ | `screenshots/11-lead-created.png` |
| AI score + label shown | ☐ | |
| Open lead detail dialog | ☐ | `screenshots/12-lead-detail-score.png` |
| Re-score updates score | ☐ | |
| Status change (e.g. → Qualified) | ☐ | |
| WhatsApp deep link opens | ☐ | |

---

## 6. Modules — mark PASS / WARN / FAIL / N/A

| Module | Expected in RC v1 | Pass? | Notes | Screenshot |
|--------|-------------------|-------|-------|------------|
| **Opportunity** | Metrics on live; UI may not exist | ☐ N/A ☐ | | |
| **Proposal** | Lead status only in RC | ☐ N/A ☐ | | |
| **Timeline** | Lead detail fields | ☐ N/A ☐ | | |
| **Notes** | `message` / lead fields | ☐ N/A ☐ | | |
| **Follow-ups** | JWT API; nested in lead detail on web | ☐ N/A ☐ | | |

---

## 7. Billing (if RC deployed)

| Step | Pass? | Screenshot |
|------|-------|------------|
| `/billing` loads (not 404) | ☐ | `screenshots/13-billing.png` |
| Plan / checkout UI | ☐ | |

**Prior external evidence:** `/billing` → **404**. Expect **FAIL** until deploy aligned.

---

## 8. Network / console capture

| Item | Record |
|------|--------|
| Failed API calls in DevTools Network | |
| Console errors (red) | |
| `GET /api/kpis` status when logged in | |
| `GET /api/leads` status when logged in | |

---

## Sign-off

| Role | Name | Date | Overall |
|------|------|------|---------|
| Customer Success | | | ☐ PASS ☐ FAIL ☐ PENDING |
| Product Owner | | | ☐ Accept ☐ Hold |

Attach screenshot folder path to ops ticket.
