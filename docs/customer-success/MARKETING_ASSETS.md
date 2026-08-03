# LeadEdge360 — Marketing Assets

**Version:** 1.0  
**Usage:** Copy-ready GTM content. Customize `[Company]`, `[City]`, `[Contact]`.

**Pricing source:** `app/(marketing)/pricing/page.js`  
**Product URL:** `https://app.asoftechinsightz.com`

---

## 1. Website — Hero & value props

### Hero

**Headline:** Turn WhatsApp inquiries into won deals — with AI that grows your visibility.

**Subhead:** LeadEdge360 gives Indian MSMEs one workspace for lead intelligence, CRM, and AI-powered business growth. Capture from Google, Facebook, and WhatsApp. Score every lead. Close faster.

**CTA:** Start free pilot · Book a demo

### Value pillars

1. **AI lead scoring** — Know which inquiry to call first  
2. **AI Growth Engine** — Improve Google, AI search, and local visibility  
3. **WhatsApp-native CRM** — Deep links and nurture automation  
4. **Retail intelligence** — Shelf-life AI for expiry-prone inventory (RetailEdge360)

---

## 2. One pager

**LeadEdge360 — AI Growth CRM for Indian MSMEs**

| | |
|---|---|
| **Problem** | Leads lost in WhatsApp chats; no pipeline view; poor Google visibility |
| **Solution** | Unified CRM + AEO Growth Engine + channel ingest |
| **Who** | Service MSMEs, retail, distribution (5–200 employees) |
| **Differentiator** | India-first WhatsApp + answer-engine optimization built-in |
| **Modules** | LeadEdge360 CRM · AI Growth Engine · RetailEdge360 (optional) |
| **Pricing** | Starter ₹1,499/mo · Growth ₹4,999/mo · Scale custom |
| **Pilot** | 30-day guided onboarding with Customer Success |
| **Contact** | Enquiry@asoftechinsightz.com · app.asoftechinsightz.com |

---

## 3. Brochure (print/digital — 2 pages)

### Page 1 — Cover

**LeadEdge360**  
*Intelligent leads. Visible business. Faster growth.*

Asoftech Insightz · Made for India

### Page 2 — Features

- **Dashboard** — Leads, hot pipeline, conversion, retail risk at a glance  
- **AI Growth Engine** — AEO Score, FAQs, local visibility, review health  
- **LeadEdge360 CRM** — Pipeline, territories, sources, agent performance  
- **WhatsApp** — Capture, outreach, automation (n8n)  
- **RetailEdge360** — SKU risk, inventory value, revenue shielded  

**CTA:** Scan to sign in → `https://app.asoftechinsightz.com/signin`

---

## 4. Pitch deck (slide outline)

| # | Slide | Content |
|---|-------|---------|
| 1 | Title | LeadEdge360 — AI Growth CRM |
| 2 | Problem | Fragmented leads, slow follow-up, invisible on Google |
| 3 | Solution | One platform: capture → score → grow → win |
| 4 | Product | Dashboard screenshot areas (no fake UI) |
| 5 | AI Growth Engine | 5 AEO KPIs explained |
| 6 | CRM | Pipeline, charts, WhatsApp |
| 7 | Retail | Optional RetailEdge360 |
| 8 | Integrations | Google, FB, WhatsApp, API |
| 9 | Social proof | Pilot metrics / testimonial (when available) |
| 10 | Pricing | 3 tiers |
| 11 | ROI | 8 extra wins × ₹25k example |
| 12 | CTA | Pilot + contact |

---

## 5. LinkedIn

### Company post

🚀 Indian MSMEs lose deals in WhatsApp threads before they become customers.

LeadEdge360 brings every lead into one AI-scored pipeline — plus an **AI Growth Engine** that helps you show up on Google and AI search.

✅ WhatsApp + Google + Facebook capture  
✅ Hot lead alerts  
✅ Local visibility tracking  
✅ 30-day CS-guided pilot  

👉 `https://app.asoftechinsightz.com`

#MSME #CRM #AI #WhatsAppBusiness #LeadGeneration

### Founder post (short)

We built LeadEdge360 because Indian businesses don’t need another complex CRM — they need **speed** on WhatsApp and **visibility** on Google. One dashboard. AI scoring. Growth playbooks included.

---

## 6. WhatsApp (sales outreach)

**Template A — cold intro**

```
Hi [Name], this is [Rep] from [Company].

We help [industry] businesses in [City] capture leads from WhatsApp & Google in one place — with AI that shows which inquiry to call first.

Open to a 15-min demo this week?
```

**Template B — post-demo**

```
Thanks for your time today, [Name].

Quick recap: LeadEdge360 → all leads in one pipeline, AI Growth Engine for Google visibility, WhatsApp follow-up built in.

Pilot starts at ₹1,499/mo. I'll send the onboarding checklist.
```

---

## 7. Email campaign (3-part nurture)

### Email 1 — Awareness

**Subject:** Still chasing leads in WhatsApp?

Body: Problem → LeadEdge360 one-liner → link to `/products` → CTA demo

### Email 2 — Education

**Subject:** 3 ways MSMEs lose Google leads (and how to fix)

Body: Local SEO + FAQs + review replies → tie to AEO KPIs → link [AI_BUSINESS_GROWTH_PLAYBOOK.md](./AI_BUSINESS_GROWTH_PLAYBOOK.md) concepts

### Email 3 — Conversion

**Subject:** Your 30-day growth plan is ready

Body: Pilot offer → pricing → book kickoff with CS

---

## 8. Product introduction (long-form)

**LeadEdge360** is the lead intelligence and growth module of the Asoftech Insightz platform. It combines:

1. **Multi-channel capture** — website API, WhatsApp, Google Lead Forms, Facebook Lead Ads (via n8n automation configured by ops)  
2. **AI scoring** — Hybrid rules engine with optional LLM (`EMERGENT_LLM_KEY`) for richer reasons  
3. **CRM workspace** — statuses New → Won, territory and source analytics, agent performance  
4. **AI Growth Engine (AEO)** — Business profile, FAQ readiness, local visibility, review health, AI content drafts  
5. **RetailEdge360** (optional) — SKU shelf-life prediction and expiry risk dashboards  

Deployed at `https://app.asoftechinsightz.com` with DPDP-compliant consent flows.

---

## 9. Pricing sheet

| Plan | Price (INR/mo) | Leads | Users | Highlights |
|------|----------------|-------|-------|------------|
| **Starter** | ₹1,499 | 500 | 1 | Web + WhatsApp capture, basic AI scoring, email support |
| **Growth** | ₹4,999 | 10,000 | 5 | All channels, advanced AI, territories, RBAC, WhatsApp automation, priority support |
| **Scale** | Custom | Unlimited | Unlimited | SSO, audit logs, dedicated CSM, on-prem/VPC, SLA 99.95% |

**Checkout:** `/pricing` (Razorpay when keys configured)  
**Note:** Live pilot may show billing checkout unavailable until Razorpay keys set (`/api/health`).

---

## Asset checklist

| Asset | Status | Owner |
|-------|--------|-------|
| Website copy | Ready (this doc §1) | Marketing |
| One pager PDF | Export from §2 | Marketing |
| Brochure | Export from §3 | Marketing |
| Deck | Build from §4 | Sales |
| Social | §5–6 | Marketing |
| Email sequence | §7 | Marketing + CS |
