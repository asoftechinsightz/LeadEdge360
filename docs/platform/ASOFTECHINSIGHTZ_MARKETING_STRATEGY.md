# AsoftechInsightz — Marketing Strategy (90-Day Plan)

**Company:** AsoftechInsightz Pvt Ltd  
**Products:** LeadEdge360 · RetailEdge360  
**Promise:** Innovate • Integrate • Deliver • Satisfy  
**Positioning:** End-to-End Digital Transformation Partner · AI & Automation SaaS Suite  
**Primary market:** Indian SMEs & mid-market (UP, NCR, pan-India remote sales)

---

## 1. Strategic goal (90 days)

**Generate qualified B2B leads for LeadEdge360** and prove the platform by using it on ourselves (dogfooding).

| Metric | Day 30 | Day 60 | Day 90 |
|--------|--------|--------|--------|
| Inbound leads/month | 15 | 40 | 80 |
| Growth Audit submissions | 10 | 25 | 50 |
| Demo calls booked | 5 | 15 | 30 |
| Paying pilots | 0 | 1 | 3 |
| LinkedIn posts/week | 5 | 7 | 7 (autopilot) |

**North star:** 3 paying pilot clients on LeadEdge360 Enterprise by end of Q3 2026.

---

## 2. Ideal Customer Profile (ICP)

### Primary — LeadEdge360

| Attribute | Profile |
|-----------|---------|
| **Who** | Owner, Sales Head, or IT decision-maker |
| **Company size** | 10–200 employees |
| **Industries** | IT services, coaching institutes, BFSI distributors, manufacturing sales teams |
| **Pain** | Leads in Excel/WhatsApp, slow proposals, no follow-up discipline, no pipeline visibility |
| **Budget** | ₹15k–₹1.5L/month for software |
| **Geo (Phase 1)** | Noida, Delhi NCR, Lucknow, remote India |

### Secondary — RetailEdge360

| Attribute | Profile |
|-----------|---------|
| **Who** | Retail chain owner, store ops manager |
| **Pain** | Inventory chaos, no customer engagement, no unified CRM |
| **Geo** | Tier 2–3 cities in UP |

**Say no to (for now):** Enterprise RFPs >500 users, government tenders, clients needing heavy customization before pilot.

---

## 3. Positioning & messaging

### Master brand (AsoftechInsightz)

> *We help Indian businesses grow revenue with AI-powered CRM, marketing automation, and retail intelligence — one integrated suite.*

### LeadEdge360 (hero product)

> *Capture. Engage. Convert.* — AI CRM that scores leads, writes proposals, sends GST invoices, and runs your sales follow-up.

### RetailEdge360 (vertical)

> *Smart Retail. Simplified Growth.* — Inventory, engagement, and customer intelligence for modern retail.

### Proof points (use only what is true today)

- Multi-tenant SaaS on production VPS (certified 24/24 agent runtime)
- 12 AI agents for sales, marketing, finance
- GST-ready proposals & invoices
- DPDP-aware lead capture
- Built in India, for Indian SMEs

**Do not claim** until you have real clients: “500+ customers”, fake logos, invented case study metrics.

---

## 4. Funnel architecture

```
AWARENESS          CONSIDERATION         CONVERSION           RETENTION
──────────         ─────────────         ──────────           ─────────
LinkedIn/FB/IG  →  Growth Audit       →  Demo call        →  Onboarding
Blog/SEO        →  /contact           →  Proposal         →  Customer success
WhatsApp status →  Business card /QR  →  Pilot agreement  →  Upsell Enterprise
Referrals       →  /pricing           →  Razorpay pay       →  Case study
```

### Primary CTAs (in order)

1. **Free Growth Audit** → `/growth-audit` (highest intent)
2. **Book a demo** → `/contact`
3. **Explore pricing** → `/pricing`
4. **Digital business card** → `/c/asoftech-demo` (networking events)

---

## 5. Channel strategy

### Tier 1 — Start immediately (Week 1–4)

| Channel | Action | Owner | Tool |
|---------|--------|-------|------|
| **LinkedIn** | 5 posts/week: tips, product, founder story | Founder | Marketing Engine + manual |
| **Website** | All forms → `asoftechinsightz` CRM | Auto | LeadEdge360 |
| **Growth Audit** | Promote in every post CTA | Marketing | `/growth-audit` |
| **WhatsApp** | Status + follow-up on warm leads | Sales | CRM + templates |
| **Network** | Noida/UP business groups, CA firms, IT partners | Founder | Business card QR |

