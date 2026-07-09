# Real Estate Hot Lead — Sales Playbook

**Audience:** AsoftechInsightz sales team using LeadEdge360 Geo Leads  
**Target:** Hot leads (score 80+, label Hot) from Google Maps / Places in NCR  
**Product pitch:** LeadEdge360 CRM + Geo Lead Finder + AI follow-ups

---

## Before you call (2 min per lead)

1. Open lead **Details** in CRM — note phone, website, territory, score
2. Google the company name — confirm they are active (listings, reviews)
3. Check website — do they use a CRM or only WhatsApp + Excel?
4. Prepare: 15-min demo link + Growth Audit URL `https://asoftechinsightz.com/growth-audit`

---

## Phone script (3–4 min)

### Opening

> "Good morning/afternoon, am I speaking with [Company Name]?  
> This is [Your Name] from **AsoftechInsightz**. We help real estate agencies in [City] capture and follow up on property enquiries faster — I'll keep this under 2 minutes."

### Pain hook (pick one)

> "Most brokers we speak to lose 30–40% of enquiries because leads sit on WhatsApp with no follow-up tracking."

> "When a buyer calls about a 2BHK in [Area], does your team log it in one place or across 3 phones?"

### Value (LeadEdge360)

> "We built **LeadEdge360** — a CRM made for Indian businesses. It scores leads Hot/Warm/Cold, assigns them to agents, and sends follow-up reminders.  
> Our **Geo Lead Finder** pulls verified business listings by PIN code — the same tool we used to find your office."

### Ask

> "Would a **15-minute demo** this week work? I can show how you'd track every buyer enquiry and never miss a callback."

### If interested

- Book demo → create **Follow-up** in CRM with date/time
- Status → **Contacted**
- Send WhatsApp confirmation (template below)

### If not now

> "No problem — I'll WhatsApp our Growth Audit link. It's free and shows 3 quick wins for your sales process."

- Status stays **New** or → **Contacted**
- Schedule follow-up in 3 days

### If wrong number / not decision maker

> "Who handles sales or marketing for new enquiries?"

- Add note in CRM → follow up with correct contact

---

## Objection handling

| Objection | Response |
|-----------|----------|
| "We already use a CRM" | "Which one? Most real estate teams we meet use Excel or builder CRMs that don't score leads or do geo prospecting. Happy to compare in 15 min." |
| "Send details on WhatsApp" | "Sure — sending now. Can we book 15 min Thursday to walk through the demo?" |
| "Too expensive" | "Pilot starts at a fraction of one deal commission. Most teams recover cost from one extra closure." |
| "Not interested" | "Understood. May I send our free Growth Audit? No sales call required." → Status **Lost** with reason |

---

## WhatsApp templates

Copy-paste and replace `[brackets]`. Send from business number only.

### Template 1 — After missed call

```
Hi, this is [Your Name] from AsoftechInsightz.

I tried reaching [Company Name] regarding how real estate teams in [City] track buyer enquiries and follow-ups.

We help agencies with:
✅ Lead scoring (Hot/Warm/Cold)
✅ Geo Lead Finder by PIN code
✅ GST-ready proposals in 48 hours

15-min demo this week? Reply YES or a good time.

— Team AsoftechInsightz
https://asoftechinsightz.com/leadedge360
```

### Template 2 — After positive call

```
Hi [Name], great speaking with you.

As discussed — LeadEdge360 demo for [Company Name]:
📅 [Date] at [Time]
🔗 [Zoom/Google Meet link]

We'll cover Geo Leads, CRM pipeline, and AI follow-up reminders.

Reply if you need to reschedule.

— [Your Name], AsoftechInsightz
```

### Template 3 — Nurture (no response after 3 days)

```
Hi [Name], following up on LeadEdge360 for [Company Name].

Quick win we see for NCR real estate teams: centralize WhatsApp + website leads so no buyer enquiry is missed.

Free Growth Audit (no pitch): https://asoftechinsightz.com/growth-audit

Happy to demo when convenient.
```

### Template 4 — Post-demo

```
Thank you for the demo today, [Name].

Next steps:
1. [Pilot plan / pricing shared]
2. Your team onboarding — Week 1
3. First Geo Lead scan for your target PIN codes

Reply with any questions — we respond within 2 business hours.

— Team AsoftechInsightz
```

---

## CRM actions after every touch

| Action | When |
|--------|------|
| Status → **Contacted** | After first call or WhatsApp |
| Add **Follow-up** | Every promised callback |
| Status → **Qualified** | Confirmed interest + budget/timeline |
| Create **Opportunity** | Demo scheduled |
| Create **Proposal** | After demo, score still Hot |
| Status → **Lost** | Hard no — add reason in notes |

---

## Daily targets (dogfood metrics)

| Metric | Target |
|--------|--------|
| Hot leads contacted | 10/day |
| WhatsApps sent | 10/day |
| Demos booked | 2/week |
| Proposals sent | 1/week |

---

## Bulk queue in LeadEdge360

On **Leads Management** page → click **Queue Hot Leads** to:

- Assign all unassigned Hot leads (NCR → Delhi NCR agent)
- Create **Initial Call** follow-up (due in 24h)
- Create **Call Hot Lead** task (high priority)

VPS CLI:

```bash
cd /opt/asoftech-insightz
node scripts/bulk-queue-hot-leads.mjs
node scripts/bulk-queue-hot-leads.mjs --dry-run   # preview only
```

---

## Related

- [GEO_LEAD_FINDER_QUALITY.md](../platform/GEO_LEAD_FINDER_QUALITY.md)
- [GROWTH_AUDIT_NURTURE_EMAILS.md](../marketing/GROWTH_AUDIT_NURTURE_EMAILS.md)
- [DEMO_SALES_DECK_OUTLINE.md](../marketing/DEMO_SALES_DECK_OUTLINE.md)
