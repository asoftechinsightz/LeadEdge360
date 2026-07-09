import { randomUUID } from 'crypto'
import {
  WEEKLY_QUOTAS,
  PRODUCTS,
  BRAND,
  PUBLISH_SLOTS_IST,
  COLLECTIONS,
} from './constants.js'
import { generateMarketingCopy } from './llm.js'
import { insertContentBatch, upsertCalendarEntry } from './content-store.js'
import { emitPlatformEvent } from '@/lib/events/bus'
import { PLATFORM_EVENTS } from '@/lib/events/types'

const TOPIC_ROTATION = [
  'AI CRM for Indian SMEs',
  'Lead scoring that actually works',
  'Proposal automation',
  'Retail inventory intelligence',
  'WhatsApp sales workflows',
  'Multi-tenant SaaS security',
  'DPDP-compliant lead capture',
  'Revenue forecasting with AI',
  'Geo lead discovery',
  'Customer success automation',
]

function weekIdForDate(date = new Date()) {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff))
  return monday.toISOString().slice(0, 10)
}

function templateBody(type, index, product) {
  const topic = TOPIC_ROTATION[index % TOPIC_ROTATION.length]
  const p = PRODUCTS[product] || PRODUCTS.LEADEDGE360
  const cta = p.cta

  const templates = {
    linkedin_post: `🚀 ${topic}\n\n${p.name} helps teams qualify leads, automate proposals, and grow revenue — without spreadsheet chaos.\n\n${p.tagline}\n\n${cta}\n\n#LeadEdge360 #AsoftechInsightz`,
    facebook_post: `${topic} — see how ${p.name} from ${BRAND.company} helps businesses grow smarter.\n\n${cta}`,
    instagram_post: `${topic} ✨\n${p.tagline}\n\n👉 Link in bio\n#AsoftechInsightz #SaaS`,
    twitter_post: `${topic} → ${p.name} by @AsoftechInsightz ${cta.split('→')[0].trim()}`,
    blog: `# ${topic}\n\n## Introduction\nIndian SMEs are adopting AI-powered CRM to compete at enterprise speed. ${p.name} from ${BRAND.company} unifies leads, proposals, invoices, and AI agents in one platform.\n\n## Key benefits\n- Automated lead scoring\n- Proposal & invoice generation\n- AI workforce for sales & marketing\n\n## Conclusion\n${cta}`,
    customer_success_story: `Customer Success: A growing retail chain used ${p.name} to cut proposal time by 60% and improve follow-up consistency. Result: faster pipeline velocity and happier sales teams.`,
    industry_news: `Industry insight: ${topic}. Businesses using integrated CRM + AI see higher conversion rates. ${BRAND.company} builds for the Indian market with GST-ready invoicing and DPDP compliance.`,
    product_tip: `Tip ${index + 1}: Use AI lead scoring in ${p.name} to prioritize Hot leads before your competition calls them.`,
    infographic: `INFOGRAPHIC BRIEF: "${topic}" — 5 stats on SME CRM adoption in India. Brand colors: ${BRAND.primaryColor}, ${BRAND.navy}. CTA: ${cta}`,
    whitepaper: `WHITEPAPER OUTLINE: "${topic}" — Executive summary, market context, ${p.name} architecture, ROI model, implementation timeline.`,
    case_study: `CASE STUDY: How an IT services firm scaled outbound with ${p.name} — Challenge, Solution, Results (leads +40%, proposal time -50%).`,
  }

  return templates[type.replace(/^(linkedin|facebook|instagram|twitter)_post$/, (_, p) => `${p}_post`)]
    || templates[type]
    || `${topic} — ${p.name} — ${cta}`
}

function productForIndex(i) {
  return i % 3 === 1 ? 'RETAILEDGE360' : 'LEADEDGE360'
}

