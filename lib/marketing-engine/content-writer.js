import {
  BRAND,
  COLLECTIONS,
  CONTENT_STRATEGY_MIX,
  CONTENT_TYPES,
} from './constants.js'
import { generateMarketingCopy } from './llm.js'
import { insertContentBatch, upsertCalendarEntry } from './content-store.js'
import { getLatestResearch } from './research-agent.js'
import {
  pickProductForDay,
  buildProductPitchPrompt,
  pitchFallbackBody,
  PRODUCT_PITCHES,
} from './product-pitch.js'

const DAILY_PLATFORM_MAP = [
  { type: CONTENT_TYPES.LINKEDIN_POST, platform: 'linkedin', slot: '10:00', format: 'text', category: 'product_pitch_leadedge' },
  { type: CONTENT_TYPES.FACEBOOK_POST, platform: 'facebook', slot: '11:00', format: 'text', category: 'product_demo' },
  { type: CONTENT_TYPES.INSTAGRAM_POST, platform: 'instagram', slot: '12:00', format: 'text', category: 'product_pitch_retail' },
  { type: CONTENT_TYPES.TWITTER_POST, platform: 'twitter', slot: '13:00', format: 'text', category: 'educational' },
]

function pickCategoryForDay(dayIndex) {
  const expanded = CONTENT_STRATEGY_MIX.flatMap((c) =>
    Array(Math.ceil(c.weight / 5)).fill(c.category),
  )
  return expanded[dayIndex % expanded.length]
}

function scheduleIstToday(slot, date = new Date()) {
  const day = date.toISOString().slice(0, 10)
  const [hh, mm] = slot.split(':').map(Number)
  const utcMinutes = hh * 60 + mm - 330
  const base = new Date(`${day}T00:00:00.000Z`)
  const dayAdjust = utcMinutes < 0 ? -1 : 0
  const mins = ((utcMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
  base.setUTCDate(base.getUTCDate() + dayAdjust)
  base.setUTCHours(Math.floor(mins / 60), mins % 60, 0, 0)
  return { scheduledAt: base.toISOString(), slot }
}

/**
 * Content Writer Agent — generates today's platform posts (brand + product pitches)
 */
export async function runContentWriterAgent(db, orgId, { date = new Date(), skipLlm = false } = {}) {
  const day = date.toISOString().slice(0, 10)
  const existing = await db.collection(COLLECTIONS.CONTENT).countDocuments({
    orgId,
    'metadata.dailyBatch': day,
  })
  if (existing >= DAILY_PLATFORM_MAP.length) {
    return { skipped: true, day, reason: 'already_generated' }
  }

  const research = await getLatestResearch(db, orgId)
  const topicHint = research?.topics?.[0]?.headline || 'AI & automation for Indian businesses'
  const dayIndex = date.getUTCDay()
  const items = []

  for (const spec of DAILY_PLATFORM_MAP) {
    const category = spec.category || pickCategoryForDay(dayIndex)
    const product = pickProductForDay(dayIndex, category)
    const pitchPrompt = buildProductPitchPrompt(product, category)
    const fallback = pitchFallbackBody(product, category)

    const { text, engine, tokensUsed } = await generateMarketingCopy({
      system: `Content Writer for ${BRAND.company}. Products: LeadEdge360 (CRM/AI) and RetailEdge360 (retail). ${pitchPrompt} Tone: professional, simple English, persuasive but honest. Always include ${BRAND.website}. Never invent customer names, logos, or revenue numbers.`,
      user: `Platform: ${spec.platform}. Category: ${category}. Product: ${product.name}. Research topic: ${topicHint}. Max 220 words.`,
      fallback,
      temperature: 0.58,
      skipLlm,
    })

    const { scheduledAt, slot } = scheduleIstToday(spec.slot, date)
    items.push({
      type: spec.type,
      platform: spec.platform,
      format: spec.format,
      product: product.id,
      title: `${product.name} — ${spec.platform} — ${day}`,
      body: text,
      cta: product.cta,
      engine,
      weekId: day,
      scheduledAt,
      slot,
      status: 'scheduled',
      metadata: {
        dailyBatch: day,
        category,
        pitchType: category.includes('pitch') ? 'product_pitch' : category,
        agentId: 'content-writer-agent',
        tokensUsed,
      },
    })
  }

  const stored = await insertContentBatch(db, orgId, items, { weekId: day, plannerRunId: `daily-${day}` })
  for (const doc of stored.docs || []) {
    await upsertCalendarEntry(db, orgId, {
      contentId: doc.id,
      platform: doc.platform,
      scheduledAt: doc.scheduledAt,
      slot: doc.slot,
      status: 'scheduled',
    })
  }

  return {
    skipped: false,
    day,
    inserted: stored.inserted,
    items: stored.docs?.length || 0,
    products: Object.keys(PRODUCT_PITCHES),
  }
}