### Tier 2 — Month 2–3

| Channel | Action |
|---------|--------|
| **Facebook / Instagram** | Repurpose LinkedIn content |
| **Google Business Profile** | Weekly updates, link to Growth Audit |
| **Email nurture** | Campaign to audit leads (SMTP Hostinger) |
| **Partner referrals** | `/partners` — 10% referral for CAs, agencies |
| **Geo scanner** | Local business leads → outreach |

### Tier 3 — After first 3 pilots

| Channel | Action |
|---------|--------|
| **Paid Meta/LinkedIn ads** | ₹500–₹2,000/day on Growth Audit landing |
| **YouTube Shorts** | 30s product demos |
| **Webinars** | “AI CRM for Indian SMEs” monthly |

---

## 6. Content pillars (rotate weekly)

| Pillar | % | Examples |
|--------|---|----------|
| **Problem → Solution** | 30% | “Still tracking leads in Excel?” → LeadEdge360 |
| **Product tips** | 25% | AI lead score, proposal in 5 min, GST invoice |
| **Founder / building in public** | 20% | “How we certified our AI platform” |
| **Industry insight** | 15% | SME digital adoption, DPDP, GST |
| **Social proof** | 10% | Dogfood story, pilot wins (when real) |

### Weekly content rhythm

| Day | Activity |
|-----|----------|
| **Sunday** | Run Marketing Planner (`/marketing-engine`) |
| **Mon–Fri** | Auto-publish slots 9am, 12pm, 3pm, 6pm IST |
| **Wednesday** | 1 long post: blog or carousel idea |
| **Friday** | Review leads + pipeline in CRM |

---

## 7. Dogfooding playbook (use your own stack)

Run **AsoftechInsightz org** (`asoftechinsightz`) as Client #0:

### Daily (15 min)

1. Check **Dashboard** — new leads from forms
2. AI-score new leads
3. Reply to hot leads within 2 hours

### Weekly (1 hour)

1. `npm run marketing-engine` or UI → Run Weekly Planner
2. Review **Marketing Engine** calendar
3. 3 outbound messages to warm prospects
4. Update 1 opportunity in pipeline

### Monthly (2 hours)

1. Review analytics: leads by source, conversion
2. 1 case study draft (even if internal dogfood)
3. Adjust content pillars based on what got engagement

---

## 8. Sales process (lead → revenue)

| Stage | Action | SLA |
|-------|--------|-----|
| **New lead** | Auto AI score + assign to founder | < 1 hour |
| **Warm (50+)** | WhatsApp intro + Growth Audit offer | < 4 hours |
| **Hot (80+)** | Book demo (Google Meet) | < 24 hours |
| **Demo done** | Send proposal (ASI prefix) within 48h | 2 days |
| **Won** | Onboard as new tenant (`pilot:provision`) | 5 days |
| **Lost** | Log reason, nurture in 30 days | — |

**Pilot offer (first 3 clients):**

- **Plan:** Business Growth or Enterprise at 50% discount for 3 months
- **Includes:** Setup, training, 1 industry profile
- **Ask:** Logo permission + testimonial if successful

---

## 9. 90-day execution calendar

### Phase A — Foundation (Days 1–30)

- [ ] Enable Marketing Engine on VPS (`marketing-engine:retest` pass)
- [ ] Connect LinkedIn + n8n publish workflow
- [ ] Founder LinkedIn profile optimized (banner, headline, link to Growth Audit)
- [ ] Post 20 times on LinkedIn (manual + autopilot)
- [ ] 10 Growth Audit submissions
- [ ] 5 demo calls
- [ ] Digital business card at every meeting (`/c/asoftech-demo`)
- [ ] List 50 target companies in CRM (manual)

### Phase B — Acceleration (Days 31–60)

- [ ] Launch partner page outreach (10 CAs / IT resellers)
- [ ] Email campaign to audit leads (3-email sequence)
- [ ] Facebook + Instagram autopilot live
- [ ] 1 webinar or live demo (Zoom/Meet)
- [ ] 1 paying pilot signed
- [ ] Publish 1 real case study (can be internal dogfood first)

