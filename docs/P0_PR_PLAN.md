# LeadEdge360 P0/P1 — 5 PR plan + Loom demo

## PR-1: Onboarding + demo data activation
**Branch:** `feat/p0-onboarding-demo-seed`

- `lib/onboarding/demo-seed.js` — onboarding-facing re-export
- `lib/seed/demo-seed.js` — `clearOrgDemoData`, signup auto-seed fields
- `lib/mobile-routes.js` — auto-seed on register
- `app/api/leads/demo-data/route.js` — POST + DELETE
- `components/settings/DemoDataPanel.tsx` — Clear Demo Data in Settings
- `components/leads/LeadsZeroBanner.tsx` — zero-lead CTA banner
- `components/onboarding/GetStartedChecklist.tsx` — sidebar checklist (3 tasks)

**Tests:** `tests/p0-leadedge360.test.js` (onboarding + paths)

---

## PR-2: Marketing Automation v1 + Visual Workflow
**Branch:** `feat/p0-marketing-automation`

- `lib/campaigns/drip.js` — 3 spec templates (nurture / proposal / winback)
- `lib/automation/workflow-engine.js` — `create_task` action
- `components/marketing/CampaignBuilder.tsx` — primary automation entry
- `components/automation/VisualWorkflow.tsx` — drag-drop Trigger → Delay → Action
- `components/automation/WorkflowBuilder.tsx` — Create Task step type
- `components/automation/AutomationHub.tsx` — visual workflow section
- `app/campaigns/page.js` — CampaignBuilder above legacy table

**Tests:** drip template assertions in `p0-leadedge360.test.js`

---

## PR-3: Integrations + Security & SSO
**Branch:** `feat/p1-integrations-sso`

- `app/administration/integrations/page.tsx` — Gmail, Outlook, Meta, Google, Razorpay, WhatsApp cards
- `components/suite/SettingsModule.js` — **Security & SSO** tab (Google + SAML + SLA card)
- Existing: `lib/auth/sso.js`, `IntegrationsSettingsPanel`, `IntegrationCenter`

**Acceptance:** Enterprise admin opens Settings → Security & SSO; Gmail OAuth from Integrations page.

---

## PR-4: Attribution + Analytics tab
**Branch:** `feat/p1-attribution-analytics`

- `components/analytics/Attribution.tsx` — re-export from reports
- `app/analytics/page.js` — Overview + Attribution & ROAS tabs
- Existing: `components/reports/Attribution.tsx`, `/api/analytics/attribution`, `/api/analytics/roi`

---

## PR-5: Nav cleanup + unified sidebar
**Branch:** `feat/p0-nav-unify`

- `components/layout/Sidebar.tsx` — full reference module tree, Automation Hub primary, Get Started checklist
- `components/suite/nav-config.ts` — Marketing + Administration alignment
- `isLeadEdge360Path` — dashboard + administration use unified sidebar
- Canonical leads: `/leadedge360/leads` (legacy `/leads` redirects)

---

## Loom demo script (onboarding → paid)

1. **Signup** (0:00–0:30) — new trial; demo pipeline auto-seeds (10 leads, 1 opp, 1 proposal).
2. **Get Started checklist** (0:30–1:00) — sidebar 3/3; open Leads → AI scores tour.
3. **Automation** (1:00–1:30) — Automation Hub → activate New Lead Nurture; show visual workflow.
4. **WhatsApp CTA** (1:30–1:45) — lead detail → Send WhatsApp Intro.
5. **Integrations** (1:45–2:15) — `/administration/integrations` → connect Gmail (OAuth).
6. **Enterprise** (2:15–2:30) — Settings → Security & SSO → SAML + SLA card.
7. **Attribution** (2:30–2:45) — Analytics → Attribution tab → Source → Lead → Revenue / ROAS.
8. **Paid** (2:45–3:00) — Settings → Billing → Razorpay checkout (existing flow).

Record at 1920×1080 + one mobile clip for WhatsApp CTA.

## Verify locally

```bash
node --test tests/p0-leadedge360.test.js
npm run dev
```
