# LeadEdge360 — AI Content Library

**Version:** 1.0  
**Usage:** Reusable prompts for CS, sales, and customers. Adapt bracketed fields.

**Platform AI prompts (in-product):** `config/aeo/prompts/*.json` — invoked via AI Growth Engine when `EMERGENT_LLM_KEY` is set.

---

## 1. Sales emails

### Cold outreach

```
Subject: [City] [industry] — faster lead follow-up?

Hi [Name],

I noticed [Company] serves [City]. Many teams like yours get strong inquiry volume on WhatsApp and Google but lose deals when follow-up is slow.

LeadEdge360 scores every lead with AI and shows your team who to call first — plus an AI Growth Engine to improve Google visibility.

Worth a 15-minute walkthrough this week?

[Your name]
```

### Post-demo follow-up

```
Subject: Your LeadEdge360 pilot checklist

Hi [Name],

Great speaking today. As discussed:

1. Sign in at app.asoftechinsightz.com/signin
2. Complete AI Growth Engine profile (target 80% completeness)
3. Add your first 10 leads
4. We'll schedule Week 1 check-in on [date]

Pilot plan: [Starter/Growth] at ₹[price]/month.

[Your name]
```

---

## 2. WhatsApp messages

### Hot lead — immediate response

```
Hi [Name], thanks for your inquiry about [service/product].

I'm [Rep] from [Business]. We serve [territory] and typically respond within a few hours.

Quick question: what timeline are you looking at?
```

### Warm nurture

```
Hi [Name], following up on your message from [day].

We still have availability for [service] in [area]. Happy to share pricing or a quick call — what works for you?
```

### Review request (after Won)

```
Hi [Name], thank you for choosing [Business]!

If you had a good experience, a short Google review helps other customers find us. [GBP link]

We appreciate your support.
```

**In-app:** Use WhatsApp icon on lead row for pre-filled `wa.me` links.

---

## 3. Proposal follow-ups

### Day 1 after Proposal status

```
Hi [Name], as discussed, here’s a summary of what we proposed:

• Scope: [summary]
• Price: ₹[amount]
• Timeline: [timeline]

Any questions? I'm available on WhatsApp today.
```

### Day 7 — gentle nudge

```
Hi [Name], checking if you had a chance to review our proposal for [service].

Happy to adjust scope or answer questions. Should we schedule a 10-min call?
```

### Day 14 — final follow-up

```
Hi [Name], I don't want to clutter your inbox — shall I close this request for now, or is timing still uncertain?

Either way, we're here when you're ready.
```

---

## 4. Customer replies (support & service)

### Pricing inquiry

```
Thanks for asking! Our [service] in [area] typically starts at ₹[range].

For an exact quote I need: [1–2 qualifying questions].

You can also call/WhatsApp us at [phone].
```

### Service area question

```
Yes, we serve [territories]. For [specific area], [confirm yes/no + any visit fee].

Would you like us to call you with details?
```

---

## 5. Business growth suggestions (coach prompts)

Use with customer during weekly CS call — maps to AEO recommendations.

```
1. What is your top customer question this week? → Add as FAQ in AI Growth Engine.
2. Which city brought zero leads last month? → Run a local campaign there.
3. How many Google reviews are unanswered? → Update Review Health + reply drafts.
4. Which lead source dropped? → Check SOURCES chart; rebalance ad spend.
5. How many Proposal-stage leads are older than 14 days? → WhatsApp re-contact list.
```

---

## 6. Marketing content

### Google Business post (aligns with `config/aeo/prompts/gbp-post.json`)

**Prompt for ChatGPT / in-app GBP draft:**

```
Write a 2–3 sentence Google Business Profile post for [business name], a [category] in [city].

Highlight: [offer or tip].
Tone: professional, local, no hashtags.
Include a soft CTA to call or WhatsApp.
```

### Service description (aligns with `service-description.json`)

```
Improve this business description for local SEO and AI search (max 160 chars short + 400 chars long):

Business: [name]
Category: [category]
Areas: [service areas]
Keywords: [keywords]
```

---

## 7. Social media

### LinkedIn (company)

```
This week we helped [metric] — e.g. "12 hot leads identified in one dashboard."

MSME tip: Answer the 5 questions customers ask you most — as FAQs on your profile and Google listing.

#LeadGeneration #MSMEIndia
```

### Instagram / Facebook caption (aligns with `social-caption.json`)

```
Prompt: Write a short caption for [business] promoting [offer] in [city]. Max 2 sentences + 3 relevant hashtags. Indian audience.
```

---

## 8. Customer engagement

### Re-engagement (cold leads)

```
Hi [Name], we haven't connected in a while. We're offering [promotion] for [service] in [month].

Still interested? Reply YES and I'll share details.
```

### Post-win check-in (retention)

```
Hi [Name], hope [service/delivery] went well!

Anything else we can help with this month? We also serve [related service] if needed.
```

---

## In-product AI actions (LeadEdge360)

| Action | Prompt file | UI location |
|--------|-------------|-------------|
| Suggest FAQs | `faq-suggestions.json` | AEO → Improve profile |
| Improve description | `description-improve.json` | Profile panel |
| GBP post draft | `gbp-post.json` | Recommendations |
| Review reply | `review-reply.json` | Review section |
| WhatsApp outreach | `whatsapp-outreach.json` | Recommendations |
| Local page draft | `local-page.json` | Recommendations |
| Social caption | `social-caption.json` | Recommendations |

**Fallback:** When LLM unavailable, rule-based recommendations still appear (Growth scanner).

**CS note:** Always **verify** AI output before publishing externally.

---

## Related

- [AI_BUSINESS_GROWTH_PLAYBOOK.md](./AI_BUSINESS_GROWTH_PLAYBOOK.md)  
- `docs/aeo/AEO_AI_RECOMMENDATION_CATALOG.md`
