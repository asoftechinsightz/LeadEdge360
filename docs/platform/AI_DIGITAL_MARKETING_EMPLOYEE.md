# AsoftechInsightz — AI Digital Marketing Employee

**Project:** Autonomous AI-powered Digital Marketing Department  
**Mission:** Create, review, publish, monitor, and optimize social content with minimal founder intervention.  
**Logo:** `/images/brand/asoftechinsightz-logo.png`  
**Dashboard:** `/marketing-engine`

---

## Executive summary

The **AI Digital Marketing Employee** is a virtual marketing team dedicated to building the **AsoftechInsightz** brand and generating qualified B2B leads — before separate campaigns for LeadEdge360 or RetailEdge360.

It extends the existing **LeadEdge360 Marketing Engine** with 10 core agents, daily IST automation, content strategy mix, and an executive dashboard.

---

## Primary objectives

| Objective | How |
|-----------|-----|
| Build trust | Educational + thought leadership content (40%) |
| Brand awareness | Daily multi-platform publishing |
| Inbound leads | Growth Audit CTA on every post |
| Book demos | Engagement agent escalates sales intent |
| Website traffic | Links + reels with end-screen CTA |
| LinkedIn followers | Daily 10:00 AM IST posts |
| B2B enquiries | Lead Capture → LeadEdge360 CRM |

---

## AI Marketing Team (implemented)

| Agent | Schedule (IST) | Status |
|-------|--------------|--------|
| **CEO Marketing Agent** | 21:00 daily | Daily report + KPIs |
| **Research Agent** | 06:00 daily | Industry topics + trends |
| **Content Writer Agent** | 07:00 daily | LinkedIn, FB, IG, X posts |
| **Graphic Designer Agent** | 08:00 daily | Branded creative briefs |
| **Reel Creator Agent** | 09:00 daily | 30–60s scripts + scenes |
| **Video Production Agent** | 18:00 daily | Reel publish briefs |
| **Publisher Agent** | Hourly + platform slots | n8n → social APIs |
| **Engagement Agent** | Every 2h | Reply suggestions |
| **Lead Capture Agent** | Realtime | Web + social → CRM |
| **Analytics Agent** | 20:00 daily | Dashboard snapshot |

Registry: `lib/marketing-engine/agents.js`

---

## Daily automation (IST)

```
06:00  Research industry news
07:00  Generate today's content
08:00  Create graphics
09:00  Create reel script
10:00  Publish LinkedIn
11:00  Publish Facebook
12:00  Publish Instagram
13:00  Publish X
18:00  Publish Reel
20:00  Collect analytics
21:00  CEO daily report
```

**Cron:** Hourly `POST /api/agents/scheduled/run` triggers publisher + daily orchestrator for current IST hour.

**Manual:** `/marketing-engine` → **Run Today's Pipeline**

---

## Content strategy mix

| Category | Weight | Focus |
|----------|--------|--------|
| Educational | 25% | Trust + thought leadership |
| **LeadEdge360 product pitch** | **25%** | CRM, AI scoring, proposals, GST |
| **RetailEdge360 product pitch** | **15%** | Retail inventory, engagement, POS |
| Product demonstrations | 15% | Feature walkthroughs, pricing hints |
| Problems & solutions | 10% | Pain → product solution |
| AsoftechInsightz brand | 5% | Company updates, building in public |
| Industry news | 5% | Trends tied to products |

**Daily platform rotation:**
- **LinkedIn 10:00** → LeadEdge360 pitch
- **Facebook 11:00** → Product demo (alternates products)
- **Instagram 12:00** → RetailEdge360 pitch
- **X 13:00** → Educational + subtle product mention

Pitch library: `lib/marketing-engine/product-pitch.js`

---

## Branding rules (enforced in prompts)

