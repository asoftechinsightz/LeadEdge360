# Growth Audit — 3-Email Nurture Sequence

**Audience:** Leads from `/growth-audit` (`source: website-growth-audit`, `label: Warm`, `status: NEW`)

**Timing:** Send manually from `/campaigns` or automate via scheduled jobs (future).

Seeded as email templates + draft campaigns via `npm run marketing-engine:seed-asoftech`.

| Email | Day | Campaign name in CRM |
|-------|-----|----------------------|
| Welcome | Day 0 (same day as audit) | Growth Audit Nurture — Email 1 (Day 0) |
| Value tips | Day 2 | Growth Audit Nurture — Email 2 (Day 2) |
| Book call | Day 5 | Growth Audit Nurture — Email 3 (Day 5) |

**Merge fields:** `{{name}}`, `{{company}}`, `{{email}}`, `{{phone}}`, `{{city}}`

---

## Email 1 — Welcome (Day 0)

**Subject:** `{{name}}, your Growth Audit request is confirmed`

**Body:**

Hi {{name}},

Thank you for requesting a **free Growth Audit** from AsoftechInsightz.

We received your details for **{{company}}**. Here's what happens next:

1. Our team reviews your current sales & marketing setup (within 24 hours)
2. We prepare a short, actionable audit — not a sales pitch deck
3. We schedule a 15-minute call if you'd like to walk through it

In the meantime, explore LeadEdge360:
https://asoftechinsightz.com/leadedge360

Questions? Reply to this email or WhatsApp us — we respond within 2 business hours.

Best regards,  
Team AsoftechInsightz  
https://asoftechinsightz.com

---

## Email 2 — Value (Day 2)

**Subject:** `3 quick wins for {{company}} (from our audit playbook)`

**Body:**

Hi {{name}},

While we prepare your Growth Audit, here are **3 quick wins** we see in most Indian SMEs:

1. **Centralize leads** — Stop losing WhatsApp & form leads in scattered sheets
2. **Score before you call** — AI Hot/Warm/Cold saves 2+ hours/day for sales teams
3. **Proposal in 48h** — GST-ready proposals sent while competitors are still "getting back"

LeadEdge360 does all three in one platform — built in India, for Indian compliance (GST + DPDP).

Want a 15-min walkthrough tailored to {{company}}?

Book a demo → https://asoftechinsightz.com/contact

— Team AsoftechInsightz

---

## Email 3 — CTA (Day 5)

**Subject:** `{{name}}, ready for your Growth Audit results?`

**Body:**

Hi {{name}},

It's been a few days since you requested your Growth Audit. We'd love to share what we found for **{{company}}**.

On a 15-minute call, we'll cover:

- Where leads are likely leaking in your current process
- One automation you can implement this week
- Whether LeadEdge360 is a fit (honest answer — no pressure)

**Pilot offer:** We're onboarding 3 companies at 50% off for 3 months. First come, first served.

Pick a time for your audit call → https://asoftechinsightz.com/contact

Or reply with your preferred time — we'll confirm within 2 hours.

Best,  
Team AsoftechInsightz

---

## How to run in LeadEdge360

1. Ensure `GROWTH_AUDIT_ORG_ID=asoftechinsightz` in production `.env`
2. Run `npm run marketing-engine:seed-asoftech` on VPS
3. Go to **Campaigns** → open each nurture campaign
4. Verify SMTP is configured (Settings → Email)
5. **Execute** Email 1 when a new audit lead arrives
6. Schedule Email 2 (+2 days) and Email 3 (+5 days) — manual for now, or use follow-up engine notes

**WhatsApp alternative:** Copy Email 1 body to WhatsApp for leads with phone only (no email).
