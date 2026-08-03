# LeadEdge360 — Customer Onboarding Kit

**Version:** 1.0  
**Audience:** New tenant admins and Customer Success  
**Pilot URL:** `https://app.asoftechinsightz.com`  
**Product freeze:** Documentation only — no product changes  

**Related:** [AI_BUSINESS_GROWTH_PLAYBOOK.md](./AI_BUSINESS_GROWTH_PLAYBOOK.md) · [CUSTOMER_SUCCESS_PLAYBOOK.md](./CUSTOMER_SUCCESS_PLAYBOOK.md) · `docs/aeo/post-deployment/06_CUSTOMER_SUCCESS_ENABLEMENT.md`

---

## 1. Welcome Guide

Welcome to **LeadEdge360** — AI-powered lead intelligence and business growth for Indian MSMEs.

| What you get today | Where |
|--------------------|-------|
| Workspace overview + KPIs | `/dashboard` |
| CRM pipeline + AI scoring | `/leadedge360` |
| AI Growth Engine (AEO) | Dashboard → **AI GROWTH ENGINE** |
| Retail shelf-life AI (optional) | `/retailedge360` |
| Sign-in | `/signin` (email/password or Google) |

**Before kickoff:** CS confirms Infrastructure checklist complete (`docs/operations/runtime-handover/02_INFRASTRUCTURE_CHECKLIST.md`) and authenticated validation (`03_AUTHENTICATED_VALIDATION_CHECKLIST.md`).

**Support:** `Enquiry@asoftechinsightz.com` (from live `/api/health` pilot contact).

---

## 2. First Login Guide

1. Open `https://app.asoftechinsightz.com/signin`
2. Sign in with work email/password or **Continue with Google**
3. Accept **DPDP consent** if prompted (required for India compliance)
4. You land on **Dashboard** — workspace overview
5. Bookmark `/dashboard` and `/leadedge360`

**Role views (LeadEdge360):** Admin, Sales Manager, and Sales Agent filters are available in the CRM header for pipeline scoping. Full multi-user provisioning is coordinated by CS/Ops (see §4).

**CS note:** Do not direct users to `/billing` until deploy parity confirmed — live pilot has returned **404** on that route (see `docs/operations/runtime-handover/`).

---

## 3. Business Profile Setup

**Path:** Dashboard → **AI GROWTH ENGINE** → **Improve profile**

| Field | Purpose |
|-------|---------|
| Business name, category | Trust + AI discoverability |
| Short / long description | AEO + search snippets |
| Phone, website, hours | NAP consistency |
| Google Business Profile URL | Reference link (external GBP) |
| Service areas | Local visibility KPI |
| Keywords | FAQ and content suggestions |
| WhatsApp configured | Engagement readiness |
| FAQs (target 5) | FAQ Readiness KPI |
| Review metrics | Review Health KPI |

**Completeness target:** ≥ 80% **Business Completeness** before Week 2 campaigns.

**Phase-1 limitation:** Profile is stored in **browser session** (`sessionStorage`) until server sync is authorized post-freeze. Same browser = profile persists; new device = re-enter or wait for sync. Document in CS kickoff.

**External records:** GST, PAN, logo — keep in compliance folder; add logo on Google Business Profile manually (not in app fields).

**Deep reference:** `config/aeo/readiness-checklist.json` · `docs/aeo/AEO_USER_JOURNEY.md`

---

## 4. User Creation & Team Invitation

| Capability | Phase-1 status | CS action |
|------------|------------------|-----------|
| Admin account | Ops-provisioned at tenant setup | Use `docs/POST_DEPLOY_CHECKLIST.md` §4; rotate default password |
| Additional users | Mobile API `/users` (JWT) — not full self-serve web UI | CS/Ops creates users via API or backend |
| Team invitation email | **Not in web UI** | CS sends credentials securely out-of-band |
| Agent assignment | CRM uses agent list from `GET /api/agents` | Assign leads via **Assigned to** on lead rows |
| Role demo toggle | Admin / Manager / Agent filter on `/leadedge360` | Train managers on territory + agent filters |

**Onboarding script for teams:**

