# LeadEdge360 P0 — 2-minute demo script

Record at **1920×1080** (desktop) plus one **390×844** mobile clip for WhatsApp CTA.  
Env: demo org with `NEXT_PUBLIC_LEADEDGE_DEMO_VIDEO` optional for empty-state embed.

## 1. Signup → onboarding (0:00–0:35)

1. Open `/signup` → create trial account.
2. Land on `/onboarding` — **Step 1**: enter company name + industry → Continue.
3. **Step 2**: click **Import demo leads** → confirm ~10 industry-matched leads seeded.
4. **Step 3**: click **View AI scores** → routes to `/leadedge360/leads?tour=1` (not legacy `/leads`).
5. Guided tour highlights AI score badges → onboarding completes; dashboard unlocks.

**Narration:** “Three steps: company, demo data, AI scores — under a minute to a live pipeline.”

## 2. Empty state + leads list (0:35–0:50)

1. Optional: fresh org with zero leads → **LeadsEmpty** shows video + **Import CSV** + **Add Demo Data**.
2. Canonical nav: sidebar **Leads** → `/leadedge360/leads`.
3. Legacy `/leads?tour=1` redirects with query preserved.

## 3. WhatsApp CTA on lead detail (0:50–1:10)

1. Open any lead → `/leadedge360/leads/{id}`.
2. Click **Send WhatsApp Intro** in header actions.
3. Show success toast / thread update (or soft upgrade gate if `whatsapp_pro` not entitled).

**Mobile:** same flow on narrow viewport — button remains visible in action row.

## 4. Workflow Lite (1:10–1:45)

1. Go to `/leadedge360/automation`.
2. Open **Workflow Lite** / drip hub → activate **New Lead Nurture**.
3. Explain flow: **trigger** (lead created) → **wait 1 day** → **email** → **if no reply 3 days** → **WhatsApp**.
4. Create a test lead → show enrollment (or scheduled run via `POST /api/automation/run-scheduled` with `CRON_SECRET`).

## 5. Wrap (1:45–2:00)

- Unified routes under `/leadedge360/*`.
- Razorpay billing unchanged; WhatsApp via existing API.
- Run tests: `npm run test:unit` (includes `tests/p0-leadedge360.test.js`).

## PR checklist

- [ ] Unit: `npm run test:unit`
- [ ] E2E (optional staging): `npm run test:e2e -- e2e/enterprise/ui-patterns.spec.js`
- [ ] Attach this recording or Loom link to PR description
- [ ] Verify middleware allows `/leadedge360/leads` during onboarding step 3
