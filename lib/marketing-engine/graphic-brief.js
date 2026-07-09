import { randomUUID } from 'crypto'
import { BRAND, GRAPHIC_SPECS, COLLECTIONS } from './constants.js'
import { generateMarketingJson } from './llm.js'

/**
 * Agent 2 — Graphic Designer AI
 * Creates design briefs + asset records for n8n/Canva/Figma automation.
 */
export async function createGraphicBriefs(db, orgId, contentItems, { userId = 'system', skipLlm = false } = {}) {
  const now = new Date().toISOString()
  const assets = []

  for (const content of contentItems) {
    if (!['infographic', 'instagram_post', 'linkedin_post', 'customer_success_story', 'product_tip'].includes(content.type)
      && content.format !== 'infographic') {
      continue
    }

    const spec = content.platform === 'instagram' ? GRAPHIC_SPECS.square : GRAPHIC_SPECS.landscape
    const fallback = {
      headline: content.title || 'AsoftechInsightz',
      subheadline: content.body?.slice(0, 120) || BRAND.company,
      bullets: ['AI-powered growth', 'Built for Indian SMEs', 'LeadEdge360 + RetailEdge360'],
      cta: content.cta || 'Book a growth audit',
      layout: content.platform === 'instagram' ? 'carousel' : 'banner',
    }

    const { data, engine, tokensUsed } = await generateMarketingJson({
      system: `Graphic design brief for ${BRAND.company}. Colors: blue ${BRAND.primaryColor}, navy ${BRAND.navy}, white. Modern SaaS style. Return JSON only.`,
      user: `Create a design brief for: ${content.type}. Body: ${String(content.body).slice(0, 400)}`,
      fallback,
      skipLlm,
    })

    const asset = {
      id: randomUUID(),
      orgId,
      contentId: content.id,
      type: 'graphic_brief',
      status: 'pending_render',
      spec: { ...spec, format: 'png' },
      brief: {
        ...fallback,
        ...data,
        brand: BRAND,
        logo: BRAND.logo,
        fonts: BRAND.fonts,
      },
      engine,
      tokensUsed: tokensUsed || 0,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    }

    assets.push(asset)
  }

  if (assets.length) {
    await db.collection(COLLECTIONS.ASSETS).insertMany(assets, { ordered: false })
  }

  return { created: assets.length, assetIds: assets.map((a) => a.id) }
}

export async function listPendingAssets(db, orgId, limit = 50) {
  const items = await db.collection(COLLECTIONS.ASSETS)
    .find({ orgId, status: 'pending_render' }, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
  return { items }
}