function scheduleForIndex(index, weekStart) {
  const dayOffset = index % 7
  const slot = PUBLISH_SLOTS_IST[index % PUBLISH_SLOTS_IST.length]
  const base = new Date(`${weekStart}T00:00:00.000Z`)
  base.setUTCDate(base.getUTCDate() + dayOffset)
  const [hh, mm] = slot.split(':').map(Number)
  // IST = UTC+5:30
  const utcMinutes = hh * 60 + mm - 330
  const dayAdjust = utcMinutes < 0 ? -1 : 0
  const mins = ((utcMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
  base.setUTCDate(base.getUTCDate() + dayAdjust)
  base.setUTCHours(Math.floor(mins / 60), mins % 60, 0, 0)
  return { scheduledAt: base.toISOString(), slot }
}

/**
 * Agent 1 — Marketing Planner
 * Generates weekly content batch per WEEKLY_QUOTAS and schedules calendar entries.
 */
export async function runMarketingPlanner(db, orgId, options = {}) {
  const weekId = options.weekId || weekIdForDate(options.date || new Date())
  const plannerRunId = randomUUID()
  const now = new Date().toISOString()
  let totalTokens = 0
  const contentItems = []
  let globalIndex = 0

  for (const quota of WEEKLY_QUOTAS) {
    const llmEnhanceCount = Math.min(quota.count, options.llmEnhancePerType || 3)

    for (let i = 0; i < quota.count; i++) {
      const productKey = productForIndex(globalIndex)
      const fallback = templateBody(quota.type, globalIndex, productKey)
      let body = fallback
      let engine = 'template'

      if (i < llmEnhanceCount) {
        const enhanced = await generateMarketingCopy({
          system: `You are the Marketing Planner for ${BRAND.company}. Write factual marketing copy only. Products: LeadEdge360 (CRM/AI) and RetailEdge360 (retail). Never invent customer names, revenue numbers, or fake testimonials. Include a clear CTA.`,
          user: `Content type: ${quota.type}. Platform: ${quota.platform}. Topic hint: ${TOPIC_ROTATION[globalIndex % TOPIC_ROTATION.length]}. Product: ${PRODUCTS[productKey].name}. Max 280 words for social, 600 for blog/whitepaper.`,
          fallback,
          temperature: 0.55,
        })
        body = enhanced.text
        engine = enhanced.engine
        totalTokens += enhanced.tokensUsed || 0
      }

      const { scheduledAt, slot } = scheduleForIndex(globalIndex, weekId)
      contentItems.push({
        type: quota.type,
        platform: quota.platform,
        format: quota.format,
        product: PRODUCTS[productKey].id,
        title: `${quota.type} — ${weekId} #${i + 1}`,
        body,
        hashtags: [],
        cta: PRODUCTS[productKey].cta,
        engine,
        weekId,
        scheduledAt,
        slot,
        metadata: { plannerIndex: globalIndex, quota: quota.type },
      })
      globalIndex++
    }
  }

  const stored = await insertContentBatch(db, orgId, contentItems, { weekId, plannerRunId })

  for (const doc of stored.docs || []) {
    await upsertCalendarEntry(db, orgId, {
      contentId: doc.id,
      platform: doc.platform,
      scheduledAt: doc.scheduledAt,
      slot: doc.slot,
      status: 'scheduled',
    })
  }

  await db.collection(COLLECTIONS.JOBS).insertOne({
    id: plannerRunId,
    orgId,
    agentId: 'marketing-planner-ai',
    type: 'weekly_plan',
    weekId,
    status: 'completed',
    stats: { ...stored, totalPlanned: contentItems.length, tokensUsed: totalTokens },
    createdAt: now,
    completedAt: now,
  })

  await emitPlatformEvent({
    db,
    orgId,
    type: PLATFORM_EVENTS.MARKETING_PLAN_COMPLETED,
    entity: 'marketing_plan',
    entityId: plannerRunId,
    payload: { weekId, inserted: stored.inserted, totalPlanned: contentItems.length },
    source: 'marketing-engine',
  })

  return {
    plannerRunId,
    weekId,
    inserted: stored.inserted,
    skippedDuplicates: stored.skipped,
    totalPlanned: contentItems.length,
    tokensUsed: totalTokens,
  }
}

export { weekIdForDate }