1. CS creates user accounts (email, role: admin / manager / agent)
2. Each user completes First Login (§2)
3. Manager reviews **Agent performance** chart on LeadEdge360
4. Agents work from filtered pipeline (role = agent)

---

## 5. Lead Import

| Method | How |
|--------|-----|
| **Manual** | LeadEdge360 → **+ New lead** (name, phone, territory, source, message) |
| **WhatsApp ingest** | n8n → `POST /api/webhooks/whatsapp` (ops configures) |
| **Facebook Lead Ads** | n8n flow (ops) |
| **Google Lead Form** | n8n flow (ops) |
| **Website form** | API `POST /api/leads` (integration) |
| **Bulk CSV** | **Not in Phase-1 UI** — CS assists with API batch or manual entry |

**Sources in app:** `website`, `facebook`, `google`, `whatsapp`, `referral`  
**Territories:** Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune

After import, each lead receives **AI score** (0–100), **label** (Hot/Warm/Cold), and scoring **reasons**.

---

## 6. First Lead

1. Open `/leadedge360`
2. Click **+ New lead**
3. Enter: name, phone (+91), territory, source, initial message
4. Save — note **AI score** and label on the row
5. Click row → detail dialog: score, reasons, status, WhatsApp link
6. Change status to **Contacted** after first outreach
7. Use **Re-score** after updating the message with new context

**Success criteria:** Lead appears in table; score &gt; 0; WhatsApp deep link opens with pre-filled text.

---

## 7. First Proposal

LeadEdge360 tracks proposals via **pipeline status** (not a separate proposal document module in Phase-1).

1. Qualify the lead → status **Qualified**
2. When ready to send pricing/terms → status **Proposal**
3. Re-score after budget/timeline notes in message field
4. Track **Conversion** KPI and **Qualified** count on dashboard
5. Follow up via WhatsApp within 48 hours for Proposal-stage leads

**CS tip:** Use [AI_CONTENT_LIBRARY.md](./AI_CONTENT_LIBRARY.md) proposal follow-up prompts.

---

## 8. First Customer (Won)

1. After verbal/written acceptance → status **Won**
2. Confirm **Conversion %** and **won** sub-label on CONVERSION KPI update
3. Record outcome in [COMMERCIAL_VALIDATION_TOOLKIT.md](./COMMERCIAL_VALIDATION_TOOLKIT.md) ROI template
4. Optional: capture testimonial within 7 days

**Lost deals:** Status **Lost** — still counts in total for conversion math; use for win/loss reviews.

---

## 9. Weekly Checklist

| Day | Action |
|-----|--------|
| Mon | Record AEO Score + top 3 growth recommendations |
| Tue | Add or improve 1 FAQ |
| Wed | Contact all **Hot** leads (WhatsApp) |
| Thu | Fix **Cold** leads (company, territory, message) |
| Fri | Review conversion % vs prior week; agent chart |

**Full weekly SOP:** [CUSTOMER_SUCCESS_PLAYBOOK.md](./CUSTOMER_SUCCESS_PLAYBOOK.md) § Weekly Reviews

**Expanded checklist:** `docs/aeo/post-deployment/06_CUSTOMER_SUCCESS_ENABLEMENT.md` §4

---

## 10. Monthly Success Plan

| Week | Theme | Outcomes |
|------|-------|----------|
| 1 | Business setup | Profile ≥ 80%; 5 FAQs; GBP linked |
| 2 | Lead generation | +20% new leads vs Week 1; Google source active |
| 3 | Engagement | All hot leads contacted; review health tracked |
| 4 | Revenue | Proposal → Won movement; conversion trend up |

**30-day detail:** `docs/aeo/post-deployment/06_CUSTOMER_SUCCESS_ENABLEMENT.md` §3

---

## Onboarding sign-off

| Step | Owner | Done |
|------|-------|------|
| First login + DPDP | Customer | ☐ |
| Business profile ≥ 80% | Customer | ☐ |
| First lead + score | Customer | ☐ |
| First Proposal status | Customer | ☐ |
| First Won | Customer | ☐ |
| Weekly rhythm trained | CS | ☐ |
| Authenticated validation PASS | CS | ☐ |

**CS lead:** _______________ **Date:** _______________
