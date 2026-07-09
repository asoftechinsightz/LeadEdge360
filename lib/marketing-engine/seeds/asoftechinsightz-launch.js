/**
 * AsoftechInsightz launch kit — Week 1 LinkedIn posts + Growth Audit nurture emails.
 * Seeded by: npm run marketing-engine:seed-asoftech
 */

export const ORG_ID = 'asoftechinsightz'
export const SEED_BATCH = 'asoftech-launch-week1-2026-06-22'

const SITE = 'https://asoftechinsightz.com'

/** Deterministic template IDs for idempotent upserts */
export const NURTURE_TEMPLATE_IDS = {
  email1: 'a1b2c3d4-e5f6-7890-abcd-ef1234567891',
  email2: 'a1b2c3d4-e5f6-7890-abcd-ef1234567892',
  email3: 'a1b2c3d4-e5f6-7890-abcd-ef1234567893',
}

export const MARKETING_CONFIG = {
  enabled: true,
  autopilot: {
    plannerDay: 0,
    plannerHourUtc: 18,
    publisherIntervalMinutes: 60,
    leadIngestIntervalMinutes: 30,
    followUpHourUtc: 6,
  },
  platforms: {
    linkedin: { enabled: true },
    facebook: { enabled: false },
    instagram: { enabled: false },
    twitter: { enabled: false },
    youtube_shorts: { enabled: false },
    google_business: { enabled: true },
  },
  publishSlots: ['09:00', '12:00', '15:00', '18:00'],
  proposalAutoThreshold: 80,
  products: ['leadedge360', 'retailedge360'],
  nurtureSequences: {
    growthAudit: {
      name: 'Growth Audit Nurture',
      audience: { label: 'Warm', status: 'NEW' },
      steps: [
        { day: 0, templateId: NURTURE_TEMPLATE_IDS.email1, campaignName: 'Growth Audit Nurture — Email 1 (Day 0)' },
        { day: 2, templateId: NURTURE_TEMPLATE_IDS.email2, campaignName: 'Growth Audit Nurture — Email 2 (Day 2)' },
        { day: 5, templateId: NURTURE_TEMPLATE_IDS.email3, campaignName: 'Growth Audit Nurture — Email 3 (Day 5)' },
      ],
    },
  },
}

export const LINKEDIN_WEEK1 = [
  {
    day: 0,
    slot: '09:00',
    pillar: 'founder',
    title: 'Week 1 — Monday — Founder story',
    body: `We built LeadEdge360 because we were tired of watching Indian SMEs lose deals in WhatsApp chats and Excel sheets.

At AsoftechInsightz, we asked one question:
"What if your CRM, proposals, GST invoices, and AI follow-up lived in one place — built for India?"

That's LeadEdge360. Capture. Engage. Convert.

We're dogfooding it ourselves — every lead, every proposal, every invoice runs on our own platform.

If you're still juggling spreadsheets for sales, I'd love your honest take in the comments.

👉 Free Growth Audit (no pitch, just a 15-min review):
${SITE}/growth-audit

#LeadEdge360 #AsoftechInsightz #IndianSaaS #SMEGrowth #AICRM`,
  },
  {
    day: 1,
    slot: '09:00',
    pillar: 'problem-solution',
    title: 'Week 1 — Tuesday — Excel problem',
    body: `Still tracking leads in Excel?

Here's what usually happens:
→ Lead comes in on WhatsApp
→ Someone notes it in a sheet (maybe)
→ Follow-up happens when someone remembers
→ Proposal goes out late — or never
→ Deal goes to a faster competitor

LeadEdge360 fixes the loop:
✅ Capture from website, QR, forms, WhatsApp
✅ AI scores Hot / Warm / Cold instantly
✅ Proposals & GST invoices in minutes
✅ Automated follow-up cadence

Indian SMEs don't need more tools. They need one system that actually runs sales.

Book a free Growth Audit → ${SITE}/growth-audit

#SalesAutomation #CRMIndia #LeadGeneration #B2BSaaS`,
  },
  {
    day: 2,
    slot: '09:00',
    pillar: 'product-tip',
    title: 'Week 1 — Wednesday — AI lead scoring',
    body: `Product tip: Stop calling every lead first.

LeadEdge360 AI scores leads as Hot, Warm, or Cold based on:
• Company fit
• Engagement signals
• Revenue potential
• Response patterns

Your sales team should talk to Hot leads within 2 hours — not sort spreadsheets all morning.

We built this for Indian IT services, coaching institutes, and BFSI distributors who get 50+ inbound leads/month but close inconsistently.

Want to see your pipeline scored live?
${SITE}/growth-audit

#AICRM #LeadEdge360 #RevenueGrowth #SalesTips`,
  },
  {
    day: 3,
    slot: '09:00',
    pillar: 'industry',
    title: 'Week 1 — Thursday — DPDP + GST',
    body: `Indian businesses need CRM that speaks Indian compliance — not US-centric SaaS with GST bolted on.

LeadEdge360 is built with:
🇮🇳 GST-ready proposals & invoices (CGST/SGST/IGST)
🔒 DPDP-aware lead capture & consent
📱 WhatsApp-friendly sales workflows
🏢 Multi-tenant — your data, your org

We're not trying to be HubSpot for India. We're building the revenue OS Indian SMEs actually need.

Curious how your current stack compares?
Take the free Growth Audit → ${SITE}/growth-audit

#DigitalTransformation #GST #DPDP #IndianSaaS #AsoftechInsightz`,
  },
  {
    day: 4,
    slot: '09:00',
    pillar: 'building-in-public',
    title: 'Week 1 — Friday — Certification story',
    body: `Building in public: We just certified our AI agent runtime — 24/24 automated tests passing on production.

What that means for you:
• 12 AI agents for sales, marketing, finance — running reliably
• Lead qualification, follow-ups, proposals — not demo vaporware
• Multi-tenant isolation — your data stays yours

We use LeadEdge360 to run AsoftechInsightz itself. Every marketing post, every audit lead, every proposal — same platform we sell.

If you're evaluating CRM for your team, ask vendors: "Can you show me YOUR pipeline in YOUR product?"

We can. Book a demo → ${SITE}/contact

#BuildInPublic #SaaS #AIAgents #LeadEdge360`,
  },
  {
    day: 5,
    slot: '09:00',
    pillar: 'problem-solution',
    title: 'Week 1 — Saturday — Proposal speed',
    body: `How long does it take your team to send a proposal after a good sales call?

Industry average for SMEs: 3–7 days.
With LeadEdge360: under 48 hours (often same day).

One platform:
→ Opportunity created from qualified lead
→ Proposal with your branding + GST line items
→ Invoice when deal closes
→ Revenue dashboard for leadership

Slow proposals kill momentum. Fast, professional proposals win trust.

See it in action — free Growth Audit:
${SITE}/growth-audit

#Proposals #B2BSales #LeadEdge360 #SMEGrowth`,
  },
  {
    day: 6,
    slot: '09:00',
    pillar: 'social-proof',
    title: 'Week 1 — Sunday — Dogfood proof',
    body: `Client #0: Ourselves.

AsoftechInsightz runs on LeadEdge360 — not a slide deck.

• This LinkedIn post was scheduled in our Marketing Engine
• Growth Audit leads land in our CRM automatically
• AI scores them before we wake up
• Proposals go out with ASI prefix, GST-ready

We're offering 3 pilot slots at 50% off for 3 months — in exchange for honest feedback and a testimonial if it works.

If you run sales for a 10–200 person company in India, let's talk.

Growth Audit (15 min, no obligation):
${SITE}/growth-audit

#AsoftechInsightz #LeadEdge360 #PilotProgram #CRMIndia`,
  },
]