### Phase C — Scale (Days 61–90)

- [ ] Second and third pilot clients
- [ ] Test ₹1,000/day LinkedIn or Meta ads → Growth Audit
- [ ] Referral program active
- [ ] RetailEdge360 campaign to 20 retail prospects
- [ ] Review pricing page vs actual close rates

---

## 10. Budget (marketing only)

| Item | Monthly (INR) | Priority |
|------|---------------|----------|
| VPS (existing) | ₹0 marginal | — |
| AI (templates + light LLM) | ₹300–₹750 | Medium |
| Canva / graphics (optional) | ₹500 | Low |
| Paid ads (Month 3+) | ₹15,000–₹30,000 | After organic works |
| Events / networking | ₹2,000 | Medium |
| **Total Phase A–B** | **₹1,000–₹3,000** | Bootstrap |

---

## 11. KPI dashboard (track in LeadEdge360)

| KPI | Where |
|-----|--------|
| Leads by source | `/leads` + filters |
| Hot lead count | Dashboard |
| Growth Audit conversions | CRM + `growth.audit` events |
| Proposals sent | `/proposals` |
| Revenue | `/revenue` |
| Content published | `/marketing-engine` |
| Social → lead attribution | `source` field on leads |

**Weekly review:** Every Monday 10 AM — 30 min pipeline review.

---

## 12. Competitive differentiation

| vs Zoho / HubSpot | vs Agencies | vs Freelancers |
|-------------------|-------------|----------------|
| India GST + DPDP native | Software + automation | 24/7 AI follow-up |
| 12 AI agents included | Measurable CRM pipeline | Lower cost at scale |
| Own VPS / data control | Not just posts — leads to invoice | Integrated proposals |

---

## 13. Immediate next 7 days (start Monday)

| Day | Task |
|-----|------|
| **Day 1** | Run `marketing-engine:indexes` + enable config on VPS |
| **Day 2** | Optimize LinkedIn profile + pin Growth Audit link |
| **Day 3** | Run Weekly Planner; schedule 7 days content |
| **Day 4** | Add 25 target companies as leads in CRM |
| **Day 5** | Post founder story + Growth Audit CTA |
| **Day 6** | Follow up 5 warm contacts via WhatsApp |
| **Day 7** | Review leads; run Growth Audit yourself as QA |

---

## 14. Success definition

**Marketing strategy succeeds when:**

1. AsoftechInsightz generates **30+ qualified leads/month** without paid ads
2. **3 external pilots** pay for LeadEdge360
3. Every step runs on **your own platform** (credible demo to prospects)
4. You can show a prospect: *“This lead came from our Growth Audit yesterday — here’s the proposal we sent from the same system.”*

---

## Launch kit (ready to deploy)

| Asset | Location |
|-------|----------|
| Seed script (config + posts + emails) | `npm run marketing-engine:seed-asoftech` |
| 7 LinkedIn posts (copy-paste) | [LINKEDIN_WEEK1_POSTS.md](../marketing/LINKEDIN_WEEK1_POSTS.md) |
| 3-email Growth Audit nurture | [GROWTH_AUDIT_NURTURE_EMAILS.md](../marketing/GROWTH_AUDIT_NURTURE_EMAILS.md) |
| Demo sales deck outline | [DEMO_SALES_DECK_OUTLINE.md](../marketing/DEMO_SALES_DECK_OUTLINE.md) |
| **Canva build guide + speaker notes** | [DEMO_SALES_DECK_CANVA.md](../marketing/DEMO_SALES_DECK_CANVA.md) |
| VPS sync + seed script | `scripts/vps-sync-marketing-launch.ps1` |

**VPS deploy:**
```bash
cd /opt/asoftech-insightz
npm run marketing-engine:indexes
npm run marketing-engine:seed-asoftech
# Ensure .env has GROWTH_AUDIT_ORG_ID=asoftechinsightz
docker compose build app --no-cache && docker compose up -d app
npm run marketing-engine:retest
```

## Related

- [AI Marketing Engine](./AI_MARKETING_ENGINE.md)
- [Pilot Validation](./ASOFTECHINSIGHTZ_PILOT_VALIDATION.md)
- [Brand tokens](../../lib/brand.js)
- Pricing page: `/pricing`
