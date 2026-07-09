import { randomUUID } from 'crypto'
import { BRAND, VIDEO_DURATIONS_SEC, COLLECTIONS } from './constants.js'
import { generateMarketingJson } from './llm.js'

/**
 * Agent 3 — Video Creator
 * Generates video scripts/briefs for short-form content (30/60/90 sec).
 */
export async function createVideoBriefs(db, orgId, contentItems, { userId = 'system' } = {}) {
  const now = new Date().toISOString()
  const briefs = []

  const videoCandidates = contentItems.filter((c) =>
    ['linkedin_post', 'instagram_post', 'product_tip', 'customer_success_story'].includes(c.type),
  ).slice(0, 15)

  for (const content of videoCandidates) {
    const durationSec = VIDEO_DURATIONS_SEC[briefs.length % VIDEO_DURATIONS_SEC.length]
    const fallback = {
      durationSec,
      hook: `Is your CRM still a spreadsheet?`,
      scenes: [
        { sec: 0, visual: 'Logo animation — AsoftechInsightz', voiceover: 'Growing businesses need smarter sales.' },
        { sec: 8, visual: 'Dashboard mockup', voiceover: 'LeadEdge360 scores leads and automates follow-ups.' },
        { sec: durationSec - 10, visual: 'CTA card', voiceover: 'Book your free growth audit today.' },
      ],
      captions: true,
      logoPlacement: 'bottom-right',
      cta: content.cta,
    }

    const { data, engine, tokensUsed } = await generateMarketingJson({
      system: `Video script writer for ${BRAND.company}. Short-form ${durationSec}s video. Include voiceover, scene list, captions flag. Never invent fake statistics.`,
      user: `Topic: ${content.title}. Source copy: ${String(content.body).slice(0, 300)}`,
      fallback,
    })

    briefs.push({
      id: randomUUID(),
      orgId,
      contentId: content.id,
      durationSec,
      status: 'pending_production',
      script: { ...fallback, ...data },
      engine,
      tokensUsed: tokensUsed || 0,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
  }

  if (briefs.length) {
    await db.collection(COLLECTIONS.VIDEO_BRIEFS).insertMany(briefs, { ordered: false })
  }

  return { created: briefs.length, briefIds: briefs.map((b) => b.id) }
}