export const NURTURE_EMAILS = [
  {
    id: NURTURE_TEMPLATE_IDS.email1,
    name: 'Growth Audit — Welcome (Day 0)',
    subject: '{{name}}, your Growth Audit request is confirmed',
    body: `<p>Hi {{name}},</p>
<p>Thank you for requesting a <strong>free Growth Audit</strong> from AsoftechInsightz.</p>
<p>We received your details for <strong>{{company}}</strong>. Here's what happens next:</p>
<ol>
  <li>Our team reviews your current sales &amp; marketing setup (within 24 hours)</li>
  <li>We prepare a short, actionable audit — not a sales pitch deck</li>
  <li>We schedule a 15-minute call if you'd like to walk through it</li>
</ol>
<p>In the meantime, you can explore how LeadEdge360 works:</p>
<p><a href="${SITE}/leadedge360">LeadEdge360 — AI CRM for Indian SMEs</a></p>
<p>Questions? Reply to this email or WhatsApp us — we respond within 2 business hours.</p>
<p>Best regards,<br/>Team AsoftechInsightz<br/>
<a href="${SITE}">asoftechinsightz.com</a></p>`,
  },
  {
    id: NURTURE_TEMPLATE_IDS.email2,
    name: 'Growth Audit — Value (Day 2)',
    subject: '3 quick wins for {{company}} (from our audit playbook)',
    body: `<p>Hi {{name}},</p>
<p>While we prepare your Growth Audit, here are <strong>3 quick wins</strong> we see in most Indian SMEs we work with:</p>
<ol>
  <li><strong>Centralize leads</strong> — Stop losing WhatsApp &amp; form leads in scattered sheets</li>
  <li><strong>Score before you call</strong> — AI Hot/Warm/Cold saves 2+ hours/day for sales teams</li>
  <li><strong>Proposal in 48h</strong> — GST-ready proposals sent while competitors are still "getting back"</li>
</ol>
<p>LeadEdge360 does all three in one platform — built in India, for Indian compliance (GST + DPDP).</p>
<p>Want a 15-min walkthrough tailored to {{company}}?</p>
<p><a href="${SITE}/contact">Book a demo →</a></p>
<p>— Team AsoftechInsightz</p>`,
  },
  {
    id: NURTURE_TEMPLATE_IDS.email3,
    name: 'Growth Audit — CTA (Day 5)',
    subject: '{{name}}, ready for your Growth Audit results?',
    body: `<p>Hi {{name}},</p>
<p>It's been a few days since you requested your Growth Audit. We'd love to share what we found for <strong>{{company}}</strong>.</p>
<p>On a 15-minute call, we'll cover:</p>
<ul>
  <li>Where leads are likely leaking in your current process</li>
  <li>One automation you can implement this week</li>
  <li>Whether LeadEdge360 is a fit (honest answer — no pressure)</li>
</ul>
<p><strong>Pilot offer:</strong> We're onboarding 3 companies at 50% off for 3 months. First come, first served.</p>
<p><a href="${SITE}/contact">Pick a time for your audit call →</a></p>
<p>Or reply with your preferred time — we'll confirm within 2 hours.</p>
<p>Best,<br/>Team AsoftechInsightz</p>`,
  },
]