- Always use **AsoftechInsightz** logo (`/images/brand/asoftechinsightz-logo.png`)
- Colors: Primary Blue `#0066FF`, Navy `#0A1F44`, Dark Grey `#333333`
- Every post includes: **Website** · **Email** · **Book a Demo CTA**
- Never use copyrighted media or fake testimonials/metrics
- Tone: Professional, simple English, human, SEO-friendly

---

## Architecture

```
/marketing-engine (Dashboard)
        ↓
lib/marketing-engine/
  research-agent.js      → marketing_research_daily
  content-writer.js      → marketing_content + calendar
  graphic-brief.js       → marketing_assets
  reel-creator.js        → marketing_video_briefs
  publisher.js           → n8n → LinkedIn/FB/IG/X
  engagement-agent.js    → marketing_engagement_queue
  ceo-marketing-agent.js → marketing_reports
  daily-orchestrator.js  → marketing_agent_runs
        ↓
LeadEdge360 CRM (leads, campaigns, proposals)
```

---

## API endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/marketing-engine/daily/run` | Run full daily pipeline |
| POST | `/api/marketing-engine/research/run` | Trigger research |
| GET | `/api/marketing-engine/research/run` | Latest research |
| GET | `/api/marketing-engine/report` | Latest CEO daily report |
| POST | `/api/marketing-engine/publisher/run` | Publish due posts |
| POST | `/api/marketing-engine/worker/run` | Cron worker (`job: daily_tick`) |

---

## Social platform access (required for autopublish)

See [SOCIAL_AUTOPILOT_SETUP.md](../marketing/SOCIAL_AUTOPILOT_SETUP.md)

1. Connect **LinkedIn OAuth** in n8n (start here)
2. Connect Meta for Facebook + Instagram
3. Set `N8N_WEBHOOK_URL` in `.env`
4. Enable hourly cron with `AGENT_CRON_SECRET`

---

## VPS deploy

```bash
cd /opt/asoftech-insightz
npm run marketing-engine:indexes
npm run marketing-engine:seed-asoftech
docker compose build app --no-cache && docker compose up -d app n8n
```

Or upload `marketing-launch-bundle.tar.gz` and run `bash scripts/vps-apply-marketing-launch.sh`

**Validation & pending queue runbook:** `docs/marketing/MARKETING_ENGINE_VALIDATION_AND_QUEUE.md`

---

## Roadmap (next phases)

| Phase | Feature |
|-------|---------|
| **A** | Approval queue UI (CEO agent approves before publish) |
| **B** | Canva API / image generation from graphic briefs |
| **C** | Video render pipeline (FFmpeg / external API) |
| **D** | Live social analytics from n8n → dashboard |
| **E** | Monthly CEO report PDF |
| **F** | Dedicated paid campaigns per product |

---

## Success criteria

- [ ] Daily content published without founder writing posts
- [ ] 10+ Growth Audit leads/month from social
- [ ] CEO daily report delivered at 21:00 IST
- [ ] Brand-consistent creatives with logo on all assets
- [ ] Engagement replies suggested within 2 hours
- [ ] Qualified leads in LeadEdge360 with source attribution

---

## Brand + product strategy

Content promotes **AsoftechInsightz** as parent brand while pitching both products on a rotating schedule (~55% direct product pitches/demos).

| Product | Pitch focus | CTA |
|---------|-------------|-----|
| LeadEdge360 | AI CRM, lead scoring, proposals, GST | `/growth-audit` |
| RetailEdge360 | Inventory, engagement, retail intelligence | `/retailedge360` |
| AsoftechInsightz | Trust, innovation, suite overview | `/contact` |

---

## Related docs

- [AI Marketing Engine](./AI_MARKETING_ENGINE.md)
- [Marketing Strategy](./ASOFTECHINSIGHTZ_MARKETING_STRATEGY.md)
- [Social Autopilot Setup](../marketing/SOCIAL_AUTOPILOT_SETUP.md)
- [LinkedIn Week 1 Posts](../marketing/LINKEDIN_WEEK1_POSTS.md)
